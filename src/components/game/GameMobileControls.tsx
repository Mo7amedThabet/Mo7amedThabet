"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  DoorOpen,
} from "lucide-react";

type SteerKey = "up" | "down" | "left" | "right";

interface GameMobileControlsProps {
  onSteer: (key: SteerKey, active: boolean) => void;
  onSteerReleaseAll?: () => void;
  onEnter?: () => void;
  showEnter: boolean;
  enterLabel: string;
  disabled?: boolean;
}

function bindSteer(
  key: SteerKey,
  onSteer: (key: SteerKey, active: boolean) => void,
  onReleaseAll: (() => void) | undefined,
  disabled?: boolean,
) {
  const press = (e: React.SyntheticEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    onSteer(key, true);
  };
  const release = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSteer(key, false);
  };
  return {
    onPointerDown: press,
    onPointerUp: release,
    onPointerCancel: release,
    onTouchStart: press,
    onTouchEnd: release,
    onTouchCancel: release,
    onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
    onLostPointerCapture: () => {
      onSteer(key, false);
      onReleaseAll?.();
    },
  };
}

const padBtn =
  "flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-violet-400/50 bg-violet-950/85 text-white shadow-xl active:scale-95 active:border-cyan-400 active:bg-violet-700 select-none touch-manipulation";

export function GameMobileControls({
  onSteer,
  onSteerReleaseAll,
  onEnter,
  showEnter,
  enterLabel,
  disabled,
}: GameMobileControlsProps) {
  const releaseAll = () => {
    if (!disabled) onSteerReleaseAll?.();
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex md:hidden items-end justify-between gap-2 p-3 pb-4"
      onTouchEnd={releaseAll}
    >
      {/* Direction pad — always visible on mobile */}
      <div
        className="pointer-events-auto rounded-2xl border border-white/15 bg-black/50 p-2 shadow-2xl backdrop-blur-md"
        role="group"
        aria-label="Drive"
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
          <div className="h-14 w-14" />
          <button
            type="button"
            aria-label="Forward"
            className={padBtn}
            {...bindSteer("up", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowUp className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <div className="h-14 w-14" />
          <button
            type="button"
            aria-label="Turn left"
            className={padBtn}
            {...bindSteer("left", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowLeft className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Reverse"
            className={padBtn}
            {...bindSteer("down", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowDown className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Turn right"
            className={padBtn}
            {...bindSteer("right", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowRight className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showEnter && onEnter && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onEnter();
          }}
          className="pointer-events-auto flex max-w-[min(46vw,220px)] items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg active:scale-95 touch-manipulation select-none"
        >
          <DoorOpen className="h-5 w-5 shrink-0" />
          <span className="truncate">{enterLabel}</span>
        </button>
      )}
    </div>
  );
}
