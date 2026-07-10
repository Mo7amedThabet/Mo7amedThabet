"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { HeroPortrait } from "@/components/sections/HeroPortrait";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { scrollToId } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

function TaglineWithHighlights({
  text,
  highlights,
}: {
  text: string;
  highlights: readonly string[];
}) {
  if (!highlights.length) return <>{text}</>;

  const escaped = highlights.map((h) =>
    h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const segments = text.split(pattern).filter(Boolean);

  return (
    <>
      {segments.map((segment, i) => {
        const isHighlight = highlights.some(
          (h) => h.toLowerCase() === segment.toLowerCase(),
        );
        return isHighlight ? (
          <span key={i} className="hero-accent-text font-medium">
            {segment}
          </span>
        ) : (
          <span key={i}>{segment}</span>
        );
      })}
    </>
  );
}

export function Hero() {
  const { t, locale, dir } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { firstName, lastName } = useMemo(() => {
    const parts = t.hero.name.trim().split(/\s+/);
    const first = parts[0] ?? t.hero.name;
    const last = parts.slice(1).join(" ");
    if (locale === "en") {
      return {
        firstName: first.toUpperCase(),
        lastName: last.toUpperCase(),
      };
    }
    return { firstName: first, lastName: last };
  }, [t.hero.name, locale]);

  useGSAP(
    () => {
      if (!contentRef.current) return;

      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.from("[data-hero-cta]", {
        opacity: 0,
        y: 16,
        scale: 0.96,
        duration: 0.6,
        delay: 1.1,
        ease: "back.out(1.4)",
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero-cinematic relative flex min-h-[100svh] scroll-mt-24 items-center overflow-x-clip overflow-y-visible max-lg:min-h-[108svh]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay hero-noise" />
      <div className="pointer-events-none absolute inset-0 hero-cinematic-mesh" />

      <p className="absolute start-6 top-20 z-10 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] md:block lg:start-10">
        MT · PORTFOLIO EDITION ©{new Date().getFullYear()}
      </p>

      <div
        className="relative z-10 mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-6 pb-28 pt-28 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10 md:pb-16 lg:px-12 lg:pb-16"
        dir="ltr"
      >
        <div
          ref={contentRef}
          dir={dir}
          className="relative z-[35] order-1 flex w-full max-w-xl flex-col items-start text-start md:w-[42%] md:max-w-none lg:pe-6"
        >
          <p
            data-hero-fade
            className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-[var(--text-muted)] sm:text-sm"
          >
            {t.hero.greeting}
          </p>

          <h1 className="w-full text-4xl font-bold leading-[0.95] tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            <span className="flex flex-col gap-0 overflow-hidden">
              <SplitLetters
                as="span"
                text={firstName}
                className="block"
                letterClassName="text-[var(--text-primary)]"
                delay={0.25}
                stagger={0.04}
              />
              {lastName ? (
                <SplitLetters
                  as="span"
                  text={lastName}
                  className="block"
                  letterClassName="text-[var(--text-muted)]"
                  delay={0.55}
                  stagger={0.04}
                />
              ) : null}
            </span>
            <span
              data-hero-fade
              className="hero-accent-dot mt-2 inline-block h-3 w-3 rounded-full sm:h-4 sm:w-4"
              aria-hidden
            />
          </h1>

          <p
            data-hero-fade
            className="mt-8 max-w-md text-base leading-relaxed text-[var(--text-muted)] sm:text-lg md:max-w-lg md:text-xl"
          >
            <TaglineWithHighlights
              text={t.hero.tagline}
              highlights={t.hero.taglineHighlights}
            />
          </p>

          <div data-hero-cta className="mt-10">
            <button
              type="button"
              onClick={() => scrollToId("projects")}
              className="hero-cta-btn group inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition"
            >
              {t.hero.ctaProjects}
              <span className="hero-cta-icon flex h-8 w-8 items-center justify-center rounded-full transition group-hover:scale-110">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        <div className="relative z-20 order-2 flex w-full shrink-0 items-center justify-center overflow-visible md:w-[50%] md:justify-end lg:w-[52%]">
          <HeroPortrait />
        </div>
      </div>

      <div className="absolute bottom-8 start-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <span className="text-[10px] uppercase tracking-[0.35em]">
            {t.hero.scrollHint}
          </span>
          <span className="hero-scroll-line h-10 w-px bg-gradient-to-b from-[var(--accent)] to-transparent opacity-80" />
        </div>
      </div>
    </section>
  );
}
