"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fadeUp, floatY, viewport } from "@/lib/motion";

export function Footer() {
  const { t } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 px-4 py-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start"
      >
        <motion.p
          className="text-sm text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ delay: 0.05 }}
        >
          © {year} Mohamed Thabet. {t.footer.rights}
        </motion.p>
        <motion.p
          className="flex items-center gap-1 text-sm text-[var(--text-muted)]"
          whileHover={{ scale: 1.03, x: 2 }}
        >
          {t.footer.built}
          <motion.span animate={floatY} className="inline-flex">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          </motion.span>
        </motion.p>
      </motion.div>
    </footer>
  );
}
