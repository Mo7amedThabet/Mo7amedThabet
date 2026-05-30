"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb,
  Map as MapIcon,
  Navigation,
  Trophy,
  Volume2,
  Zap,
  X,
} from "lucide-react";
import { useApp, type GameUnlock } from "@/context/AppContext";
import { privateProjectsMock, projectsMock } from "@/data/projects";
import { scrollToId } from "@/lib/utils";
import { CarAudioController } from "./gameAudio";
import {
  drawCityBuilding,
  drawCorolla,
  drawNightOverlay,
} from "./cityRender";
import {
  ARRIVE_RADIUS,
  CAR_START,
  CITY_BUILDINGS,
  ROAD_EDGES,
  ROAD_NODES,
  VIEW_H,
  VIEW_W,
  WORLD_H,
  WORLD_W,
  type CityBuilding,
} from "./cityConfig";
import { computeRoute } from "./cityPathfind";
import { GameMapOverlay } from "./GameMapOverlay";
import { BuildingModal } from "./BuildingModal";
import { GameMobileControls } from "./GameMobileControls";

function findProject(id?: string) {
  if (!id) return undefined;
  return [...projectsMock, ...privateProjectsMock].find((p) => p.id === id);
}

const SECTION_ID: Record<GameUnlock, string> = {
  home: "hero",
  skills: "skills",
  certs: "hero",
  projects: "projects",
  contact: "contact",
};

interface Car {
  x: number;
  y: number;
  angle: number;
  speed: number;
}

