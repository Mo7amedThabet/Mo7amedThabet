"use client";

import { motion } from "framer-motion";
import { fadeUp, tapPress, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

const fastHover = { duration: 0.12, ease: [0.22, 1, 0.36, 1] as const };

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  reveal?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = true,
  reveal = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      variants={reveal ? fadeUp : undefined}
      initial={reveal ? "hidden" : false}
      whileInView={reveal ? "visible" : undefined}
      viewport={reveal ? viewport : undefined}
      transition={{ delay }}
      whileHover={
        hover
          ? { y: -4, scale: 1.015, transition: fastHover }
          : undefined
      }
      whileTap={hover ? tapPress : undefined}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5",
        "light:border-slate-200/80 light:bg-white/70",
        hover &&
          "transition-[transform,box-shadow] duration-150 ease-out hover:shadow-xl",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
