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
  /** Overlay on canvas (enter only) vs bar below canvas (D-pad) */
  variant?: "pad" | "enter";
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
  "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-violet-400/40 bg-violet-950/90 text-white shadow-md active:scale-95 active:border-cyan-400 active:bg-violet-700 select-none touch-manipulation sm:h-12 sm:w-12";

const spacer = "h-11 w-11 min-h-[44px] min-w-[44px] sm:h-12 sm:w-12";

export function GameMobileControls({
  onSteer,
  onSteerReleaseAll,
  onEnter,
  showEnter,
  enterLabel,
  disabled,
  variant = "pad",
}: GameMobileControlsProps) {
  const releaseAll = () => {
    if (!disabled) onSteerReleaseAll?.();
  };

  if (variant === "enter") {
    if (!showEnter || !onEnter) return null;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onEnter();
        }}
        className="pointer-events-auto absolute right-2 top-2 z-20 flex max-w-[55%] items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white shadow-lg active:scale-95 touch-manipulation select-none md:hidden"
      >
        <DoorOpen className="h-4 w-4 shrink-0" />
        <span className="truncate">{enterLabel}</span>
      </button>
    );
  }

  return (
    <div
      className="mt-2 flex w-full justify-center md:hidden"
      onTouchEnd={releaseAll}
    >
      <div
        className="rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 shadow-lg backdrop-blur-sm"
        role="group"
        aria-label="Drive"
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          <div className={spacer} />
          <button
            type="button"
            aria-label="Forward"
            className={padBtn}
            {...bindSteer("up", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
          <div className={spacer} />
          <button
            type="button"
            aria-label="Turn left"
            className={padBtn}
            {...bindSteer("left", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Reverse"
            className={padBtn}
            {...bindSteer("down", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Turn right"
            className={padBtn}
            {...bindSteer("right", onSteer, onSteerReleaseAll, disabled)}
          >
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
