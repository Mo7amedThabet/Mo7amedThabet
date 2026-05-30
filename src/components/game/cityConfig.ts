import type { GameUnlock } from "@/context/AppContext";
import { privateProjectsMock, projectsMock } from "@/data/projects";

export const WORLD_W = 1600;
export const WORLD_H = 1200;
export const VIEW_W = 960;
export const VIEW_H = 540;

export type PoiCategory = "home" | "skills" | "certs" | "contact" | "project";
export type BuildingStyle =
  | "villa"
  | "tower"
  | "office"
  | "plaza"
  | "house"
  | "apartment"
  | "gate";

export interface CityBuilding {
  id: string;
  category: PoiCategory;
  unlock: GameUnlock;
  x: number;
  y: number;
  w: number;
  h: number;
  doorX: number;
  doorY: number;
  color: string;
  labelKey: string;
  style: BuildingStyle;
  projectId?: string;
  isPrivate?: boolean;
}

export const ROAD_NODES: { id: string; x: number; y: number }[] = [
  { id: "n1", x: 280, y: 280 },
  { id: "n2", x: 520, y: 280 },
  { id: "n3", x: 800, y: 280 },
  { id: "n4", x: 1080, y: 280 },
  { id: "n5", x: 1320, y: 280 },
  { id: "n6", x: 280, y: 520 },
  { id: "n7", x: 520, y: 520 },
  { id: "n8", x: 800, y: 520 },
  { id: "n9", x: 1080, y: 520 },
  { id: "n10", x: 1320, y: 520 },
  { id: "n11", x: 280, y: 760 },
  { id: "n12", x: 520, y: 760 },
  { id: "n13", x: 800, y: 760 },
  { id: "n14", x: 1080, y: 760 },
  { id: "n15", x: 1320, y: 760 },
  { id: "n16", x: 280, y: 980 },
  { id: "n17", x: 800, y: 980 },
  { id: "n18", x: 1320, y: 980 },
];

export const ROAD_EDGES: [string, string][] = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n3", "n4"],
  ["n4", "n5"],
  ["n6", "n7"],
  ["n7", "n8"],
  ["n8", "n9"],
  ["n9", "n10"],
  ["n11", "n12"],
  ["n12", "n13"],
  ["n13", "n14"],
  ["n14", "n15"],
  ["n16", "n17"],
  ["n17", "n18"],
  ["n1", "n6"],
  ["n2", "n7"],
  ["n3", "n8"],
  ["n4", "n9"],
  ["n5", "n10"],
  ["n6", "n11"],
  ["n7", "n12"],
  ["n8", "n13"],
  ["n9", "n14"],
  ["n10", "n15"],
  ["n11", "n16"],
  ["n13", "n17"],
  ["n15", "n18"],
  ["n8", "n17"],
  ["n12", "n13"],
];

const PROJECT_COLORS = ["#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f472b6"];

function projectBuildings(
  projects: typeof projectsMock,
  baseX: number,
  baseY: number,
  isPrivate: boolean,
): CityBuilding[] {
  const cols = 3;
  return projects.map((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = baseX + col * 98;
    const y = baseY + row * 82;
    const style: BuildingStyle = i % 2 === 0 ? "house" : "apartment";
    return {
      id: `${isPrivate ? "private" : "public"}-project-${p.id}`,
      category: "project" as const,
      unlock: "projects" as GameUnlock,
      x,
      y,
      w: style === "apartment" ? 68 : 78,
      h: style === "apartment" ? 72 : 62,
      doorX: x + 39,
      doorY: y + (style === "apartment" ? 78 : 68),
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
      labelKey: p.name,
      style,
      projectId: p.id,
      isPrivate,
    };
  });
}

export const CITY_BUILDINGS: CityBuilding[] = [
  {
    id: "home",
    category: "home",
    unlock: "home",
    x: 120,
    y: 100,
    w: 150,
    h: 120,
    doorX: 195,
    doorY: 230,
    color: "#c084fc",
    labelKey: "home",
    style: "villa",
  },
  {
    id: "skills-tower",
    category: "skills",
    unlock: "skills",
    x: 600,
    y: 50,
    w: 100,
    h: 180,
    doorX: 650,
    doorY: 240,
    color: "#38bdf8",
    labelKey: "skills",
    style: "tower",
  },
  {
    id: "cert-institute",
    category: "certs",
    unlock: "certs",
    x: 80,
    y: 400,
    w: 140,
    h: 110,
    doorX: 150,
    doorY: 520,
    color: "#fbbf24",
    labelKey: "certs",
    style: "office",
  },
  {
    id: "contact-plaza",
    category: "contact",
    unlock: "contact",
    x: 1260,
    y: 340,
    w: 160,
    h: 100,
    doorX: 1340,
    doorY: 450,
    color: "#34d399",
    labelKey: "contact",
    style: "plaza",
  },
  {
    id: "projects-gate",
    category: "project",
    unlock: "projects",
    x: 900,
    y: 700,
    w: 220,
    h: 48,
    doorX: 1010,
    doorY: 760,
    color: "#a78bfa",
    labelKey: "projectsCompound",
    style: "gate",
  },
  {
    id: "private-gate",
    category: "project",
    unlock: "projects",
    x: 180,
    y: 700,
    w: 200,
    h: 44,
    doorX: 280,
    doorY: 760,
    color: "#f472b6",
    labelKey: "privateCompound",
    style: "gate",
  },
  ...projectBuildings(projectsMock, 960, 800, false),
  ...projectBuildings(privateProjectsMock, 120, 800, true),
];

export const CAR_START = { x: 400, y: 320, angle: 0 };
export const ARRIVE_RADIUS = 58;
