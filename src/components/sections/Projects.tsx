"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { Project } from "@/data/projects";
import {
  privateProjectsMock,
  projectsMock,
  getPrivateProjects,
  getPublicProjects,
} from "@/data/projects";
import { ProjectCard } from "@/components/sections/ProjectCard";

type Tab = "public" | "private";

export function Projects() {
  const { t } = useApp();
  const [publicProjects, setPublicProjects] = useState<Project[]>(projectsMock);
  const [tab, setTab] = useState<Tab>("public");
  const [loading, setLoading] = useState(true);

  const privateProjects = useMemo(() => privateProjectsMock, []);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => {
        if (data.projects?.length) {
          const pub = getPublicProjects(
            data.projects.map((p) => ({ ...p, visibility: "public" as const })),
          );
          if (pub.length) setPublicProjects(pub);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const labels = {
    liveDemo: t.projects.liveDemo,
    source: t.projects.source,
    stars: t.projects.stars,
    noDemo: t.projects.noDemo,
    clientProject: t.projects.clientProject,
    privateRepo: t.projects.privateRepo,
    company: t.projects.company,
  };

  const list = tab === "public" ? publicProjects : privateProjects;

  return (
    <section id="projects" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.projects.title}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{t.projects.subtitle}</p>
        </motion.div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-xl bg-black/10 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTab("public")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                tab === "public"
                  ? "bg-violet-600 text-white shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.projects.tabPublic}
            </button>
            <button
              type="button"
              onClick={() => setTab("private")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                tab === "private"
                  ? "bg-amber-600 text-white shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.projects.tabPrivate}
            </button>
          </div>
        </div>

        {tab === "private" && (
          <p className="mb-6 text-center text-xs text-[var(--text-muted)]">
            {t.projects.privateNote}
          </p>
        )}

        {loading && tab === "public" && (
          <p className="mb-6 text-center text-sm text-[var(--text-muted)]">
            {t.projects.syncing}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              labels={labels}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
