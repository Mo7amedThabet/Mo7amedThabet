"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export function HeroPortrait() {
  const { t, dir } = useApp();
  const [viewportHeight, setViewportHeight] = useState(1000);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
      setIsDesktop(window.innerWidth >= 768);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const { scrollY } = useScroll();
  const scrollDistance = viewportHeight;
  const isRtl = dir === "rtl";

  const yRaw = useTransform(
    scrollY,
    [0, scrollDistance],
    [0, isDesktop ? scrollDistance * 1.15 : scrollDistance * 0.68],
  );
  const xEnd = isDesktop ? (isRtl ? "54vw" : "-54vw") : isRtl ? "5vw" : "-5vw";
  const xRaw = useTransform(scrollY, [0, scrollDistance], ["0vw", xEnd]);
  const scaleRaw = useTransform(
    scrollY,
    [0, scrollDistance * 0.5, scrollDistance],
    [1, 0.7, isDesktop ? 1.05 : 1],
  );

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(yRaw, springConfig);
  const x = useSpring(xRaw, springConfig);
  const scale = useSpring(scaleRaw, springConfig);

  return (
    <motion.div
      style={{ y, x, scale }}
      className="pointer-events-none flex w-full justify-center overflow-visible md:justify-end"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          scale: { type: "spring", stiffness: 150, damping: 15 },
          opacity: { duration: 1, delay: 0.2 },
          default: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
        }}
        className="hero-portrait-frame relative z-20 flex aspect-square w-full max-w-[min(80vw,460px)] items-center justify-center sm:max-w-[80vw] md:max-w-[min(29rem,42vw)]"
      >
        <div
          data-portrait-glow
          className="absolute inset-[8%] rounded-full opacity-70 blur-2xl"
          style={{ background: "var(--accent-glow)" }}
          aria-hidden
        />
        <div className="hero-avatar-ring relative h-48 w-48 shrink-0 overflow-hidden rounded-full border-2 shadow-2xl sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72">
          <ProfileAvatar
            name={t.hero.name}
            priority
            sizes="(max-width: 768px) 224px, 288px"
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-[color-mix(in_srgb,var(--bg-primary)_22%,transparent)] via-transparent to-transparent" />
        </div>
        <svg
          className="pointer-events-none absolute inset-0 -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="color-mix(in srgb, var(--accent) 18%, transparent)"
            strokeWidth="1.5"
          />
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="120 458"
            className="opacity-80"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