function circleRectCollide(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

export function PortfolioGame() {
  const { t, locale, setViewMode, gameUnlocks, unlockSection, gameScore, addGameScore } =
    useApp();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef<Car>({ ...CAR_START, speed: 0 });
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const routeRef = useRef<{ x: number; y: number }[]>([]);
  const destRef = useRef<CityBuilding | null>(null);
  const arrivedRef = useRef<string | null>(null);
  const camRef = useRef({ x: 0, y: 0 });
  const audioRef = useRef<CarAudioController | null>(null);
  const lightsRef = useRef(true);
  const hornCooldown = useRef(0);
  const nearbyRef = useRef<CityBuilding | null>(null);
  const hudSpeedRef = useRef(0);
  const gpsDistRef = useRef(0);
  const labelsRef = useRef<Record<string, string>>({});
  const tRef = useRef(t);
  const unlockSectionRef = useRef(unlockSection);
  const addGameScoreRef = useRef(addGameScore);

  const [mapOpen, setMapOpen] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [nearbyBuilding, setNearbyBuilding] = useState<CityBuilding | null>(null);
  const [modalBuilding, setModalBuilding] = useState<CityBuilding | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hudSpeed, setHudSpeed] = useState(0);
  const [gpsDist, setGpsDist] = useState(0);

  const buildingLabels: Record<string, string> = {
    home: t.game.buildings.home,
    skills: t.game.buildings.skills,
    certs: t.game.buildings.certs,
    contact: t.game.buildings.contact,
    projectsCompound: t.game.buildings.projectsCompound,
    privateCompound: t.game.buildings.privateCompound,
  };

  labelsRef.current = buildingLabels;
  tRef.current = t;
  unlockSectionRef.current = unlockSection;
  addGameScoreRef.current = addGameScore;

  useEffect(() => {
    audioRef.current = new CarAudioController();
    return () => audioRef.current?.stop();
  }, []);

  /** Sync HUD from game loop refs — never setState inside requestAnimationFrame */
  useEffect(() => {
    let lastNearId: string | null = null;
    let lastSpeed = -1;
    let lastGps = -1;

    const sync = window.setInterval(() => {
      const nearId = nearbyRef.current?.id ?? null;
      if (nearId !== lastNearId) {
        lastNearId = nearId;
        setNearbyBuilding(nearbyRef.current);
      }
      if (hudSpeedRef.current !== lastSpeed) {
        lastSpeed = hudSpeedRef.current;
        setHudSpeed(lastSpeed);
      }
      if (gpsDistRef.current !== lastGps) {
        lastGps = gpsDistRef.current;
        setGpsDist(lastGps);
      }
    }, 120);

    return () => window.clearInterval(sync);
  }, []);

  const setDestination = useCallback((building: CityBuilding) => {
    destRef.current = building;
    setDestinationId(building.id);
    arrivedRef.current = null;
    routeRef.current = computeRoute(
      carRef.current.x,
      carRef.current.y,
      building,
    );
    setMapOpen(false);
    const label =
      building.projectId != null
        ? building.labelKey
        : buildingLabels[building.labelKey] ?? building.labelKey;
    setToast(`${t.game.gpsTo} ${label}`);
    setTimeout(() => setToast(null), 2200);
  }, [buildingLabels, t.game.gpsTo]);

  const clearRoute = useCallback(() => {
    destRef.current = null;
    routeRef.current = [];
    setDestinationId(null);
  }, []);

  const getNearestBuilding = useCallback((maxDist = 70) => {
    const car = carRef.current;
    let best: CityBuilding | null = null;
    let bestD = maxDist;
    for (const b of CITY_BUILDINGS) {
      if (b.style === "gate") continue;
      const d = Math.hypot(car.x - b.doorX, car.y - b.doorY);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }, []);

  const openBuilding = useCallback(
    (b: CityBuilding) => {
      unlockSection(b.unlock);
      addGameScore(b.projectId ? 120 : 200);
      setModalBuilding(b);
      setToast(`${t.game.collected}`);
      setTimeout(() => setToast(null), 2000);
    },
    [addGameScore, t.game.collected, unlockSection],
  );

  const releaseAllSteer = useCallback(() => {
    keysRef.current.up = false;
    keysRef.current.down = false;
    keysRef.current.left = false;
    keysRef.current.right = false;
  }, []);

  const handleSteer = useCallback((key: "up" | "down" | "left" | "right", active: boolean) => {
    audioRef.current?.start();
    keysRef.current[key] = active;
  }, []);

  useEffect(() => {
    const clear = () => releaseAllSteer();
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [releaseAllSteer]);

  const handleEnterNearby = useCallback(() => {
    const near = getNearestBuilding();
    if (near) openBuilding(near);
  }, [getNearestBuilding, openBuilding]);

  const getModalContent = (b: CityBuilding) => {
    const proj = findProject(b.projectId);
    if (proj) {
      return {
        heading: proj.name,
        body: proj.description,
      };
    }
    if (b.projectId) {
      return {
        heading: b.labelKey,
        body: t.game.projectsBody,
      };
    }
    const map: Record<string, { heading: string; body: string; bullets?: string[] }> = {
      home: {
        heading: t.hero.name,
        body: t.game.homeBody,
        bullets: [...t.hero.certItems],
      },
      skills: { heading: t.skills.title, body: t.game.skillsBody },
      certs: {
        heading: t.hero.certificates,
        body: t.game.certsBody,
        bullets: [...t.hero.certItems],
      },
      contact: { heading: t.contact.title, body: t.game.contactBody },
      projectsCompound: {
        heading: t.projects.title,
        body: t.game.projectsBody,
      },
    };
    return map[b.labelKey] ?? { heading: b.labelKey, body: "" };
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      audioRef.current?.start();

      if (e.key === "m" || e.key === "M") {
        setMapOpen((o) => !o);
        return;
      }
      if (e.key === "l" || e.key === "L") {
        lightsRef.current = !lightsRef.current;
        setLightsOn(lightsRef.current);
        return;
      }
      if (e.key === " " || e.key === "h" || e.key === "H") {
        e.preventDefault();
        const now = Date.now();
        if (now - hornCooldown.current > 400) {
          hornCooldown.current = now;
          audioRef.current?.honk();
        }
        return;
      }
      if (e.key === "e" || e.key === "E") {
        const near = getNearestBuilding();
        if (near) openBuilding(near);
        return;
      }
      if (e.key === "Escape") {
        setMapOpen(false);
        setModalBuilding(null);
        clearRoute();
      }
      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") keysRef.current.up = true;
      if (k === "s" || e.key === "ArrowDown") keysRef.current.down = true;
      if (k === "a" || e.key === "ArrowLeft") keysRef.current.left = true;
      if (k === "d" || e.key === "ArrowRight") keysRef.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") keysRef.current.up = false;
      if (k === "s" || e.key === "ArrowDown") keysRef.current.down = false;
      if (k === "a" || e.key === "ArrowLeft") keysRef.current.left = false;
      if (k === "d" || e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [clearRoute, getNearestBuilding, openBuilding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const CAR_R = 14;
    const MAX_SPEED = 4.2;
    const ACCEL = 0.12;
    const FRICTION = 0.96;
    const TURN = 0.045;

    const nodeMap = new Map(ROAD_NODES.map((n) => [n.id, n]));

    const tick = () => {
      const car = carRef.current;
      const keys = keysRef.current;

      if (keys.up) car.speed = Math.min(MAX_SPEED, car.speed + ACCEL);
      else if (keys.down) car.speed = Math.max(-MAX_SPEED * 0.4, car.speed - ACCEL);
      else car.speed *= FRICTION;

      if (Math.abs(car.speed) < 0.05) car.speed = 0;

      const turnFactor = Math.max(0.35, Math.abs(car.speed) / MAX_SPEED);
      if (keys.left) car.angle -= TURN * turnFactor * Math.sign(car.speed || 1);
      if (keys.right) car.angle += TURN * turnFactor * Math.sign(car.speed || 1);

      const nx = car.x + Math.cos(car.angle) * car.speed;
      const ny = car.y + Math.sin(car.angle) * car.speed;

      let collided = false;
      for (const b of CITY_BUILDINGS) {
        if (b.style === "gate") continue;
        if (circleRectCollide(nx, ny, CAR_R, b.x, b.y, b.w, b.h)) {
          collided = true;
          break;
        }
      }

      if (!collided) {
        car.x = Math.max(CAR_R, Math.min(WORLD_W - CAR_R, nx));
        car.y = Math.max(CAR_R, Math.min(WORLD_H - CAR_R, ny));
      } else {
        car.speed *= 0.5;
      }

      camRef.current.x = Math.max(
        0,
        Math.min(WORLD_W - VIEW_W, car.x - VIEW_W / 2),
      );
      camRef.current.y = Math.max(
        0,
        Math.min(WORLD_H - VIEW_H, car.y - VIEW_H / 2),
      );

      const dest = destRef.current;
      if (dest) {
        const d = Math.hypot(car.x - dest.doorX, car.y - dest.doorY);
        gpsDistRef.current = Math.round(d);
        if (d < ARRIVE_RADIUS && arrivedRef.current !== dest.id) {
          arrivedRef.current = dest.id;
          setToast(tRef.current.game.arrived);
          unlockSectionRef.current(dest.unlock);
          addGameScoreRef.current(150);
        }
      } else {
        gpsDistRef.current = 0;
      }

      nearbyRef.current = getNearestBuilding();
      hudSpeedRef.current = Math.round(Math.abs(car.speed) * 28);
      audioRef.current?.updateEngine(Math.abs(car.speed) / MAX_SPEED);

      const activeDestId = dest?.id ?? null;
      const labels = labelsRef.current;

      const time = Date.now();
      canvas.width = VIEW_W;
      canvas.height = VIEW_H;
      const cam = camRef.current;
      const isDark = document.documentElement.classList.contains("dark");

      ctx.save();
      ctx.translate(-cam.x, -cam.y);

      ctx.fillStyle = isDark ? "#0a1628" : "#1a2e1a";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      for (let gx = 0; gx < WORLD_W; gx += 80) {
        for (let gy = 0; gy < WORLD_H; gy += 80) {
          ctx.fillStyle =
            (gx + gy) % 160 === 0
              ? isDark
                ? "#0d1f35"
                : "#1e3a1e"
              : isDark
                ? "#0c1a2e"
                : "#182e18";
          ctx.fillRect(gx, gy, 80, 80);
        }
      }

      ctx.lineCap = "round";
      ctx.strokeStyle = isDark ? "#334155" : "#4b5563";
      ctx.lineWidth = 52;
      for (const [a, b] of ROAD_EDGES) {
        const na = nodeMap.get(a)!;
        const nb = nodeMap.get(b)!;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      ctx.strokeStyle = isDark ? "#475569" : "#6b7280";
      ctx.lineWidth = 38;
      for (const [a, b] of ROAD_EDGES) {
        const na = nodeMap.get(a)!;
        const nb = nodeMap.get(b)!;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      for (const [a, b] of ROAD_EDGES) {
        const na = nodeMap.get(a)!;
        const nb = nodeMap.get(b)!;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const b of CITY_BUILDINGS) {
        const label =
          b.projectId != null
            ? b.labelKey.slice(0, 12)
            : (labels[b.labelKey] ?? b.labelKey).slice(0, 18);
        drawCityBuilding(
          ctx,
          b,
          label,
          isDark,
          activeDestId === b.id,
          time,
        );
      }

      const route = routeRef.current;
      if (route.length > 1) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(route[0].x, route[0].y);
        for (let i = 1; i < route.length; i++) ctx.lineTo(route[i].x, route[i].y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (dest) {
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.moveTo(dest.doorX, dest.doorY - 16);
        ctx.lineTo(dest.doorX - 10, dest.doorY + 8);
        ctx.lineTo(dest.doorX + 10, dest.doorY + 8);
        ctx.closePath();
        ctx.fill();
      }

      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      drawCorolla(ctx, lightsRef.current, isDark);
      ctx.restore();

      ctx.restore();

      drawNightOverlay(ctx, VIEW_W, VIEW_H, isDark, lightsRef.current);

      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, VIEW_W, 56);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(tRef.current.game.carName, 12, 18);
      if (dest) {
        ctx.fillStyle = "#22d3ee";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "left";
        const destLabel =
          dest.projectId != null
            ? dest.labelKey
            : labels[dest.labelKey] ?? dest.labelKey;
        ctx.fillText(
          `GPS → ${destLabel} (${gpsDistRef.current}m)`,
          12,
          28,
        );
      }

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
    // Game loop runs once; reads live values from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mainUnlocks: GameUnlock[] = [
    "home",
    "skills",
    "certs",
    "projects",
    "contact",
  ];
  const visitedMain = mainUnlocks.filter((k) => gameUnlocks.has(k)).length;

  return (
    <div className="flex min-h-screen flex-col items-center px-2 pb-8 pt-20 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 max-w-3xl text-center"
      >
        <h1 className="text-2xl font-bold text-gradient sm:text-3xl">
          {t.game.title}
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm md:hidden">
          {t.game.hintMobile}
        </p>
        <p className="mt-1 hidden text-xs text-[var(--text-muted)] sm:text-sm md:block">
          {t.game.hint}
        </p>
      </motion.div>

      <div className="mb-3 flex w-full max-w-[960px] flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2 rounded-xl glass-panel px-3 py-1.5 text-sm">
          <Zap className="h-4 w-4 text-amber-400" />
          {t.game.score}: <strong>{gameScore}</strong>
        </div>
        <div className="flex items-center gap-2 rounded-xl glass-panel px-3 py-1.5 text-sm">
          <Trophy className="h-4 w-4 text-violet-400" />
          {t.game.unlocked}: {visitedMain}/5
        </div>
        <div className="rounded-xl glass-panel px-3 py-1.5 text-sm">
          {hudSpeed} {t.game.speed}
        </div>
        <button
          type="button"
          onClick={() => {
            audioRef.current?.start();
            lightsRef.current = !lightsRef.current;
            setLightsOn(lightsRef.current);
          }}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm ${
            lightsOn
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50"
              : "glass-panel"
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          {lightsOn ? t.game.lightsOn : t.game.lightsOff}
        </button>
        <button
          type="button"
          onClick={() => {
            audioRef.current?.start();
            audioRef.current?.honk();
          }}
          className="flex items-center gap-1 rounded-xl glass-panel px-3 py-1.5 text-sm hover:bg-white/10"
        >
          <Volume2 className="h-4 w-4" />
          {t.game.horn}
        </button>
        <button
          type="button"
          onClick={() => {
            audioRef.current?.start();
            setMapOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-violet-500/30"
        >
          <MapIcon className="h-4 w-4" />
          GPS
        </button>
        {destinationId && (
          <button
            type="button"
            onClick={clearRoute}
            className="flex items-center gap-1 rounded-xl glass-panel px-3 py-1.5 text-sm"
          >
            <X className="h-3.5 w-3.5" />
            {t.game.gpsOff}
          </button>
        )}
      </div>

      <div
        className="relative touch-none overflow-hidden rounded-2xl border-2 border-violet-500/40 shadow-2xl shadow-violet-500/20"
        style={{ WebkitTouchCallout: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          className="block max-w-full bg-[#0c1a2e]"
          style={{ width: "min(100vw - 1rem, 960px)", height: "auto" }}
        />
        <GameMobileControls
          onSteer={handleSteer}
          onSteerReleaseAll={releaseAllSteer}
          onEnter={handleEnterNearby}
          showEnter={!!nearbyBuilding && !modalBuilding}
          enterLabel={
            nearbyBuilding
              ? `${t.game.enterBuilding} — ${
                  nearbyBuilding.projectId
                    ? nearbyBuilding.labelKey
                    : buildingLabels[nearbyBuilding.labelKey]
                }`
              : t.game.enterBuilding
          }
          disabled={mapOpen || !!modalBuilding}
        />
        {nearbyBuilding && !modalBuilding && (
          <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-emerald-600/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg md:block">
            {t.game.pressE} —{" "}
            {nearbyBuilding.projectId
              ? nearbyBuilding.labelKey
              : buildingLabels[nearbyBuilding.labelKey]}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
        {t.game.switchHint}
      </p>

      <AnimatePresence>
        {mapOpen && (
          <GameMapOverlay
            open={mapOpen}
            onClose={() => setMapOpen(false)}
            carX={carRef.current.x}
            carY={carRef.current.y}
            destinationId={destinationId}
            onSelectDestination={setDestination}
            labels={buildingLabels}
            title={t.game.mapTitle}
            hint={t.game.mapHint}
            setGpsLabel={t.game.setGps}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalBuilding && (
          <BuildingModal
            building={modalBuilding}
            onClose={() => setModalBuilding(null)}
            title={t.game.title}
            enterWebsite={t.game.enterClose}
            viewSection={t.game.viewSection}
            content={getModalContent(modalBuilding)}
            onViewWebsite={() => {
              setModalBuilding(null);
              setViewMode("website");
              setTimeout(() => {
                scrollToId(
                  modalBuilding.projectId
                    ? "projects"
                    : SECTION_ID[modalBuilding.unlock],
                );
              }, 400);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
          >
            <Navigation className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
