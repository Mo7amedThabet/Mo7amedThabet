"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Footer() {
  const { t } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 px-4 py-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-start"
      >
        <p className="text-sm text-[var(--text-muted)]">
          © {year} Mohamed Thabet. {t.footer.rights}
        </p>
        <motion.p
          className="flex items-center gap-1 text-sm text-[var(--text-muted)]"
          whileHover={{ scale: 1.02 }}
        >
          {t.footer.built}
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
        </motion.p>
      </motion.div>
    </footer>
  );
}
