import type { Project } from "@/data/projects";
import { projectsMock } from "@/data/projects";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

const LANG_TO_STACK: Record<string, string[]> = {
  JavaScript: ["JavaScript", "React"],
  TypeScript: ["TypeScript", "React"],
  CSS: ["CSS3", "HTML5"],
  Python: ["Python"],
  PHP: ["PHP"],
  "C#": ["C#"],
  "C++": ["C++"],
  Dart: ["Dart"],
};

function repoToProject(repo: GitHubRepo): Project {
  const lang = repo.language ?? "Web";
  const stack = LANG_TO_STACK[lang] ?? [lang, "Web Development"];

  return {
    id: String(repo.id),
    name: repo.name.replace(/-/g, " ").replace(/_/g, " "),
    description:
      repo.description ??
      `Open-source project on GitHub — ${repo.name}`,
    techStack: stack,
    liveDemo: repo.homepage || null,
    githubLink: repo.html_url,
    visibility: "public",
    stars: repo.stargazers_count,
    language: repo.language,
  };
}

/** Fetch public repos; falls back to mock data on failure */
export async function fetchGitHubProjects(
  username = "Mo7amedThabet",
): Promise<Project[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return projectsMock;

    const repos: GitHubRepo[] = await res.json();
    const filtered = repos.filter(
      (r) =>
        !r.fork &&
        r.name.toLowerCase() !== username.toLowerCase() &&
        r.name !== "thabet",
    );

    if (filtered.length === 0) return projectsMock;

    const mapped = filtered.map(repoToProject);
    const featuredNames = new Set(
      projectsMock.filter((p) => p.featured).map((p) => p.githubLink),
    );

    return mapped
      .map((p) => ({
        ...p,
        featured: featuredNames.has(p.githubLink) || !!p.liveDemo,
      }))
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.stars ?? 0) - (a.stars ?? 0);
      });
  } catch {
    return projectsMock;
  }
}
