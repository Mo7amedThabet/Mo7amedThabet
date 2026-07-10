"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

const SESSION_KEY = "portfolio-preloader-seen";

export function HeroPreloader({ onComplete }: { onComplete: () => void }) {
  const { t } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const terminalRef = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      onComplete();
      return;
    }
    setVisible(true);
  }, [onComplete]);

  useGSAP(
    () => {
      if (!visible || !progressRef.current || !counterRef.current) return;

      const circumference = 2 * Math.PI * 88;
      const counter = { value: 0 };
      let msgIndex = 0;

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem(SESSION_KEY, "1");
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.55,
            ease: "power2.inOut",
            onComplete: () => {
              setVisible(false);
              onComplete();
            },
          });
        },
      });

      tl.to(counter, {
        value: 100,
        duration: 2.4,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(counter.value);
          if (counterRef.current) counterRef.current.textContent = String(v);
          if (progressRef.current) {
            const offset =
              circumference - (counter.value / 100) * circumference;
            progressRef.current.style.strokeDashoffset = String(offset);
          }
        },
      });

      const msgTimer = gsap.timeline({ repeat: 5, repeatDelay: 0.35 });
      msgTimer.call(() => {
        if (!terminalRef.current) return;
        terminalRef.current.textContent = t.hero.preloaderMessages[msgIndex];
        msgIndex = (msgIndex + 1) % t.hero.preloaderMessages.length;
      });
    },
    { dependencies: [visible, t], scope: overlayRef },
  );

  if (!visible) return null;

  const circumference = 2 * Math.PI * 88;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <circle
            ref={progressRef}
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[color-mix(in_srgb,var(--accent)_40%,transparent)] sm:h-32 sm:w-32">
          <ProfileAvatar name={t.hero.name} priority sizes="128px" />
        </div>
      </div>

      <p
        ref={terminalRef}
        className="mt-8 min-h-[1.25rem] font-mono text-xs hero-accent-text sm:text-sm"
      >
        {t.hero.preloaderMessages[0]}
      </p>

      <div className="mt-6 flex items-end gap-1 font-mono text-4xl font-bold tabular-nums sm:text-5xl">
        <span ref={counterRef}>0</span>
        <span className="mb-1 text-lg hero-accent-text sm:text-xl">%</span>
      </div>

      <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)]">
        {t.hero.preloaderHint}
      </p>
    </div>
  );
}
