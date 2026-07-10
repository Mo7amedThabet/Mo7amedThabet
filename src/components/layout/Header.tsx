"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Globe,
  Menu,
  Moon,
  Sun,
  X,
  Languages,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { cn, scrollToId } from "@/lib/utils";
import { gentleTransition, tapPress } from "@/lib/motion";

export function Header() {
  const { t, locale, setLocale, viewMode, setViewMode } = useApp();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { id: "hero", label: t.nav.home },
    { id: "about", label: t.nav.about },
    { id: "skills", label: t.nav.skills },
    { id: "projects", label: t.nav.projects },
    { id: "contact", label: t.nav.contact },
  ];

  const isDark = mounted && (resolvedTheme ?? theme) === "dark";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={gentleTransition}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <motion.div
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl glass-panel px-4 py-3 shadow-lg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...gentleTransition, delay: 0.08 }}
      >
        <motion.button
          type="button"
          onClick={() => scrollToId("hero")}
          whileHover={{ scale: 1.05 }}
          whileTap={tapPress}
          className="text-lg font-bold tracking-tight text-gradient"
        >
          MT
        </motion.button>

        {viewMode === "website" && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                whileHover={{ y: -2, color: "var(--text-primary)" }}
                whileTap={tapPress}
                className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-violet-500/10"
              >
                {item.label}
              </motion.button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-black/10 p-0.5 dark:bg-white/5">
            <motion.button
              type="button"
              onClick={() => setViewMode("website")}
              whileTap={tapPress}
              whileHover={{ scale: 1.04 }}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-3",
                viewMode === "website"
                  ? "bg-violet-600 text-white shadow"
                  : "text-[var(--text-muted)]",
              )}
              title={t.modes.websiteDesc}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.modes.website}</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setViewMode("game")}
              whileTap={tapPress}
              whileHover={{ scale: 1.04 }}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition sm:px-3",
                viewMode === "game"
                  ? "bg-violet-600 text-white shadow"
                  : "text-[var(--text-muted)]",
              )}
              title={t.modes.gameDesc}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.modes.game}</span>
            </motion.button>
          </div>

          <motion.button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={tapPress}
            className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-violet-500/10 hover:text-violet-500"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span className="sr-only">{locale === "en" ? "AR" : "EN"}</span>
          </motion.button>

          {mounted && (
            <motion.button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              whileHover={{ scale: 1.08, rotate: -12 }}
              whileTap={tapPress}
              className="rounded-xl p-2 text-[var(--text-muted)] transition hover:bg-violet-500/10"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </motion.button>
          )}

          {viewMode === "website" && (
            <motion.button
              type="button"
              className="rounded-xl p-2 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              whileTap={tapPress}
              aria-label="Menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen && viewMode === "website" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl glass-panel p-3 md:hidden"
          >
            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  scrollToId(item.id);
                  setMenuOpen(false);
                }}
                whileHover={{ x: 4 }}
                className="block w-full rounded-lg px-4 py-2 text-start text-sm hover:bg-violet-500/10"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
