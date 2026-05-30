"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { PortfolioGame } from "@/components/game/PortfolioGame";

export function PortfolioShell() {
  const { viewMode } = useApp();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 mesh-bg" />
      <div className="pointer-events-none fixed inset-0 grid-pattern opacity-40" />
      <ParticleBackground />
      <Header />

      <AnimatePresence mode="wait">
        {viewMode === "website" ? (
          <motion.main
            key="website"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <Hero />
            <Skills />
            <Projects />
            <Contact />
            <Footer />
          </motion.main>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            <PortfolioGame />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
