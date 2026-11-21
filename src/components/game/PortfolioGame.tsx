"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Lightbulb,
  Map as MapIcon,
  Navigation,
  Trophy,
  Volume2,
  Zap,
  X,
} from "lucide-react";
import { useApp, type GameUnlock } from "@/context/AppContext";
import { scrollToId } from "@/lib/utils";
import { BuildingModal } from "./BuildingModal";
import { GameMobileControls } from "./GameMobileControls";
import type { CityBuilding } from "./cityConfig";
import {
  createLandmarks,
  createViceCity,
  type LandmarkId,
  type ViceCityApi,
  type ViceLandmark,
} from "./viceCityEngine";

const SECTION_ID: Record<GameUnlock, string> = {
  home: "hero",
  skills: "skills",
  certs: "hero",
  projects: "projects",
  contact: "contact",
};

function landmarkToBuilding(lm: ViceLandmark): CityBuilding {
  return {
    id: lm.id,
    category:
      lm.id === "projects"
        ? "project"
        : lm.id === "certs"
          ? "certs"
          : lm.id === "skills"
            ? "skills"
            : lm.id === "contact"
              ? "contact"
              : "home",
    unlock: lm.unlock,
    x: lm.pos.x,
    y: lm.pos.z,
    w: lm.size.x,
    h: lm.size.z,
    doorX: lm.door.x,
    doorY: lm.door.z,
    color: lm.neon,
    labelKey: lm.id === "projects" ? "projectsCompound" : lm.id,
    style: lm.id === "skills" ? "tower" : "villa",
  };
}

