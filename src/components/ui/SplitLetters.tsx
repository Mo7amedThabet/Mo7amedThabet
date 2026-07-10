"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitLettersProps {
  text: string;
  className?: string;
  letterClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function SplitLetters({
  text,
  className,
  letterClassName,
  delay = 0,
  stagger: staggerMs = 0.035,
  as: Tag = "span",
}: SplitLettersProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = rootRef.current?.querySelectorAll("[data-letter]");
      if (!letters?.length) return;

      gsap.fromTo(
        letters,
        { opacity: 0, y: 48, rotateX: -40 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.65,
          stagger: staggerMs,
          delay,
          ease: "power3.out",
        },
      );
    },
    { scope: rootRef, dependencies: [text, delay, staggerMs] },
  );

  return (
    <Tag ref={rootRef as never} className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          data-letter
          className={cn(
            "inline-block will-change-transform",
            char === " " && "w-[0.35em]",
            letterClassName,
          )}
          style={{ opacity: 0 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
