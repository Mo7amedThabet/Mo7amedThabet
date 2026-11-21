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
    id: "cypra",
    name: "CYPRA",
    description:
      "Software-house marketing site — brand story, services, and motion-driven UI built with React, Tailwind, and GSAP.",
    techStack: ["React", "JavaScript", "Tailwind CSS", "GSAP", "Vercel"],
    liveDemo: "https://cypra.vercel.app",
    githubLink: "https://github.com/Mo7amedThabet/Cypra",
    visibility: "public",
    language: "JavaScript",
    featured: true,
  },
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
    id: "solo-store",
    name: "SOLO — Shopify Store",
    description:
      "Custom Shopify theme for the SOLO brand — Liquid sections (Looks, Salon, Journal, Music), day/night atmosphere, RTL/i18n, and polished product storytelling for an Arabic/English storefront.",
    techStack: [
      "Shopify",
      "Liquid",
      "JavaScript",
      "HTML5",
      "CSS3",
      "RTL / i18n",
    ],
    liveDemo: "https://solo-atelier.myshopify.com",
    githubLink: null,
    visibility: "private",
    company: "CYPRA",
    clientName: "SOLO Store",
    showcaseUrl: "https://solo-atelier.myshopify.com",
    featured: true,
  },
  {
    id: "cypra-smart-home",
    name: "CYPRA Smart Home",
    description:
      "Smart-home brand site — automation, lighting, cleaning, and security services with project showcases. Framer design exported and hosted on Next.js.",
    techStack: [
      "Next.js",
      "React",
      "Framer",
      "JavaScript",
      "CSS3",
      "Vercel",
    ],
    liveDemo: "https://cypra.vercel.app/services/smart-home-control",
    githubLink: null,
    visibility: "private",
    company: "CYPRA",
    clientName: "CYPRA Smart Home",
    showcaseUrl: "https://cypra.vercel.app/services/smart-home-control",
    featured: true,
  },
  {
    id: "cypra-supermarket",
    name: "CYPRA Supermarket Management System",
    description:
      "End-to-end supermarket platform: WPF POS (barcode, inventory, purchases, accounting, roles), multi-tenant SaaS API with subscriptions/payments, catalog wizard, e-commerce storefront, Flutter companion, AI stock forecast, and self-contained Windows installer.",
    techStack: [
      "C#",
      ".NET",
      "WPF",
      "ASP.NET Core",
      "SQLite",
      "Flutter",
      "REST APIs",
      "JWT",
      "Paymob / Stripe",
      "ESC/POS",
    ],
    liveDemo: "https://cypra.vercel.app",
    githubLink: null,
    visibility: "private",
    company: "CYPRA",
    clientName: "CYPRA Product",
    showcaseUrl: "https://cypra.vercel.app",
    featured: true,
  },
  {
    id: "cypra-site",
    name: "CYPRA — Software House Site",
    description:
      "Company website for CYPRA Software Solutions — forward-looking brand presence with React, Tailwind, and GSAP motion.",
    techStack: ["React", "Tailwind CSS", "GSAP", "JavaScript", "Vercel"],
    liveDemo: "https://cypra.vercel.app",
    githubLink: null,
    visibility: "private",
    company: "CYPRA",
    clientName: "CYPRA",
    showcaseUrl: "https://cypra.vercel.app",
    featured: true,
  },
  {
    id: "taskeen",
    name: "The Russian Whale — Taskeen",
    description:
      "Housing / residence management platform — units & applicants, workflow approvals, admin dashboards, and real-time updates. ASP.NET Core Web API + Entity Framework with a React/TypeScript admin UI (SignalR, Docker-ready).",
    techStack: [
      "ASP.NET Core",
      "ASP.NET Web API",
      "Entity Framework",
      "C#",
      "SQL Server",
      "React",
      "TypeScript",
      "SignalR",
      "JWT",
      "Docker",
      "Swagger",
    ],
    liveDemo: "https://the-russian-whale.vercel.app",
    githubLink: null,
    visibility: "private",
    company: "The Russian Whale",
    clientName: "Taskeen",
    showcaseUrl: "https://the-russian-whale.vercel.app",
    featured: true,
  },
];

export const GITHUB_USERNAME = "Mo7amedThabet";

export function getPublicProjects(list: Project[]) {
  return list.filter((p) => p.visibility === "public");
}

export function getPrivateProjects(list: Project[]) {
  return list.filter((p) => p.visibility === "private");
}