export function PortfolioGame() {
  const {
    t,
    setViewMode,
    gameUnlocks,
    unlockSection,
    gameScore,
    addGameScore,
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<ViceCityApi | null>(null);
  const landmarksRef = useRef<ViceLandmark[]>([]);

  const [nearbyId, setNearbyId] = useState<LandmarkId | null>(null);
  const [modalLandmark, setModalLandmark] = useState<ViceLandmark | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [hudSpeed, setHudSpeed] = useState(0);
  const [gpsLabel, setGpsLabel] = useState("GPS: Home — About Me");
  const [lightsOn, setLightsOn] = useState(true);
  const [cameraLabel, setCameraLabel] = useState("Chase");
  const [toast, setToast] = useState<string | null>(null);

  const landmarks = useMemo(
    () =>
      createLandmarks({
        names: {
          home: t.game.buildings.home,
          skills: t.game.buildings.skills,
          certs: t.game.buildings.certs,
          projects: t.game.buildings.projectsCompound,
          contact: t.game.buildings.contact,
        },
        descs: {
          home: t.game.homeBody,
          skills: t.game.skillsBody,
          certs: t.game.certsBody,
          projects: t.game.projectsBody,
          contact: t.game.contactBody,
        },
        items: {
          home: [...t.hero.certItems].slice(0, 4),
          skills: ["React / Next.js", "ASP.NET Core", "TypeScript", "Three.js"],
          certs: [...t.hero.certItems],
          projects: ["SOLO Shopify", "CYPRA Smart Home", "Supermarket POS", "Taskeen"],
          contact: ["Email", "WhatsApp", "GitHub", "LinkedIn"],
        },
      }),
    [t],
  );

  landmarksRef.current = landmarks;

  const nearbyLandmark = nearbyId
    ? landmarks.find((l) => l.id === nearbyId) ?? null
    : null;

  const openLandmark = useCallback(
    (lm: ViceLandmark) => {
      const isNew = !gameUnlocks.has(lm.unlock);
      unlockSection(lm.unlock);
      if (isNew) addGameScore(100);
      apiRef.current?.markVisited(lm.id);
      setModalLandmark(lm);
      setMapOpen(false);
      apiRef.current?.setPaused(true);
      setToast(t.game.collected);
      window.setTimeout(() => setToast(null), 1800);
    },
    [addGameScore, gameUnlocks, t.game.collected, unlockSection],
  );

  const closeModal = useCallback(() => {
    setModalLandmark(null);
    apiRef.current?.setPaused(false);
  }, []);

  const releaseAllSteer = useCallback(() => {
    apiRef.current?.releaseKeys();
  }, []);

  const handleSteer = useCallback(
    (key: "up" | "down" | "left" | "right", active: boolean) => {
      const map = {
        up: "KeyW",
        down: "KeyS",
        left: "KeyA",
        right: "KeyD",
      } as const;
      apiRef.current?.setKey(map[key], active);
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const radar = radarRef.current;
    if (!canvas || !radar) return;

    let disposed = false;
    let api: ViceCityApi | null = null;

    const boot = async () => {
      const engine = await import("./viceCityEngine");
      if (disposed || !canvasRef.current || !radarRef.current) return;

      api = engine.createViceCity(
        canvasRef.current,
        radarRef.current,
        landmarksRef.current,
        {
          onNearbyChange: (id) => setNearbyId(id),
          onHud: (hud) => {
            setHudSpeed(hud.speedKmh);
            if (hud.gpsLabel !== "—") setGpsLabel(hud.gpsLabel);
            setLightsOn(hud.lightsOn);
            setCameraLabel(hud.cameraLabel);
          },
        },
      );
      apiRef.current = api;
    };

    void boot();

    return () => {
      disposed = true;
      api?.dispose();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onBlur = () => releaseAllSteer();
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [releaseAllSteer]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "KeyM") {
        setMapOpen((o) => {
          const next = !o;
          apiRef.current?.setPaused(next || !!modalLandmark);
          return next;
        });
        return;
      }
      if (e.code === "KeyL") {
        apiRef.current?.toggleLights();
        return;
      }
      if (e.code === "KeyC") {
        apiRef.current?.cycleCamera();
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        apiRef.current?.triggerHorn();
        return;
      }
      if (e.code === "KeyE" && nearbyLandmark && !modalLandmark) {
        openLandmark(nearbyLandmark);
        return;
      }
      if (e.code === "Escape") {
        setMapOpen(false);
        closeModal();
        return;
      }
      if (
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight"
      ) {
        apiRef.current?.setKey(e.code, true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight"
      ) {
        apiRef.current?.setKey(e.code, false);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [closeModal, modalLandmark, nearbyLandmark, openLandmark]);

  const visitedMain = (
    ["home", "skills", "certs", "projects", "contact"] as GameUnlock[]
  ).filter((k) => gameUnlocks.has(k)).length;

  const modalBuilding = modalLandmark
    ? landmarkToBuilding(modalLandmark)
    : null;

  return (
    <div className="fixed inset-0 z-[15] overflow-hidden bg-[#0f0a1f] pt-16">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ WebkitTouchCallout: "none" }}
      />

      {/* HUD pills */}
      <div className="pointer-events-none absolute left-1/2 top-20 z-20 flex w-[94vw] max-w-5xl -translate-x-1/2 flex-wrap justify-center gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md sm:text-sm">
          <Zap className="h-3.5 w-3.5" />
          {t.game.score}: {gameScore}
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:text-sm">
          <Trophy className="h-3.5 w-3.5 text-fuchsia-400" />
          {t.game.unlocked}: {visitedMain}/5
        </div>
        <div className="rounded-xl border border-white/15 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:text-sm">
          {hudSpeed} {t.game.speed}
        </div>
        <div className="rounded-xl border border-cyan-400/40 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md sm:text-sm">
          {t.game.carName}
        </div>
        <button
          type="button"
          onClick={() => apiRef.current?.toggleLights()}
          className={`pointer-events-auto flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:text-sm ${
            lightsOn
              ? "border-cyan-400/50 text-cyan-300 shadow-[0_0_14px_rgba(0,240,255,0.35)]"
              : "border-white/15 text-slate-300"
          } bg-[#0f0a1f]/78`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {lightsOn ? t.game.lightsOn : t.game.lightsOff}
        </button>
        <button
          type="button"
          onClick={() => apiRef.current?.triggerHorn()}
          className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/15 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:text-sm"
        >
          <Volume2 className="h-3.5 w-3.5" />
          {t.game.horn}
        </button>
        <button
          type="button"
          onClick={() => apiRef.current?.cycleCamera()}
          className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/15 bg-[#0f0a1f]/78 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:text-sm"
        >
          <Camera className="h-3.5 w-3.5" />
          Cam: {cameraLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setMapOpen(true);
            apiRef.current?.setPaused(true);
          }}
          className="pointer-events-auto flex items-center gap-1 rounded-xl border border-fuchsia-400/40 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white sm:text-sm"
        >
          <MapIcon className="h-3.5 w-3.5" />
          Map
        </button>
      </div>

      {/* Radar */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col items-center gap-1.5 sm:bottom-8 sm:left-6">
        <canvas
          ref={radarRef}
          width={180}
          height={180}
          onClick={() => {
            setMapOpen(true);
            apiRef.current?.setPaused(true);
          }}
          className="h-[115px] w-[115px] cursor-pointer rounded-full border-[3px] border-cyan-400/70 bg-[#090d16] shadow-[0_0_25px_rgba(0,240,255,0.3)] sm:h-[156px] sm:w-[156px]"
          title="Fast-Travel Map"
        />
        <div className="max-w-[180px] truncate rounded-full border border-white/15 bg-[#0f0a1f]/78 px-2.5 py-1 text-[10px] font-bold tracking-wide text-cyan-300 backdrop-blur-md sm:text-xs">
          {gpsLabel}
        </div>
      </div>

      {/* Enter prompt */}
      {nearbyLandmark && !modalLandmark && !mapOpen && (
        <button
          type="button"
          onClick={() => openLandmark(nearbyLandmark)}
          className="absolute bottom-28 left-1/2 z-25 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-cyan-400 bg-gradient-to-br from-[#0f0a1f]/92 to-[#311042]/92 px-5 py-3 text-sm font-bold shadow-[0_0_28px_rgba(0,240,255,0.45)] md:bottom-24"
        >
          <span className="rounded-md bg-cyan-400 px-2 py-0.5 font-black text-[#090d16]">
            E
          </span>
          {t.game.enterBuilding} — {nearbyLandmark.name}
        </button>
      )}

      {/* Desktop controls hint */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#0f0a1f]/78 px-4 py-1.5 text-[11px] text-slate-300 backdrop-blur-md md:block">
        {t.game.hint}
      </div>

      <GameMobileControls
        variant="pad"
        onSteer={handleSteer}
        onSteerReleaseAll={releaseAllSteer}
        onEnter={() => nearbyLandmark && openLandmark(nearbyLandmark)}
        showEnter={!!nearbyLandmark && !modalLandmark && !mapOpen}
        enterLabel={
          nearbyLandmark
            ? `${t.game.enterBuilding} — ${nearbyLandmark.name}`
            : t.game.enterBuilding
        }
        disabled={mapOpen || !!modalLandmark}
      />

      {/* Fast-travel map */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#06040f]/75 p-4 backdrop-blur-md"
            onClick={() => {
              setMapOpen(false);
              if (!modalLandmark) apiRef.current?.setPaused(false);
            }}
          >
            <motion.div
              initial={{ y: 16, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              className="relative w-full max-w-lg rounded-[22px] border border-fuchsia-500/45 bg-gradient-to-br from-[#16102b] to-[#0d091c] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setMapOpen(false);
                  if (!modalLandmark) apiRef.current?.setPaused(false);
                }}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mb-2 inline-block rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-bold text-cyan-300">
                VICE GPS
              </p>
              <h2 className="mb-2 bg-gradient-to-r from-white to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                {t.game.mapTitle}
              </h2>
              <p className="mb-4 text-sm text-slate-300">{t.game.mapHint}</p>
              <div className="grid gap-2">
                {landmarks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      apiRef.current?.teleportTo(b.id);
                      setMapOpen(false);
                      apiRef.current?.setPaused(false);
                      setToast(`${t.game.gpsTo} ${b.name}`);
                      window.setTimeout(() => setToast(null), 2000);
                    }}
                    className="flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-left text-sm font-semibold transition hover:border-fuchsia-400 hover:bg-fuchsia-500/15"
                  >
                    <span>📍 {b.name}</span>
                    <span style={{ color: b.neon }} className="text-xs">
                      Fast Travel →
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalBuilding && modalLandmark && (
          <BuildingModal
            building={modalBuilding}
            onClose={closeModal}
            title={t.game.title}
            enterWebsite={t.game.enterClose}
            viewSection={t.game.viewSection}
            content={{
              heading: modalLandmark.name,
              body: modalLandmark.desc,
              bullets: modalLandmark.items,
            }}
            onViewWebsite={() => {
              closeModal();
              setViewMode("website");
              window.setTimeout(() => {
                scrollToId(SECTION_ID[modalLandmark.unlock]);
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
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
          >
            <Navigation className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
