import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { GameUnlock } from "@/context/AppContext";

export type LandmarkId = "home" | "skills" | "certs" | "projects" | "contact";

export interface ViceLandmark {
  id: LandmarkId;
  unlock: GameUnlock;
  name: string;
  pos: THREE.Vector3;
  size: THREE.Vector3;
  door: THREE.Vector3;
  color: number;
  neon: string;
  desc: string;
  items: string[];
}

export interface ViceHudSnapshot {
  speedKmh: number;
  gpsLabel: string;
  lightsOn: boolean;
  cameraMode: number;
  cameraLabel: string;
}

export interface ViceCityHooks {
  onNearbyChange: (id: LandmarkId | null) => void;
  onHud: (hud: ViceHudSnapshot) => void;
}

export interface ViceCityApi {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
  setKey: (code: string, down: boolean) => void;
  releaseKeys: () => void;
  toggleLights: () => void;
  cycleCamera: () => void;
  triggerHorn: () => void;
  teleportTo: (id: LandmarkId) => void;
  markVisited: (id: LandmarkId) => void;
  getLandmark: (id: LandmarkId) => ViceLandmark | undefined;
  getLandmarks: () => ViceLandmark[];
}

const CAMERA_NAMES = ["Chase", "Hood", "Top-2D"] as const;

export function createLandmarks(content: {
  names: Record<LandmarkId, string>;
  descs: Record<LandmarkId, string>;
  items: Record<LandmarkId, string[]>;
}): ViceLandmark[] {
  return [
    {
      id: "home",
      unlock: "home",
      name: content.names.home,
      pos: new THREE.Vector3(-22, 0, -22),
      size: new THREE.Vector3(14, 9, 14),
      door: new THREE.Vector3(-22, 0, -11.5),
      color: 0xa855f7,
      neon: "#c084fc",
      desc: content.descs.home,
      items: content.items.home,
    },
    {
      id: "skills",
      unlock: "skills",
      name: content.names.skills,
      pos: new THREE.Vector3(22, 0, -22),
      size: new THREE.Vector3(13, 24, 13),
      door: new THREE.Vector3(22, 0, -11.5),
      color: 0x06b6d4,
      neon: "#22d3ee",
      desc: content.descs.skills,
      items: content.items.skills,
    },
    {
      id: "certs",
      unlock: "certs",
      name: content.names.certs,
      pos: new THREE.Vector3(-22, 0, 22),
      size: new THREE.Vector3(15, 11, 13),
      door: new THREE.Vector3(-22, 0, 11.5),
      color: 0xf59e0b,
      neon: "#fbbf24",
      desc: content.descs.certs,
      items: content.items.certs,
    },
    {
      id: "projects",
      unlock: "projects",
      name: content.names.projects,
      pos: new THREE.Vector3(22, 0, 22),
      size: new THREE.Vector3(14, 15, 14),
      door: new THREE.Vector3(22, 0, 11.5),
      color: 0xec4899,
      neon: "#f472b6",
      desc: content.descs.projects,
      items: content.items.projects,
    },
    {
      id: "contact",
      unlock: "contact",
      name: content.names.contact,
      pos: new THREE.Vector3(0, 0, -60),
      size: new THREE.Vector3(18, 10, 12),
      door: new THREE.Vector3(0, 0, -50),
      color: 0x10b981,
      neon: "#34d399",
      desc: content.descs.contact,
      items: content.items.contact,
    },
  ];
}

