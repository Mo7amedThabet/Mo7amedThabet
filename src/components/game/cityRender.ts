import type { CityBuilding, BuildingStyle } from "./cityConfig";

function drawWindows(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  lit: boolean,
) {
  const pad = 6;
  const ww = (w - pad * 2) / cols;
  const wh = (h - pad * 2) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const litWindow = lit && (r + c) % 2 === 0;
      ctx.fillStyle = litWindow
        ? "rgba(254, 240, 138, 0.85)"
        : "rgba(30, 41, 59, 0.9)";
      ctx.fillRect(
        x + pad + c * ww + 2,
        y + pad + r * wh + 2,
        ww - 4,
        wh - 4,
      );
    }
  }
}

export function drawCityBuilding(
  ctx: CanvasRenderingContext2D,
  b: CityBuilding,
  label: string,
  isDark: boolean,
  isDestination: boolean,
  time: number,
) {
  const { x, y, w, h, style } = b;

  if (style === "gate") {
    ctx.fillStyle = isDark ? "#4c1d95" : "#6d28d9";
    ctx.fillRect(x, y + 20, w, h - 20);
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 6);
    return;
  }

  const shadow = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.25)";
  ctx.fillStyle = shadow;
  ctx.fillRect(x + 6, y + h, w, 8);

  if (style === "villa") {
    ctx.fillStyle = isDark ? "#334155" : "#e2e8f0";
    ctx.fillRect(x, y + 25, w, h - 25);
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 25);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w + 4, y + 25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = isDark ? "#1e293b" : "#cbd5e1";
    ctx.fillRect(x + w * 0.15, y + 40, w * 0.35, h - 50);
    ctx.fillRect(x + w * 0.55, y + 40, w * 0.3, h - 50);
    drawWindows(ctx, x + 8, y + 35, w - 16, h - 45, 3, 2, isDark);
  } else if (style === "tower") {
    const floors = Math.floor(h / 22);
    ctx.fillStyle = isDark ? "#1e3a5f" : "#94a3b8";
    ctx.fillRect(x + 8, y, w - 16, h);
    for (let f = 0; f < floors; f++) {
      drawWindows(ctx, x + 12, y + 8 + f * 22, w - 24, 18, 4, 1, isDark);
    }
    ctx.fillStyle = b.color;
    ctx.fillRect(x, y, w, 12);
  } else if (style === "office") {
    ctx.fillStyle = isDark ? "#374151" : "#d1d5db";
    ctx.fillRect(x, y + 15, w, h - 15);
    drawWindows(ctx, x + 6, y + 20, w - 12, h - 28, 5, 4, isDark);
    ctx.fillStyle = b.color;
    ctx.fillRect(x, y, w, 18);
  } else if (style === "plaza") {
    ctx.fillStyle = isDark ? "#0f766e" : "#5eead4";
    ctx.fillRect(x, y + 30, w, h - 30);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = isDark ? "#134e4a" : "#99f6e4";
      ctx.fillRect(x + 12 + i * 26, y + 10, 10, h - 20);
    }
    ctx.fillStyle = b.color;
    ctx.fillRect(x, y + 25, w, 8);
  } else if (style === "apartment") {
    ctx.fillStyle = isDark ? "#44403c" : "#a8a29e";
    ctx.fillRect(x + 4, y, w - 8, h);
    drawWindows(ctx, x + 8, y + 8, w - 16, h - 16, 2, 4, isDark);
    ctx.fillStyle = b.color;
    ctx.fillRect(x, y, w, 6);
  } else {
    ctx.fillStyle = isDark ? "#57534e" : "#d6d3d1";
    ctx.fillRect(x, y + 18, w, h - 18);
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + w / 2, y + 4);
    ctx.lineTo(x + w, y + 18);
    ctx.closePath();
    ctx.fill();
    drawWindows(ctx, x + 10, y + 28, w - 20, h - 38, 2, 2, isDark);
  }

  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(x, y + h - 16, w, 16);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 16), x + w / 2, y + h - 5);

  if (isDestination) {
    const pulse = 18 + Math.sin(time / 200) * 5;
    ctx.beginPath();
    ctx.arc(b.doorX, b.doorY, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

/** Top-down Toyota Corolla–style sedan */
export function drawCorolla(
  ctx: CanvasRenderingContext2D,
  lightsOn: boolean,
  isDark: boolean,
) {
  const body = isDark ? "#e2e8f0" : "#f1f5f9";
  const trim = "#94a3b8";
  const glass = isDark ? "#1e3a5f" : "#64748b";

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = body;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(-22, -11, 44, 22, 4);
    ctx.fill();
  } else {
    ctx.fillRect(-22, -11, 44, 22);
  }

  ctx.fillStyle = trim;
  ctx.fillRect(-20, -9, 40, 3);
  ctx.fillRect(-20, 6, 40, 3);

  ctx.fillStyle = glass;
  ctx.fillRect(-6, -8, 18, 16);

  ctx.fillStyle = body;
  ctx.fillRect(14, -7, 8, 14);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(-21, -8, 5, 16);
  ctx.fillRect(16, -8, 5, 16);

  if (lightsOn) {
    ctx.fillStyle = "#fef9c3";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(22, -6);
    ctx.lineTo(95, -28);
    ctx.lineTo(95, 16);
    ctx.lineTo(22, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
    ctx.beginPath();
    ctx.moveTo(22, -4);
    ctx.lineTo(120, -35);
    ctx.lineTo(120, 20);
    ctx.lineTo(22, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.fillRect(20, -5, 4, 3);
    ctx.fillRect(20, 2, 4, 3);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(20, -5, 3, 2);
    ctx.fillRect(20, 3, 3, 2);
  }

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-22, -4, 3, 3);
  ctx.fillRect(-22, 1, 3, 3);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "7px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("COROLLA", 0, 3);
}

export function drawNightOverlay(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  isDark: boolean,
  lightsOn: boolean,
) {
  if (!isDark && !lightsOn) return;
  const alpha = isDark ? 0.42 : lightsOn ? 0.12 : 0;
  if (alpha <= 0) return;
  const grad = ctx.createRadialGradient(
    viewW / 2,
    viewH / 2,
    40,
    viewW / 2,
    viewH / 2,
    Math.max(viewW, viewH) * 0.7,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,10,30,${alpha})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, viewW, viewH);
}
