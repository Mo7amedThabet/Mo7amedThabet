"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  featuredSkills,
  radarSkills,
  skillCategories,
  skills,
  type Skill,
  type SkillCategory,
} from "@/data/skills";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  fadeUp,
  gentleTransition,
  quickTransition,
  scaleIn,
  skillFloatTransition,
  stagger,
  staggerItem,
  tapPress,
  viewport,
} from "@/lib/motion";

const featuredSet = new Set<string>(featuredSkills);

/** Shown beside the radar on large screens */
const besideRadarCategories: SkillCategory[] = ["backend", "framework"];

/** Shown in the full-width row below */
const belowRadarCategories: SkillCategory[] = [
  "language",
  "database",
  "tool",
];

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function polarPoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: roundCoord(cx + r * Math.cos(angle)),
    y: roundCoord(cy + r * Math.sin(angle)),
  };
}

function SkillCard({
  skill,
  index,
}: {
  skill: Skill;
  index: number;
}) {
  const highlight = featuredSet.has(skill.name);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div variants={staggerItem} className="will-change-transform">
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={skillFloatTransition(index)}
        whileHover={{
          y: -6,
          scale: 1.04,
          boxShadow: `0 12px 32px ${skill.color}40`,
        }}
        whileTap={tapPress}
        className={cn(
          "min-w-[6.75rem] rounded-2xl glass-panel px-3 py-2.5 text-center",
          highlight && "ring-1 ring-violet-500/50",
        )}
        style={{ borderColor: `${skill.color}44` }}
      >
      <div className="mx-auto mb-1.5 h-1.5 w-10 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={viewport}
          transition={{ ...quickTransition, delay: 0.08 + (index % 12) * 0.03 }}
        />
      </div>
      <motion.span
        className="block text-sm font-semibold leading-tight"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ delay: 0.05 + (index % 12) * 0.02 }}
      >
        {skill.name}
      </motion.span>
      <motion.p
        className="mt-0.5 text-xs tabular-nums text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ delay: 0.1 + (index % 12) * 0.02 }}
      >
        {skill.level}%
      </motion.p>
      </motion.div>
    </motion.div>
  );
}

function SkillCategoryBlock({
  category,
  label,
  items,
  startIndex,
}: {
  category: SkillCategory;
  label: string;
  items: Skill[];
  startIndex: number;
}) {
  if (items.length === 0) return null;
  return (
    <motion.div
      key={category}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      <motion.h3
        className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-400"
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={viewport}
        transition={gentleTransition}
      >
        {label}
      </motion.h3>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="flex flex-wrap justify-center gap-2.5 sm:justify-start"
      >
        {items.map((skill, i) => (
          <SkillCard
            key={skill.name}
            skill={skill}
            index={startIndex + i}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function SkillRadar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 44;
  const count = radarSkills.length;
  const angleStep = (2 * Math.PI) / count;

  const geometry = useMemo(() => {
    const points = radarSkills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (skill.level / 100) * radius;
      return {
        tip: polarPoint(center, center, r, angle),
        label: polarPoint(center, center, radius + 22, angle),
        skill,
      };
    });
    return {
      points,
      polygon: points.map((p) => `${p.tip.x},${p.tip.y}`).join(" "),
      gridPolygons: [0.25, 0.5, 0.75, 1].map((scale) =>
        radarSkills
          .map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const pt = polarPoint(center, center, radius * scale, angle);
            return `${pt.x},${pt.y}`;
          })
          .join(" "),
      ),
      spokes: radarSkills.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const end = polarPoint(center, center, radius, angle);
        return { x2: end.x, y2: end.y };
      }),
    };
  }, [angleStep, center, radius]);

  if (!mounted) {
    return (
      <div
        className="mx-auto flex h-[280px] w-[280px] items-center justify-center"
        aria-hidden
      >
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/40 border-t-violet-500" />
      </div>
    );
  }

  const { points, polygon, gridPolygons, spokes } = geometry;

  return (
    <svg width={size} height={size} className="mx-auto overflow-visible">
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
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {points.map(({ label, skill }, i) => (
        <motion.text
          key={skill.name}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--text-muted)] text-[8px] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        >
          {skill.name.length > 12
            ? skill.name.slice(0, 10) + "…"
            : skill.name}
        </motion.text>
      ))}
    </svg>
  );
}

export function Skills() {
  const { t } = useApp();
  let cardIndex = 0;

  const renderCategory = (cat: SkillCategory) => {
    const items = skills.filter((s) => s.category === cat);
    const start = cardIndex;
    cardIndex += items.length;
    return (
      <SkillCategoryBlock
        key={cat}
        category={cat}
        label={t.skills.categories[cat]}
        items={items}
        startIndex={start}
      />
    );
  };

  return (
    <section id="skills" className="scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.skills.title}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t.skills.subtitle}
          </p>
        </motion.div>

        {/* Radar + main stacks beside it */}
        <motion.div
          className="grid items-start gap-8 lg:grid-cols-[280px_1fr]"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <GlassCard hover={false} className="flex flex-col items-center p-4">
              <p className="mb-2 text-center text-xs text-[var(--text-muted)]">
                {t.skills.radarHint}
              </p>
              <SkillRadar />
            </GlassCard>
          </motion.div>

          <div className="space-y-6">
            {besideRadarCategories.map(renderCategory)}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ ...gentleTransition, delay: 0.1 }}
        >
          {belowRadarCategories.map(renderCategory)}
        </motion.div>
      </div>
    </section>
  );
}
