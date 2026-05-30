"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { Project } from "@/data/projects";
import {
  privateProjectsMock,
  projectsMock,
  getPrivateProjects,
  getPublicProjects,
} from "@/data/projects";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { fadeUp, gentleTransition, hoverLift, tapPress, viewport } from "@/lib/motion";

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
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.projects.title}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{t.projects.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={gentleTransition}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex rounded-xl bg-black/10 p-1 dark:bg-white/5">
            {(["public", "private"] as const).map((key) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                whileHover={{ scale: 1.03 }}
                whileTap={tapPress}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                  tab === key
                    ? key === "public"
                      ? "bg-violet-600 text-white shadow"
                      : "bg-amber-600 text-white shadow"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {key === "public" ? t.projects.tabPublic : t.projects.tabPrivate}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "private" && (
            <motion.p
              key="note"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden text-center text-xs text-[var(--text-muted)]"
            >
              {t.projects.privateNote}
            </motion.p>
          )}
        </AnimatePresence>

        {loading && tab === "public" && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mb-6 text-center text-sm text-[var(--text-muted)]"
          >
            {t.projects.syncing}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={gentleTransition}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {list.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                labels={labels}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
