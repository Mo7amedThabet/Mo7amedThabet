export interface Skill {
  name: string;
  level: number; // 0-100 for radar chart
  color: string;
  category: "language" | "framework" | "tool";
}

export const skills: Skill[] = [
  { name: "JavaScript", level: 92, color: "#f7df1e", category: "language" },
  { name: "React", level: 90, color: "#61dafb", category: "framework" },
  { name: "Python", level: 85, color: "#3776ab", category: "language" },
  { name: "Tailwind CSS", level: 88, color: "#38bdf8", category: "framework" },
  { name: "HTML5", level: 95, color: "#e34f26", category: "tool" },
  { name: "CSS3", level: 90, color: "#1572b6", category: "tool" },
  { name: "PHP", level: 78, color: "#777bb4", category: "language" },
  { name: "C#", level: 75, color: "#68217a", category: "language" },
  { name: "C++", level: 72, color: "#00599c", category: "language" },
  { name: "Dart", level: 70, color: "#0175c2", category: "language" },
  { name: "Data Structures", level: 82, color: "#a78bfa", category: "tool" },
];
