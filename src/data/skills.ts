export type SkillCategory =
  | "language"
  | "framework"
  | "backend"
  | "database"
  | "tool";

export interface Skill {
  name: string;
  level: number; // 0-100 for radar chart
  color: string;
  category: SkillCategory;
  /** Shown on the radar polygon; keep ≤12 for readable labels */
  showOnRadar?: boolean;
}

export const skills: Skill[] = [
  // Frontend
  { name: "JavaScript", level: 92, color: "#f7df1e", category: "language", showOnRadar: true },
  { name: "TypeScript", level: 86, color: "#3178c6", category: "language", showOnRadar: true },
  { name: "React", level: 90, color: "#61dafb", category: "framework", showOnRadar: true },
  { name: "Next.js", level: 85, color: "#e2e8f0", category: "framework", showOnRadar: true },
  { name: "Tailwind CSS", level: 88, color: "#38bdf8", category: "framework", showOnRadar: true },
  { name: "Bootstrap", level: 80, color: "#8511fa", category: "framework", showOnRadar: false },
  { name: "GSAP", level: 82, color: "#88ce02", category: "framework", showOnRadar: false },
  { name: "Framer Motion", level: 83, color: "#a78bfa", category: "framework", showOnRadar: false },
  { name: "Redux", level: 78, color: "#764abc", category: "framework", showOnRadar: false },
  { name: "React Hook Form", level: 77, color: "#ec5990", category: "framework", showOnRadar: false },
  { name: "Sass", level: 76, color: "#cd6799", category: "tool", showOnRadar: false },
  { name: "HTML5", level: 95, color: "#e34f26", category: "tool", showOnRadar: false },
  { name: "CSS3", level: 90, color: "#1572b6", category: "tool", showOnRadar: false },

  // Backend — .NET & APIs
  { name: "C#", level: 84, color: "#68217a", category: "language", showOnRadar: true },
  { name: "ASP.NET Core", level: 83, color: "#512bd4", category: "backend", showOnRadar: true },
  { name: "ASP.NET Web API", level: 82, color: "#512bd4", category: "backend", showOnRadar: false },
  { name: ".NET", level: 82, color: "#5c2d91", category: "backend", showOnRadar: true },
  { name: "Entity Framework", level: 80, color: "#68217a", category: "backend", showOnRadar: true },
  { name: "REST APIs", level: 85, color: "#34d399", category: "backend", showOnRadar: true },
  { name: "JWT", level: 79, color: "#f59e0b", category: "backend", showOnRadar: false },
  { name: "Swagger", level: 74, color: "#85ea2d", category: "tool", showOnRadar: false },
  { name: "Node.js", level: 76, color: "#68a063", category: "backend", showOnRadar: false },
  { name: "Express.js", level: 73, color: "#68a063", category: "backend", showOnRadar: false },
  { name: "PHP", level: 78, color: "#777bb4", category: "language", showOnRadar: false },
  { name: "Flask", level: 74, color: "#3776ab", category: "backend", showOnRadar: false },

  // Data
  { name: "SQL Server", level: 81, color: "#cc2927", category: "database", showOnRadar: true },
  { name: "PostgreSQL", level: 74, color: "#336791", category: "database", showOnRadar: false },
  { name: "MySQL", level: 76, color: "#4479a1", category: "database", showOnRadar: false },
  { name: "Firebase", level: 70, color: "#ffca28", category: "database", showOnRadar: false },

  // Languages & ML
  { name: "Python", level: 85, color: "#3776ab", category: "language", showOnRadar: true },
  { name: "Machine Learning", level: 75, color: "#ff6f00", category: "tool", showOnRadar: false },
  { name: "TensorFlow", level: 70, color: "#ff6f00", category: "tool", showOnRadar: false },
  { name: "C++", level: 72, color: "#00599c", category: "language", showOnRadar: false },
  { name: "Dart", level: 70, color: "#0175c2", category: "language", showOnRadar: false },
  { name: "Data Structures", level: 82, color: "#a78bfa", category: "tool", showOnRadar: false },

  // DevOps, cloud & integrations (projects / README)
  { name: "Git & GitHub", level: 90, color: "#f05033", category: "tool", showOnRadar: false },
  { name: "Vercel", level: 84, color: "#e2e8f0", category: "tool", showOnRadar: false },
  { name: "Docker", level: 70, color: "#2496ed", category: "tool", showOnRadar: false },
  { name: "Azure", level: 68, color: "#0078d4", category: "tool", showOnRadar: false },
  { name: "AWS", level: 65, color: "#ff9900", category: "tool", showOnRadar: false },
  { name: "Figma", level: 75, color: "#f24e1e", category: "tool", showOnRadar: false },
  { name: "Payment Integration", level: 75, color: "#34d399", category: "tool", showOnRadar: false },
  { name: "SMS Integration", level: 72, color: "#38bdf8", category: "tool", showOnRadar: false },
];

export const radarSkills = skills.filter((s) => s.showOnRadar !== false);

export const skillCategories: SkillCategory[] = [
  "backend",
  "language",
  "framework",
  "database",
  "tool",
];
