"use client";

import { useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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

/** Short labels so text stays inside the radar box */
const radarLabelShort: Record<string, string> = {
  "ASP.NET Core": "ASP.NET",
  "Entity Framework": "EF Core",
  "Tailwind CSS": "Tailwind",
  JavaScript: "JS",
  TypeScript: "TS",
  "REST APIs": "REST",
  "SQL Server": "SQL",
  "Next.js": "Next.js",
};

function radarLabel(name: string) {
  return radarLabelShort[name] ?? (name.length > 11 ? `${name.slice(0, 9)}…` : name);
}

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const highlight = featuredSet.has(skill.name);
  const reduceMotion = useReducedMotion();

  const show = reduceMotion || isInView;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
        delay: show ? Math.min(index * 0.04, 0.4) : 0,
      }}
      whileTap={tapPress}
      className={cn(
        "min-w-[6.75rem] cursor-default rounded-2xl glass-panel px-3 py-2.5 text-center",
        "transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg",
        highlight && "ring-1 ring-violet-500/50",
      )}
      style={{ borderColor: `${skill.color}44` }}
    >
      <div className="mx-auto mb-1.5 h-1.5 w-10 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full w-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
            transformOrigin: "left center",
          }}
          initial={{ scaleX: 0 }}
          animate={show ? { scaleX: skill.level / 100 } : { scaleX: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delay: show ? 0.06 + Math.min(index * 0.02, 0.25) : 0,
          }}
        />
      </div>
      <span className="block text-sm font-semibold leading-tight">{skill.name}</span>
      <p className="mt-0.5 text-xs tabular-nums text-[var(--text-muted)]">
        {skill.level}%
      </p>
    </motion.div>
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
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-400">
        {label}
      </h3>
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

/** Static radar — no animation */
function SkillRadar() {
  const size = 240;
  const center = size / 2;
  /** Chart data radius — labels sit just outside, still inside card */
  const radius = 68;
  const labelRadius = 88;
  const count = radarSkills.length;
  const angleStep = (2 * Math.PI) / count;

  const geometry = useMemo(() => {
    const points = radarSkills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (skill.level / 100) * radius;
      return {
        tip: polarPoint(center, center, r, angle),
        label: polarPoint(center, center, labelRadius, angle),
        skill,
        angle,
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
  }, [angleStep, center, radius, labelRadius]);

  const { points, polygon, gridPolygons, spokes } = geometry;

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto max-h-[260px] max-w-[260px]"
      aria-label="Skills proficiency radar"
    >
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
      <polygon
        points={polygon}
        fill="url(#radarFill)"
        stroke="#a78bfa"
        strokeWidth="2"
        opacity={0.9}
      />
      {points.map(({ label, skill, angle }) => {
        const text = radarLabel(skill.name);
        const isRight = Math.cos(angle) > 0.35;
        const isLeft = Math.cos(angle) < -0.35;
        const anchor = isRight ? "start" : isLeft ? "end" : "middle";
        const dx = isRight ? 4 : isLeft ? -4 : 0;
        return (
          <text
            key={skill.name}
            x={label.x + dx}
            y={label.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-[var(--text-muted)] text-[7px] font-medium sm:text-[8px]"
          >
            {text}
          </text>
        );
      })}
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
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,300px)_1fr]"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <GlassCard
            hover={false}
            reveal={false}
            className="overflow-hidden p-5"
          >
            <p className="mb-3 text-center text-xs text-[var(--text-muted)]">
              {t.skills.radarHint}
            </p>
            <div className="flex justify-center">
              <SkillRadar />
            </div>
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
