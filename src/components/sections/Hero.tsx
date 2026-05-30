"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, GraduationCap, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { scrollToId } from "@/lib/utils";

export function Hero() {
  const { t } = useApp();

  return (
    <section
      id="hero"
      className="relative min-h-screen scroll-mt-24 px-4 pb-20 pt-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Sparkles className="h-4 w-4" />
            {t.hero.role}
          </motion.div>

          <p className="text-lg text-[var(--text-muted)]">{t.hero.greeting}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{t.hero.name}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-muted)]">
            {t.hero.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToId("projects")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/30"
            >
              {t.hero.ctaProjects}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToId("contact")}
              className="rounded-xl glass-panel px-6 py-3 font-semibold transition hover:border-violet-500/40"
            >
              {t.hero.ctaContact}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-violet-500/20 blur-2xl" />
            <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-violet-400/50 shadow-2xl shadow-violet-500/30 sm:h-72 sm:w-72">
              <Image
                src="/profile.png"
                alt={t.hero.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 224px, 288px"
              />
            </div>
          </div>

          <div className="w-full max-w-md space-y-4">
            <GlassCard className="!p-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                <div>
                  <h3 className="font-semibold">{t.hero.education}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t.hero.educationText}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="!p-4">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                <div>
                  <h3 className="font-semibold">{t.hero.certificates}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
                    {t.hero.certItems.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-violet-400">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
