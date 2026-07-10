"use client";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

function MarqueeSequence({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex shrink-0 items-center whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)] sm:text-xs"
        >
          {item}
          <span className="hero-accent-text px-6 sm:px-8" aria-hidden>
            •
          </span>
        </span>
      ))}
    </>
  );
}

export function MarqueeTicker({ className }: { className?: string }) {
  const { t } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(4);

  const baseItems = t.hero.marqueeItems;

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const containerWidth = container.offsetWidth;
      const sequenceWidth = measure.offsetWidth;
      if (!containerWidth || !sequenceWidth) return;

      const needed = Math.max(2, Math.ceil(containerWidth / sequenceWidth) + 1);
      setRepeatCount(needed);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(measure);

    return () => observer.disconnect();
  }, [baseItems]);

  const filledItems = Array.from({ length: repeatCount }, () => baseItems).flat();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden border-y py-3",
        "border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-secondary)_85%,transparent)]",
        className,
      )}
      aria-hidden
    >
      <div
        ref={measureRef}
        className="pointer-events-none absolute flex opacity-0"
        aria-hidden
      >
        <MarqueeSequence items={baseItems} />
      </div>

      <div className="marquee-track flex w-max items-center">
        <div className="flex shrink-0 items-center">
          <MarqueeSequence items={filledItems} />
        </div>
        <div className="flex shrink-0 items-center">
          <MarqueeSequence items={filledItems} />
        </div>
      </div>
    </div>
  );
}
