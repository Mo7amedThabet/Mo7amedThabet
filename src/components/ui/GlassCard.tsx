"use client";

import { motion } from "framer-motion";
import { fadeUp, hoverLift, tapPress, viewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  /** Scroll entrance animation */
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
      whileHover={hover ? hoverLift : undefined}
      whileTap={hover ? tapPress : undefined}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5",
        "light:border-slate-200/80 light:bg-white/70",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
