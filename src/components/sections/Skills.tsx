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
import { fadeUp, scaleIn, tapPress, viewport } from "@/lib/motion";

const featuredSet = new Set<string>(featuredSkills);

const besideRadarCategories: SkillCategory[] = ["backend", "framework"];
const belowRadarCategories: SkillCategory[] = [
  "language",
  "database",
  "tool",
];

const cardViewport = { once: true, amount: 0.15 as const };

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function polarPoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: roundCoord(cx + r * Math.cos(angle)),
    y: roundCoord(cy + r * Math.sin(angle)),
  };
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const highlight = featuredSet.has(skill.name);
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "min-w-[6.75rem] rounded-2xl glass-panel px-3 py-2.5 text-center",
          highlight && "ring-1 ring-violet-500/50",
        )}
        style={{ borderColor: `${skill.color}44` }}
      >
        <SkillCardContent skill={skill} animated={false} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={cardViewport}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.035, 0.35),
      }}
      whileTap={tapPress}
      className={cn(
        "min-w-[6.75rem] cursor-default rounded-2xl glass-panel px-3 py-2.5 text-center",
        "transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg",
        highlight && "ring-1 ring-violet-500/50",
      )}
      style={{
        borderColor: `${skill.color}44`,
        ["--skill-color" as string]: skill.color,
      }}
    >
      <SkillCardContent skill={skill} index={index} />
    </motion.div>
  );
}

function SkillCardContent({
  skill,
  animated = true,
  index = 0,
}: {
  skill: Skill;
  animated?: boolean;
  index?: number;
}) {
  const bar = (
    <div className="mx-auto mb-1.5 h-1.5 w-10 overflow-hidden rounded-full bg-white/10">
      {animated === false ? (
        <div
          className="h-full rounded-full"
          style={{
            width: `${skill.level}%`,
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
          }}
        />
      ) : (
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={cardViewport}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.05 + Math.min(index * 0.02, 0.2),
          }}
        />
      )}
    </div>
  );

  return (
    <>
      {bar}
      <span className="block text-sm font-semibold leading-tight">
        {skill.name}
      </span>
      <p className="mt-0.5 text-xs tabular-nums text-[var(--text-muted)]">
        {skill.level}%
      </p>
    </>
  );
}

function SkillCategoryBlock({
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
    <div>
      <motion.h3
        initial={{ opacity: 0, x: -6 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={viewport}
        transition={{ duration: 0.25 }}
        className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-400"
      >
        {label}
      </motion.h3>
      <div className="flex flex-wrap justify-center gap-2.5 sm:justify-start">
        {items.map((skill, i) => (
          <SkillCard
            key={skill.name}
            skill={skill}
            index={startIndex + i}
          />
        ))}
      </div>
    </div>
  );
}

function SkillRadar() {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
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
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      {points.map(({ label, skill }) => (
        <text
          key={skill.name}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--text-muted)] text-[8px] font-medium"
        >
          {skill.name.length > 12
            ? skill.name.slice(0, 10) + "…"
            : skill.name}
        </text>
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

        <motion.div
          className="grid items-start gap-8 lg:grid-cols-[280px_1fr]"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <GlassCard hover={false} className="flex flex-col items-center p-4">
            <p className="mb-2 text-center text-xs text-[var(--text-muted)]">
              {t.skills.radarHint}
            </p>
            <SkillRadar />
          </GlassCard>

          <div className="space-y-6">
            {besideRadarCategories.map(renderCategory)}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.35 }}
        >
          {belowRadarCategories.map(renderCategory)}
        </motion.div>
      </div>
    </section>
  );
}
