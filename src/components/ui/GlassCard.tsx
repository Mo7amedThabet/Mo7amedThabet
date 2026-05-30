"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
