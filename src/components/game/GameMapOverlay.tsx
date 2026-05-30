"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, X } from "lucide-react";
import {
  CITY_BUILDINGS,
  WORLD_H,
  WORLD_W,
  type CityBuilding,
} from "./cityConfig";

interface GameMapOverlayProps {
  open: boolean;
  onClose: () => void;
  carX: number;
  carY: number;
  destinationId: string | null;
  onSelectDestination: (building: CityBuilding) => void;
  labels: Record<string, string>;
  title: string;
  hint: string;
  setGpsLabel: string;
}

export function GameMapOverlay({
  open,
  onClose,
  carX,
  carY,
  destinationId,
  onSelectDestination,
  labels,
  title,
  hint,
  setGpsLabel,
}: GameMapOverlayProps) {
  if (!open) return null;

  const scale = 0.42;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-violet-500/40 bg-[#0c0a14] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Navigation className="h-5 w-5 text-violet-400" />
              {title}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Close map"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-auto p-4">
          <div
            className="relative mx-auto rounded-xl border border-violet-500/30 bg-[#13101f]"
            style={{
              width: WORLD_W * scale,
              height: WORLD_H * scale,
            }}
          >
            {/* Roads preview */}
            <svg
              className="absolute inset-0 opacity-40"
              width={WORLD_W * scale}
              height={WORLD_H * scale}
            >
              <defs>
                <pattern
                  id="grid"
                  width={24 * scale}
                  height={24 * scale}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${24 * scale} 0 L 0 0 0 ${24 * scale}`}
                    fill="none"
                    stroke="rgba(167,139,250,0.15)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Car */}
            <div
              className="absolute z-20 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 ring-2 ring-white shadow-lg"
              style={{ left: carX * scale, top: carY * scale }}
              title="You"
            />

            {/* Buildings */}
            {CITY_BUILDINGS.map((b) => {
              const label =
                b.projectId != null
                  ? b.labelKey
                  : (labels[b.labelKey] ?? b.labelKey);
              const active = destinationId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectDestination(b)}
                  className={`absolute flex flex-col items-center justify-end rounded border text-[8px] font-bold transition hover:scale-105 hover:z-30 ${
                    active
                      ? "z-20 border-emerald-400 ring-2 ring-emerald-400/60"
                      : "border-white/20 hover:border-violet-400"
                  }`}
                  style={{
                    left: b.x * scale,
                    top: b.y * scale,
                    width: Math.max(b.w * scale, 28),
                    height: Math.max(b.h * scale, 22),
                    backgroundColor: `${b.color}44`,
                  }}
                  title={setGpsLabel}
                >
                  <span className="absolute -top-4 max-w-[80px] truncate px-1 text-[7px] text-white">
                    {label}
                  </span>
                  <MapPin
                    className="mb-0.5 h-3 w-3"
                    style={{ color: b.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
