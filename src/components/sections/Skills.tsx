"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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

const featuredSet = new Set<string>(featuredSkills);

const defaultOpenCategories: SkillCategory[] = ["backend", "framework"];

function roundCoord(n: number) {
  return Math.round(n * 100) / 100;
}

function polarPoint(cx: number, cy: number, r: number, angle: number) {
  return {
    x: roundCoord(cx + r * Math.cos(angle)),
    y: roundCoord(cy + r * Math.sin(angle)),
  };
}

function SkillChip({ skill }: { skill: Skill }) {
  const highlight = featuredSet.has(skill.name);
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5",
        highlight && "border-violet-500/40 bg-violet-500/10",
      )}
      style={{ borderColor: highlight ? undefined : `${skill.color}22` }}
    >
      <span
        className="h-1 shrink-0 rounded-full"
        style={{
          width: `${Math.max(skill.level * 0.36, 18)}px`,
          maxWidth: 40,
          background: skill.color,
        }}
      />
      <span className="min-w-0 flex-1 truncate text-xs font-medium">
        {skill.name}
      </span>
      <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-muted)]">
        {skill.level}%
      </span>
    </div>
  );
}

function SkillRadar({ size = 240 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const center = size / 2;
  const radius = size / 2 - 40;
  const count = radarSkills.length;
  const angleStep = (2 * Math.PI) / count;

  const geometry = useMemo(() => {
    const points = radarSkills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (skill.level / 100) * radius;
      return {
        tip: polarPoint(center, center, r, angle),
        label: polarPoint(center, center, radius + 20, angle),
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
        className="mx-auto flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/40 border-t-violet-500" />
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 0.5 }}
      />
      {points.map(({ label, skill }) => (
        <text
          key={skill.name}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--text-muted)] text-[7px] font-medium"
        >
          {skill.name.length > 11
            ? skill.name.slice(0, 9) + "…"
            : skill.name}
        </text>
      ))}
    </svg>
  );
}

function CategoryPanel({
  category,
  label,
  items,
  open,
  onToggle,
}: {
  category: SkillCategory;
  label: string;
  items: Skill[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start transition hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          {label}
        </span>
        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
          {items.length}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={category}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1.5 px-2 pb-2 sm:grid-cols-3">
              {items.map((skill) => (
                <SkillChip key={skill.name} skill={skill} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Skills() {
  const { t } = useApp();
  const [showRadar, setShowRadar] = useState(false);
  const [openCats, setOpenCats] = useState<Set<SkillCategory>>(
    () => new Set(defaultOpenCategories),
  );

  const toggleCat = (cat: SkillCategory) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const expandAll = () => setOpenCats(new Set(skillCategories));
  const collapseAll = () => setOpenCats(new Set(defaultOpenCategories));

  return (
    <section id="skills" className="scroll-mt-24 px-4 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.skills.title}</h2>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            {t.skills.subtitle}
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_1fr] lg:items-start">
          {/* Radar — compact; toggle on mobile */}
          <div className="lg:block">
            <button
              type="button"
              onClick={() => setShowRadar((v) => !v)}
              className="mb-2 flex w-full items-center justify-between rounded-lg glass-panel px-3 py-2 text-xs font-medium lg:hidden"
            >
              {t.skills.radarHint}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showRadar && "rotate-180",
                )}
              />
            </button>
            <GlassCard hover={false} className="hidden p-4 lg:block">
              <p className="mb-2 text-center text-[10px] text-[var(--text-muted)]">
                {t.skills.radarHint}
              </p>
              <SkillRadar size={220} />
            </GlassCard>
            <AnimatePresence>
              {showRadar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden lg:hidden"
                >
                  <GlassCard hover={false} className="p-3">
                    <SkillRadar size={200} />
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skills list — compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                {t.skills.coreStack}
              </p>
              <div className="flex gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="rounded-lg px-2.5 py-1 text-[10px] text-[var(--text-muted)] hover:bg-white/10"
              >
                {t.skills.expandAll}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="rounded-lg px-2.5 py-1 text-[10px] text-[var(--text-muted)] hover:bg-white/10"
              >
                {t.skills.collapseAll}
              </button>
              </div>
            </div>

            {skillCategories.map((cat) => {
              const items = skills.filter((s) => s.category === cat);
              if (items.length === 0) return null;
              return (
                <CategoryPanel
                  key={cat}
                  category={cat}
                  label={t.skills.categories[cat]}
                  items={items}
                  open={openCats.has(cat)}
                  onToggle={() => toggleCat(cat)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
