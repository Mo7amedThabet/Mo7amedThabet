"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  featuredSkills,
  radarSkills,
  skillCategories,
  skills,
  type Skill,
} from "@/data/skills";
import { GlassCard } from "@/components/ui/GlassCard";

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function polarPoint(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: roundCoord(cx + r * Math.cos(angle)),
    y: roundCoord(cy + r * Math.sin(angle)),
  };
}

function SkillCard({
  skill,
  index,
  highlight = false,
}: {
  skill: Skill;
  index: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      whileHover={{
        y: -6,
        boxShadow: `0 12px 32px ${skill.color}33`,
      }}
      className={`animate-float min-w-[7.5rem] cursor-default rounded-2xl px-4 py-3 text-center ${
        highlight
          ? "glass-panel ring-2 ring-violet-500/60"
          : "glass-panel"
      }`}
      style={{
        animationDelay: `${index * 0.12}s`,
        borderColor: `${skill.color}44`,
      }}
    >
      <div
        className="mx-auto mb-1 h-2 w-12 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${skill.color}, transparent)`,
        }}
      />
      <span className="text-sm font-semibold">{skill.name}</span>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{skill.level}%</p>
    </motion.div>
  );
}

function SkillRadar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 48;
  const count = radarSkills.length;
  const angleStep = (2 * Math.PI) / count;

  const geometry = useMemo(() => {
    const points = radarSkills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (skill.level / 100) * radius;
      const tip = polarPoint(center, center, r, angle);
      const label = polarPoint(center, center, radius + 26, angle);
      return { tip, label, skill };
    });

    const polygon = points.map((p) => `${p.tip.x},${p.tip.y}`).join(" ");

    const gridPolygons = [0.25, 0.5, 0.75, 1].map((scale) =>
      radarSkills
        .map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const pt = polarPoint(center, center, radius * scale, angle);
          return `${pt.x},${pt.y}`;
        })
        .join(" "),
    );

    const spokes = radarSkills.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const end = polarPoint(center, center, radius, angle);
      return { x2: end.x, y2: end.y };
    });

    return { points, polygon, gridPolygons, spokes };
  }, [angleStep, center, radius]);

  if (!mounted) {
    return (
      <div
        className="mx-auto flex h-[300px] w-[300px] items-center justify-center"
        aria-hidden
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/40 border-t-violet-500" />
      </div>
    );
  }

  const { points, polygon, gridPolygons, spokes } = geometry;

  return (
    <div className="relative mx-auto flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="currentColor"
            className="text-violet-500/20"
            strokeWidth="1"
          />
        ))}
        {spokes.map((spoke, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={spoke.x2}
            y2={spoke.y2}
            className="stroke-violet-500/15"
            strokeWidth="1"
          />
        ))}
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <motion.polygon
          points={polygon}
          fill="url(#radarFill)"
          stroke="#a78bfa"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 0.6 }}
        />
        {points.map(({ label, skill }) => (
          <text
            key={skill.name}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`font-medium ${
              skill.category === "backend"
                ? "fill-violet-300 text-[8px]"
                : "fill-[var(--text-muted)] text-[8px]"
            }`}
          >
            {skill.name.length > 14
              ? skill.name.slice(0, 12) + "…"
              : skill.name}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function Skills() {
  const { t } = useApp();

  const highlighted = featuredSkills
    .map((name) => skills.find((s) => s.name === name))
    .filter((s): s is Skill => s != null);

  let cardIndex = 0;

  return (
    <section id="skills" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.skills.title}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{t.skills.subtitle}</p>
        </motion.div>

        {/* Core stack — visible immediately (matches card grid in design) */}
        <div className="mb-10">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-violet-400">
            {t.skills.coreStack}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {highlighted.map((skill, i) => (
              <SkillCard key={skill.name} skill={skill} index={i} highlight />
            ))}
          </div>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          <GlassCard hover={false} className="lg:sticky lg:top-24">
            <p className="mb-3 text-center text-xs font-medium text-[var(--text-muted)]">
              {t.skills.radarHint}
            </p>
            <SkillRadar />
          </GlassCard>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {skillCategories.map((cat) => {
              const items = skills.filter((s) => s.category === cat);
              if (items.length === 0) return null;
              const label = t.skills.categories[cat];
              return (
                <div key={cat} className="contents">
                  <h3 className="w-full pt-2 text-sm font-semibold uppercase tracking-wider text-violet-400">
                    {label}
                  </h3>
                  {items.map((skill) => {
                    const idx = cardIndex++;
                    return (
                      <SkillCard key={skill.name} skill={skill} index={idx} />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
