"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Code2,
  ExternalLink,
  Lock,
  Star,
} from "lucide-react";
import type { Project } from "@/data/projects";
import { GlassCard } from "@/components/ui/GlassCard";

interface ProjectCardProps {
  project: Project;
  index: number;
  labels: {
    liveDemo: string;
    source: string;
    stars: string;
    noDemo: string;
    clientProject: string;
    privateRepo: string;
    company: string;
  };
}

export function ProjectCard({ project, index, labels }: ProjectCardProps) {
  const isPrivate = project.visibility === "private";
  const primaryUrl =
    project.showcaseUrl ?? project.liveDemo ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <GlassCard className="flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{project.name}</h3>
          <div className="flex shrink-0 gap-1">
            {isPrivate && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                <Lock className="h-3 w-3" />
                Private
              </span>
            )}
            {project.featured && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                ★
              </span>
            )}
          </div>
        </div>

        {(project.company || project.clientName) && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-violet-300">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span>
              {labels.company}: {project.company ?? project.clientName}
            </span>
          </p>
        )}

        <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.techStack.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {!isPrivate && (project.stars ?? 0) > 0 && (
          <p className="mb-3 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {project.stars} {labels.stars}
          </p>
        )}

        <div className="flex gap-2">
          {isPrivate ? (
            primaryUrl ? (
              <a
                href={primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-2 text-sm font-medium text-white"
              >
                <Building2 className="h-3.5 w-3.5" />
                {labels.clientProject}
              </a>
            ) : (
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500/15 py-2 text-sm font-medium text-amber-300 ring-1 ring-amber-500/30">
                <Building2 className="h-3.5 w-3.5" />
                {labels.clientProject}
              </span>
            )
          ) : project.liveDemo ? (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {labels.liveDemo}
            </a>
          ) : (
            <span className="flex flex-1 items-center justify-center rounded-xl bg-white/5 py-2 text-xs text-[var(--text-muted)]">
              {labels.noDemo}
            </span>
          )}

          {project.githubLink ? (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl glass-panel px-3 py-2 transition hover:border-violet-500/40"
              aria-label={isPrivate ? labels.privateRepo : labels.source}
              title={isPrivate ? labels.privateRepo : labels.source}
            >
              <Code2 className="h-4 w-4" />
            </a>
          ) : isPrivate ? (
            <span
              className="flex items-center justify-center rounded-xl glass-panel px-3 py-2 opacity-50"
              title={labels.privateRepo}
            >
              <Lock className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </GlassCard>
    </motion.div>
  );
}
