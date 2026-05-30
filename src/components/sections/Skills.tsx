"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { skills } from "@/data/skills";
import { GlassCard } from "@/components/ui/GlassCard";

/** Stable SVG coords — avoids server/client float drift on hydration */
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

function SkillRadar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 40;
  const count = skills.length;
  const angleStep = (2 * Math.PI) / count;

  const geometry = useMemo(() => {
    const points = skills.map((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (skill.level / 100) * radius;
      const tip = polarPoint(center, center, r, angle);
      const label = polarPoint(center, center, radius + 22, angle);
      return { tip, label, skill };
    });

    const polygon = points.map((p) => `${p.tip.x},${p.tip.y}`).join(" ");

    const gridPolygons = [0.25, 0.5, 0.75, 1].map((scale) =>
      skills
        .map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const pt = polarPoint(center, center, radius * scale, angle);
          return `${pt.x},${pt.y}`;
        })
        .join(" "),
    );

    const spokes = skills.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const end = polarPoint(center, center, radius, angle);
      return { x2: end.x, y2: end.y };
    });

    return { points, polygon, gridPolygons, spokes };
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
            className="fill-[var(--text-muted)] text-[9px] font-medium"
          >
            {skill.name.length > 10
              ? skill.name.slice(0, 8) + "…"
              : skill.name}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function Skills() {
  const { t } = useApp();

  return (
    <section id="skills" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.skills.title}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{t.skills.subtitle}</p>
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <GlassCard hover={false}>
            <SkillRadar />
          </GlassCard>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 12px 32px ${skill.color}33`,
                }}
                className="animate-float cursor-default rounded-2xl glass-panel px-4 py-3 text-center"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  borderColor: `${skill.color}44`,
                }}
              >
                <div
                  className="mx-auto mb-1 h-2 w-12 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${skill.color}, transparent)`,
                  }}
                />
                <span className="font-semibold">{skill.name}</span>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {skill.level}%
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
