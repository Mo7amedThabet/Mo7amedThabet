"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { HeroPreloader } from "@/components/effects/HeroPreloader";
import { HeroAboutZone } from "@/components/sections/HeroAboutZone";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { PortfolioGame } from "@/components/game/PortfolioGame";
import { gentleTransition } from "@/lib/motion";

export function PortfolioShell() {
  const { viewMode } = useApp();
  const [preloaderDone, setPreloaderDone] = useState(false);
  const onPreloaderComplete = useCallback(() => setPreloaderDone(true), []);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 mesh-bg" />
      <div className="pointer-events-none fixed inset-0 grid-pattern opacity-40" />
      <ParticleBackground />
      <HeroPreloader onComplete={onPreloaderComplete} />
      <Header />

      <AnimatePresence mode="wait">
        {viewMode === "website" ? (
          <motion.main
            key="website"
            initial={{ opacity: 0 }}
            animate={{ opacity: preloaderDone ? 1 : 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={gentleTransition}
            className="relative z-10"
          >
            <HeroAboutZone />
            <Skills />
            <Projects />
            <Contact />
            <Footer />
          </motion.main>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={gentleTransition}
            className="relative z-10"
          >
            <PortfolioGame />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