export function createViceCity(
  canvas: HTMLCanvasElement,
  radarCanvas: HTMLCanvasElement,
  landmarks: ViceLandmark[],
  hooks: ViceCityHooks,
): ViceCityApi {
  const keys: Record<string, boolean> = {};
  const visited = new Set<LandmarkId>();
  let paused = false;
  let lightsOn = true;
  let cameraMode = 0;
  let carSpeed = 0;
  let carHeading = Math.PI;
  let steerAngle = 0;
  let hornWave = 0;
  let activeNearby: LandmarkId | null = null;
  let audioCtx: AudioContext | null = null;
  let raf = 0;
  let disposed = false;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x28103c, 0.0085);

  const camera = new THREE.PerspectiveCamera(
    60,
    (canvas.clientWidth || window.innerWidth) /
      (canvas.clientHeight || window.innerHeight),
    0.1,
    450,
  );

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
      canvas.clientWidth || window.innerWidth,
      canvas.clientHeight || window.innerHeight,
    ),
    0.65,
    0.4,
    0.85,
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Sky
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 16;
  skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext("2d")!;
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0.0, "#09061a");
  skyGrad.addColorStop(0.35, "#2e1065");
  skyGrad.addColorStop(0.52, "#be185d");
  skyGrad.addColorStop(0.62, "#fb923c");
  skyGrad.addColorStop(1.0, "#1e1b4b");
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 16, 256);
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(280, 32, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }),
    ),
  );

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(26, 32),
    new THREE.MeshBasicMaterial({ color: 0xff6b4a, fog: false }),
  );
  sunDisc.position.set(0, 28, -220);
  scene.add(sunDisc);

  scene.add(new THREE.HemisphereLight(0xf472b6, 0x1e1b4b, 1.1));
  const sunLight = new THREE.DirectionalLight(0xff9e7d, 2.2);
  sunLight.position.set(45, 65, -55);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 200;
  const d = 85;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(360, 360),
    new THREE.MeshStandardMaterial({ color: 0x131926, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1e222d,
    roughness: 0.55,
    metalness: 0.15,
  });
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x333b4d,
    roughness: 0.8,
  });
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const roadCoords = [-40, 0, 40];

  roadCoords.forEach((coord) => {
    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(13, 180), roadMat);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(coord, 0.02, -10);
    nsRoad.receiveShadow = true;
    scene.add(nsRoad);

    const ewRoad = new THREE.Mesh(new THREE.PlaneGeometry(160, 13), roadMat);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.position.set(0, 0.025, coord);
    ewRoad.receiveShadow = true;
    scene.add(ewRoad);

    for (let z = -90; z <= 70; z += 8) {
      if (Math.abs(z - 40) < 6 || Math.abs(z) < 6 || Math.abs(z + 40) < 6) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 3.5), stripeMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(coord, 0.04, z);
      scene.add(dash);
    }
    for (let x = -72; x <= 72; x += 8) {
      if (Math.abs(x - 40) < 6 || Math.abs(x) < 6 || Math.abs(x + 40) < 6) continue;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.35), stripeMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.04, coord);
      scene.add(dash);
    }
  });

  [
    [-20, -20],
    [20, -20],
    [-20, 20],
    [20, 20],
    [-20, -60],
    [20, -60],
  ].forEach(([bx, bz]) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(25, 0.28, 25), sidewalkMat);
    block.position.set(bx, 0.14, bz);
    block.receiveShadow = true;
    scene.add(block);
  });

  function createPalmTree(x: number, z: number) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.38, 6.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }),
    );
    trunk.position.y = 3.25;
    trunk.rotation.z = (Math.random() - 0.5) * 0.14;
    trunk.castShadow = true;
    group.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.4, 4), leafMat);
      leaf.position.set(0, 6.4, 0);
      leaf.rotation.z = Math.PI / 2.6;
      leaf.rotation.y = (i * Math.PI) / 3;
      leaf.translateY(1.3);
      group.add(leaf);
    }
    group.position.set(x, 0.25, z);
    scene.add(group);
  }

  function createStreetLamp(x: number, z: number, rotY = 0) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 6.2, 8),
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.8,
        roughness: 0.2,
      }),
    );
    pole.position.y = 3.1;
    group.add(pole);

    const bulb = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.16, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
    );
    bulb.position.set(0.4, 6.15, 0);
    group.add(bulb);

    group.position.set(x, 0.25, z);
    group.rotation.y = rotY;
    scene.add(group);
  }

  [-55, -28, -11, 11, 28].forEach((z) => {
    createPalmTree(-7.5, z);
    createPalmTree(7.5, z);
    createStreetLamp(-7.2, z + 3, 0);
    createStreetLamp(7.2, z + 3, Math.PI);
  });

  function makeBuildingLabel(text: string, neonColor: string) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(12, 8, 28, 0.88)";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(16, 20, 480, 88, 24);
    } else {
      ctx.rect(16, 20, 480, 88);
    }
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = neonColor;
    ctx.stroke();
    ctx.font = "bold 34px Segoe UI, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 65);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true }),
    );
    sprite.scale.set(13, 3.25, 1);
    return sprite;
  }

  const checkpointRings: { ring: THREE.Mesh; data: ViceLandmark }[] = [];

  landmarks.forEach((b) => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(b.size.x, b.size.y, b.size.z),
      new THREE.MeshStandardMaterial({
        color: 0x1e1b38,
        metalness: 0.45,
        roughness: 0.3,
      }),
    );
    body.position.set(b.pos.x, b.size.y / 2 + 0.25, b.pos.z);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const neonMat = new THREE.MeshBasicMaterial({ color: b.color });
    const roofTrim = new THREE.Mesh(
      new THREE.BoxGeometry(b.size.x + 0.4, 0.45, b.size.z + 0.4),
      neonMat,
    );
    roofTrim.position.set(b.pos.x, b.size.y + 0.3, b.pos.z);
    group.add(roofTrim);

    const rows = Math.floor(b.size.y / 3.5);
    for (let r = 1; r < rows; r++) {
      const winStrip = new THREE.Mesh(
        new THREE.BoxGeometry(b.size.x + 0.15, 0.55, b.size.z + 0.15),
        neonMat,
      );
      winStrip.position.set(b.pos.x, r * 3.3 + 0.8, b.pos.z);
      group.add(winStrip);
    }

    const label = makeBuildingLabel(b.name, b.neon);
    label.position.set(b.pos.x, b.size.y + 3.2, b.pos.z);
    group.add(label);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.7, 32),
      new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(b.door.x, 0.32, b.door.z);
    group.add(ring);

    const beacon = new THREE.PointLight(b.color, 4, 14);
    beacon.position.set(b.door.x, 2.5, b.door.z);
    group.add(beacon);

    checkpointRings.push({ ring, data: b });
    scene.add(group);
  });

  // Car
  const car = new THREE.Group();
  scene.add(car);
  const carChassis = new THREE.Group();
  car.add(carChassis);

  const paintMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.65,
    roughness: 0.2,
  });
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 4.4), paintMat);
  lowerBody.position.y = 0.68;
  lowerBody.castShadow = true;
  carChassis.add(lowerBody);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.62, 2.25),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 }),
  );
  cabin.position.set(0, 1.32, -0.15);
  cabin.castShadow = true;
  carChassis.add(cabin);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.1, 2.15), paintMat);
  roof.position.set(0, 1.65, -0.15);
  carChassis.add(roof);

  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.12, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x1e293b }),
  );
  spoiler.position.set(0, 1.15, -2.05);
  carChassis.add(spoiler);

  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff1e42 });
  const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.1), headLightMat);
  hlLeft.position.set(-0.68, 0.72, 2.21);
  const hlRight = hlLeft.clone();
  hlRight.position.x = 0.68;
  carChassis.add(hlLeft, hlRight);

  const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.1), tailLightMat);
  tlLeft.position.set(-0.65, 0.75, -2.21);
  const tlRight = tlLeft.clone();
  tlRight.position.x = 0.65;
  carChassis.add(tlLeft, tlRight);

  const underglow = new THREE.PointLight(0x00f0ff, 3.5, 7);
  underglow.position.set(0, 0.3, 0);
  car.add(underglow);

  const spotL = new THREE.SpotLight(0xfef9c3, 45, 42, 0.5, 0.5, 1);
  spotL.position.set(-0.65, 0.8, 2.1);
  spotL.target.position.set(-0.65, 0.2, 16);
  car.add(spotL, spotL.target);

  const spotR = new THREE.SpotLight(0xfef9c3, 45, 42, 0.5, 0.5, 1);
  spotR.position.set(0.65, 0.8, 2.1);
  spotR.target.position.set(0.65, 0.2, 16);
  car.add(spotR, spotR.target);

  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.8,
    roughness: 0.2,
  });

  function makeWheel() {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, wheelMat);
    tire.castShadow = true;
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wGroup.add(tire, rim);
    return wGroup;
  }

  const wheelFLPivot = new THREE.Group();
  wheelFLPivot.position.set(-1.05, 0.4, 1.35);
  const wheelFL = makeWheel();
  wheelFLPivot.add(wheelFL);

  const wheelFRPivot = new THREE.Group();
  wheelFRPivot.position.set(1.05, 0.4, 1.35);
  const wheelFR = makeWheel();
  wheelFRPivot.add(wheelFR);

  const wheelRL = makeWheel();
  wheelRL.position.set(-1.05, 0.4, -1.35);
  const wheelRR = makeWheel();
  wheelRR.position.set(1.05, 0.4, -1.35);
  car.add(wheelFLPivot, wheelFRPivot, wheelRL, wheelRR);

  const hornRing = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    }),
  );
  hornRing.rotation.x = -Math.PI / 2;
  hornRing.position.y = 0.15;
  car.add(hornRing);

  const rCtx = radarCanvas.getContext("2d")!;

  function drawRadar() {
    const w = radarCanvas.width;
    const h = radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 1.25;

    rCtx.clearRect(0, 0, w, h);
    rCtx.fillStyle = "#090d16";
    rCtx.fillRect(0, 0, w, h);

    rCtx.save();
    rCtx.translate(cx, cy);
    rCtx.rotate(carHeading);
    rCtx.translate(-car.position.x * scale, -car.position.z * scale);

    rCtx.fillStyle = "#252b3b";
    roadCoords.forEach((c) => {
      rCtx.fillRect((c - 6.5) * scale, -100 * scale, 13 * scale, 180 * scale);
      rCtx.fillRect(-80 * scale, (c - 6.5) * scale, 160 * scale, 13 * scale);
    });

    landmarks.forEach((b) => {
      rCtx.fillStyle = b.neon;
      rCtx.fillRect(
        (b.pos.x - b.size.x / 2) * scale,
        (b.pos.z - b.size.z / 2) * scale,
        b.size.x * scale,
        b.size.z * scale,
      );
      rCtx.beginPath();
      rCtx.arc(b.door.x * scale, b.door.z * scale, 4.5, 0, Math.PI * 2);
      rCtx.fillStyle = visited.has(b.id) ? "#4ade80" : "#ffffff";
      rCtx.fill();
    });

    rCtx.restore();

    rCtx.save();
    rCtx.translate(cx, cy);
    rCtx.fillStyle = "#00f0ff";
    rCtx.beginPath();
    rCtx.moveTo(0, -8);
    rCtx.lineTo(6, 7);
    rCtx.lineTo(0, 4);
    rCtx.lineTo(-6, 7);
    rCtx.closePath();
    rCtx.fill();
    rCtx.restore();
  }

  function checkCollisions(nextX: number, nextZ: number) {
    if (Math.abs(nextX) > 76 || nextZ > 56 || nextZ < -85) return true;
    const carRadius = 1.65;
    for (const b of landmarks) {
      const halfX = b.size.x / 2 + carRadius;
      const halfZ = b.size.z / 2 + carRadius;
      if (Math.abs(nextX - b.pos.x) < halfX && Math.abs(nextZ - b.pos.z) < halfZ) {
        return true;
      }
    }
    return false;
  }

  function emitHud(speedKmh: number, gpsLabel: string) {
    hooks.onHud({
      speedKmh,
      gpsLabel,
      lightsOn,
      cameraMode,
      cameraLabel: CAMERA_NAMES[cameraMode],
    });
  }

  const clock = new THREE.Clock();

  function animate() {
    if (disposed) return;
    raf = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();

    if (!paused) {
      const forward = keys.KeyW || keys.ArrowUp ? 1 : 0;
      const backward = keys.KeyS || keys.ArrowDown ? 1 : 0;
      const left = keys.KeyA || keys.ArrowLeft ? 1 : 0;
      const right = keys.KeyD || keys.ArrowRight ? 1 : 0;

      const maxSpeed = 34;
      const accel = 26;
      if (forward) carSpeed = Math.min(maxSpeed, carSpeed + accel * dt);
      else if (backward)
        carSpeed = Math.max(-maxSpeed * 0.45, carSpeed - accel * 1.2 * dt);
      else {
        carSpeed *= Math.pow(0.18, dt);
        if (Math.abs(carSpeed) < 0.08) carSpeed = 0;
      }

      const targetSteer = (left - right) * 0.55;
      steerAngle = THREE.MathUtils.lerp(steerAngle, targetSteer, 10 * dt);

      if (Math.abs(carSpeed) > 0.2) {
        const reverseSign = carSpeed >= 0 ? 1 : -1;
        carHeading +=
          steerAngle * (carSpeed / maxSpeed) * 2.6 * dt * reverseSign;
      }

      const vx = Math.sin(carHeading) * carSpeed * dt;
      const vz = Math.cos(carHeading) * carSpeed * dt;

      if (!checkCollisions(car.position.x + vx, car.position.z)) {
        car.position.x += vx;
      } else {
        carSpeed *= -0.3;
      }
      if (!checkCollisions(car.position.x, car.position.z + vz)) {
        car.position.z += vz;
      } else {
        carSpeed *= -0.3;
      }

      car.rotation.y = carHeading;
      carChassis.rotation.z = THREE.MathUtils.lerp(
        carChassis.rotation.z,
        -steerAngle * (carSpeed / maxSpeed) * 0.14,
        8 * dt,
      );
      carChassis.rotation.x = THREE.MathUtils.lerp(
        carChassis.rotation.x,
        (backward - forward) * 0.035,
        8 * dt,
      );

      tailLightMat.color.setHex(backward ? 0xff4d6d : 0x991b1b);

      const wheelSpin = carSpeed * dt * 2.4;
      wheelFLPivot.rotation.y = steerAngle;
      wheelFRPivot.rotation.y = steerAngle;
      [wheelFL, wheelFR, wheelRL, wheelRR].forEach((w) => {
        w.children[0].rotation.x += wheelSpin;
        w.children[1].rotation.x += wheelSpin;
      });

      const kmh = Math.round(Math.abs(carSpeed) * 3.8);

      if (cameraMode === 0) {
        const targetFov = 60 + (kmh / 130) * 16;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 5 * dt);
        camera.updateProjectionMatrix();
        const offset = new THREE.Vector3(0, 4.2, -9.2).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          carHeading,
        );
        camera.position.lerp(car.position.clone().add(offset), 7 * dt);
        camera.lookAt(car.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
      } else if (cameraMode === 1) {
        const hoodPos = car.position
          .clone()
          .add(
            new THREE.Vector3(0, 1.85, 0.5).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              carHeading,
            ),
          );
        const ahead = car.position
          .clone()
          .add(
            new THREE.Vector3(0, 1.4, 15).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              carHeading,
            ),
          );
        camera.position.copy(hoodPos);
        camera.lookAt(ahead);
      } else {
        camera.position.lerp(
          new THREE.Vector3(car.position.x, 34, car.position.z + 10),
          6 * dt,
        );
        camera.lookAt(car.position);
      }

      let nearby: LandmarkId | null = null;
      let nearestUnvisitedId: LandmarkId | null = null;
      let minUnvisitedDist = Infinity;

      checkpointRings.forEach(({ ring, data }) => {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.1;
        ring.scale.set(pulse, pulse, 1);
        const dist = car.position.distanceTo(data.door);
        if (dist < 4.2) nearby = data.id;
        if (!visited.has(data.id) && dist < minUnvisitedDist) {
          minUnvisitedDist = dist;
          nearestUnvisitedId = data.id;
        }
      });

      if (nearby !== activeNearby) {
        activeNearby = nearby;
        hooks.onNearbyChange(nearby);
      }

      const nearestLm = nearestUnvisitedId
        ? landmarks.find((l) => l.id === nearestUnvisitedId)
        : undefined;
      const gpsLabel = nearestLm
        ? `GPS: ${nearestLm.name} (${Math.round(minUnvisitedDist)}m)`
        : "GPS: All 5 Landmarks Visited!";
      emitHud(kmh, gpsLabel);
    }

    if (hornWave > 0) {
      hornWave = Math.max(0, hornWave - dt * 1.8);
      const s = 1 + (1 - hornWave) * 14;
      hornRing.scale.set(s, s, 1);
      (hornRing.material as THREE.MeshBasicMaterial).opacity = hornWave * 0.85;
    }

    drawRadar();
    composer.render();
  }

  function onResize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  }

  window.addEventListener("resize", onResize);
  onResize();
  animate();

  const api: ViceCityApi = {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      composer.dispose();
      renderer.dispose();
    },
    setPaused(p) {
      paused = p;
    },
    setKey(code, down) {
      keys[code] = down;
    },
    releaseKeys() {
      Object.keys(keys).forEach((k) => {
        keys[k] = false;
      });
    },
    toggleLights() {
      lightsOn = !lightsOn;
      spotL.visible = lightsOn;
      spotR.visible = lightsOn;
      headLightMat.color.setHex(lightsOn ? 0xfef08a : 0x475569);
      emitHud(Math.round(Math.abs(carSpeed) * 3.8), "—");
    },
    cycleCamera() {
      cameraMode = (cameraMode + 1) % 3;
      emitHud(
        Math.round(Math.abs(carSpeed) * 3.8),
        `Cam: ${CAMERA_NAMES[cameraMode]}`,
      );
    },
    triggerHorn() {
      hornWave = 1;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)();
        }
        const now = audioCtx.currentTime;
        [420, 525].forEach((freq) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx!.destination);
          osc.start(now);
          osc.stop(now + 0.36);
        });
      } catch {
        /* ignore audio errors */
      }
    },
    teleportTo(id) {
      const b = landmarks.find((x) => x.id === id);
      if (!b) return;
      car.position.set(b.door.x, 0, b.door.z);
      carSpeed = 0;
    },
    markVisited(id) {
      visited.add(id);
    },
    getLandmark(id) {
      return landmarks.find((x) => x.id === id);
    },
    getLandmarks() {
      return landmarks;
    },
  };

  return api;
}
