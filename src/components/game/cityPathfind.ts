import {
  CITY_BUILDINGS,
  ROAD_EDGES,
  ROAD_NODES,
  type CityBuilding,
} from "./cityConfig";

const nodeMap = new Map(ROAD_NODES.map((n) => [n.id, n]));

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function nearestNode(x: number, y: number) {
  let best = ROAD_NODES[0];
  let bestD = Infinity;
  for (const n of ROAD_NODES) {
    const d = dist(x, y, n.x, n.y);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

function buildGraph() {
  const adj = new Map<string, { id: string; cost: number }[]>();
  for (const n of ROAD_NODES) adj.set(n.id, []);
  for (const [a, b] of ROAD_EDGES) {
    const na = nodeMap.get(a)!;
    const nb = nodeMap.get(b)!;
    const c = dist(na.x, na.y, nb.x, nb.y);
    adj.get(a)!.push({ id: b, cost: c });
    adj.get(b)!.push({ id: a, cost: c });
  }
  return adj;
}

const ADJ = buildGraph();

/** A* on road network → polyline for GPS */
export function computeRoute(
  fromX: number,
  fromY: number,
  building: CityBuilding,
): { x: number; y: number }[] {
  const toX = building.doorX;
  const toY = building.doorY;
  const start = nearestNode(fromX, fromY);
  const end = nearestNode(toX, toY);

  const open = new Set([start.id]);
  const cameFrom = new Map<string, string>();
  const g = new Map<string, number>([[start.id, 0]]);
  const f = new Map<string, number>([
    [start.id, dist(start.x, start.y, end.x, end.y)],
  ]);

  while (open.size > 0) {
    let current = [...open].sort((a, b) => (f.get(a) ?? Infinity) - (f.get(b) ?? Infinity))[0];
    if (current === end.id) {
      const path: { x: number; y: number }[] = [];
      let c: string | undefined = current;
      while (c) {
        const n = nodeMap.get(c)!;
        path.unshift({ x: n.x, y: n.y });
        c = cameFrom.get(c);
      }
      path.push({ x: toX, y: toY });
      return path;
    }
    open.delete(current);
    const curNode = nodeMap.get(current)!;
    for (const edge of ADJ.get(current) ?? []) {
      const tentative = (g.get(current) ?? Infinity) + edge.cost;
      if (tentative < (g.get(edge.id) ?? Infinity)) {
        cameFrom.set(edge.id, current);
        g.set(edge.id, tentative);
        const nb = nodeMap.get(edge.id)!;
        f.set(
          edge.id,
          tentative + dist(nb.x, nb.y, end.x, end.y),
        );
        open.add(edge.id);
      }
    }
  }

  return [
    { x: fromX, y: fromY },
    { x: toX, y: toY },
  ];
}

export function getBuildingById(id: string) {
  return CITY_BUILDINGS.find((b) => b.id === id);
}
