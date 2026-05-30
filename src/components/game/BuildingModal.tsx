"use client";

import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { CityBuilding } from "./cityConfig";
import type { Project } from "@/data/projects";
import { privateProjectsMock, projectsMock } from "@/data/projects";

function findProject(id?: string) {
  if (!id) return undefined;
  return [...projectsMock, ...privateProjectsMock].find((x) => x.id === id);
}

interface BuildingModalProps {
  building: CityBuilding | null;
  onClose: () => void;
  title: string;
  enterWebsite: string;
  viewSection: string;
  content: {
    heading: string;
    body: string;
    bullets?: string[];
  };
  project?: Project;
  onViewWebsite?: () => void;
}

export function BuildingModal({
  building,
  onClose,
  title,
  enterWebsite,
  viewSection,
  content,
  project,
  onViewWebsite,
}: BuildingModalProps) {
  if (!building) return null;

  const p = project ?? findProject(building.projectId);
  const demoUrl = p?.liveDemo ?? p?.showcaseUrl ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-violet-500/40 glass-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-violet-400">
              {title}
            </p>
            <h3 className="text-xl font-bold">{content.heading}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          {p ? p.description : content.body}
        </p>

        {content.bullets && !p && (
          <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
            {content.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-violet-400">▸</span>
                {b}
              </li>
            ))}
          </ul>
        )}

        {p?.company && (
          <p className="mt-2 text-xs text-amber-400/90">
            {p.company}
            {p.clientName ? ` · ${p.clientName}` : ""}
          </p>
        )}

        {p && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.techStack.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-violet-500/15 px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {onViewWebsite && (
            <button
              type="button"
              onClick={onViewWebsite}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {viewSection}
            </button>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl glass-panel px-4 py-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              {p?.visibility === "private" ? "Showcase" : "Demo"}
            </a>
          )}
          {p?.githubLink && (
            <a
              href={p.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl glass-panel px-4 py-2 text-sm"
            >
              GitHub
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-white/5"
          >
            {enterWebsite}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
