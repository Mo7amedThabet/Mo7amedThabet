/** Portfolio project — public GitHub or private/client work */
export type ProjectVisibility = "public" | "private";

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  /** Public live URL — for private/client use `showcaseUrl` or null */
  liveDemo: string | null;
  /** Public repo URL; null if NDA / no link */
  githubLink: string | null;
  visibility: ProjectVisibility;
  /** Company or organization name */
  company?: string;
  /** Client label (can be confidential) */
  clientName?: string;
  /** Staging / internal demo for client projects */
  showcaseUrl?: string | null;
  stars?: number;
  language?: string | null;
  featured?: boolean;
}

/** Public repos — synced via /api/github */
export const projectsMock: Project[] = [
  {
    id: "filmbeam",
    name: "FILMBEAM",
    description:
      "Responsive movie web app with TMDB API — dynamic carousels, animated cards, and modern UI/UX across devices.",
    techStack: [
      "React",
      "JavaScript",
      "TMDB API",
      "CSS3",
      "Responsive Design",
      "Vercel",
    ],
    liveDemo: "https://filmbeam.vercel.app",
    githubLink: "https://github.com/Mo7amedThabet/FILMBEAM",
    visibility: "public",
    language: "CSS",
    featured: true,
  },
  {
    id: "newsbeam",
    name: "NEWSBEAM",
    description:
      "React news platform powered by News API with GSAP animations — fully responsive on all screen sizes.",
    techStack: ["React", "GSAP", "News API", "JavaScript", "CSS3", "Vercel"],
    liveDemo: "https://newsbeam-reactjs-gsap.vercel.app",
    githubLink: "https://github.com/Mo7amedThabet/NEWSBEAM-Reactjs-Gsap",
    visibility: "public",
    language: "JavaScript",
    featured: true,
  },
  {
    id: "prodcastbeam",
    name: "ProdcastBeam",
    description:
      "Modern podcast platform in progress — React.js with GSAP for smooth, engaging listener experiences.",
    techStack: ["React", "Bootstrap", "GSAP", "CSS3", "JavaScript", "Vercel"],
    liveDemo: "https://prodcast-beam-react-js-bootstrap-gs.vercel.app",
    githubLink:
      "https://github.com/Mo7amedThabet/ProdcastBeam-react.js-bootstrap-gsap-css3-in-progress",
    visibility: "public",
    language: "JavaScript",
    featured: true,
  },
  {
    id: "auth-ui",
    name: "Auth UI Cards",
    description:
      "Login & sign-up card interface built with React — glass-style components and form UX patterns.",
    techStack: ["React", "JavaScript", "CSS3", "Responsive Design", "Vercel"],
    liveDemo: "https://react-login-sign-up-style-with-card.vercel.app",
    githubLink:
      "https://github.com/Mo7amedThabet/react-login-sign-up-style-with-card-items-simple-uncompleted-design-using-react-js",
    visibility: "public",
    language: "JavaScript",
  },
  {
    id: "bone-detector",
    name: "Bone Fractures Detector",
    description:
      "ML / computer vision project for detecting bone fractures — academic & healthcare tech exploration.",
    techStack: ["Python", "Machine Learning", "TensorFlow"],
    liveDemo: null,
    githubLink: "https://github.com/Mo7amedThabet/Bone_Fractures_Detector",
    visibility: "public",
    language: null,
  },
];

/**
 * Private GitHub / client & company projects — edit with your real work.
 * GitHub private repos are not exposed by the API without a token.
 */
export const privateProjectsMock: Project[] = [
  {
    id: "taskeen",
    name: "Taskeen — Housing Management System",
    description:
      "Enterprise housing allocation platform — unit & applicant management, workflow approvals, admin dashboards, and reporting. ASP.NET Core Web API with Entity Framework Core and SQL Server, paired with a React admin UI.",
    techStack: [
      "ASP.NET Core",
      "ASP.NET Web API",
      "Entity Framework",
      "C#",
      "SQL Server",
      "React",
      "Redux",
      "JWT",
      "REST APIs",
      "Swagger",
    ],
    liveDemo: null,
    githubLink: null,
    visibility: "private",
    company: "Real Estate / Housing Sector",
    clientName: "Taskeen Project",
    showcaseUrl: null,
    featured: true,
  },
  {
    id: "private-erp",
    name: "Enterprise ERP Dashboard",
    description:
      "Full-stack ERP module for inventory, sales, and reporting — role-based access, Arabic/English UI, and real-time charts for a retail client.",
    techStack: [
      "React",
      "TypeScript",
      "ASP.NET Core",
      "Entity Framework",
      "SQL Server",
      "Tailwind CSS",
      "REST APIs",
      "JWT",
    ],
    liveDemo: null,
    githubLink: null,
    visibility: "private",
    company: "Retail / B2B Sector",
    clientName: "Confidential Client",
    showcaseUrl: null,
    featured: true,
  },
  {
    id: "private-booking",
    name: "Booking & CRM Platform",
    description:
      "Custom booking system with admin panel, SMS reminders, and payment integration built for a service company.",
    techStack: [
      "Next.js",
      "PHP",
      "MySQL",
      "REST APIs",
      "Payment Integration",
      "SMS Integration",
    ],
    liveDemo: null,
    githubLink: null,
    visibility: "private",
    company: "Services Company",
    clientName: "Private Client",
    showcaseUrl: null,
    featured: true,
  },
  {
    id: "private-portal",
    name: "Corporate Employee Portal",
    description:
      "Internal HR portal — leave requests, announcements, document uploads, and manager approvals.",
    techStack: [
      "React",
      "ASP.NET Core",
      "C#",
      "Entity Framework",
      "SQL Server",
      "JWT",
      "REST APIs",
    ],
    liveDemo: null,
    githubLink: "https://github.com/Mo7amedThabet",
    visibility: "private",
    company: "Corporate / HR",
    clientName: "Company Project",
    showcaseUrl: null,
  },
];

export const GITHUB_USERNAME = "Mo7amedThabet";

export function getPublicProjects(list: Project[]) {
  return list.filter((p) => p.visibility === "public");
}

export function getPrivateProjects(list: Project[]) {
  return list.filter((p) => p.visibility === "private");
}
