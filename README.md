# Mohamed Thabet — Gamified Portfolio

Premium interactive portfolio: **Next.js 16**, **Tailwind CSS v4**, **Framer Motion**, **Lucide React**.

## Features

- **Website Mode** — Hero, Skills, Projects (public + private/client), Contact
- **Game Mode** — Drive a Toyota Corolla in a city, GPS map, buildings, engine sound & horn
- **Light / Dark** · **English / Arabic (RTL)**

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push **this entire folder** to GitHub (not README-only).
2. Import the repo in [Vercel](https://vercel.com).
3. Framework: **Next.js** (auto-detected).
4. Build command: `npm run build` · Output: default.
5. Add env optional: `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`

## Customize

| File | Purpose |
|------|---------|
| `src/data/projects.ts` | Public + `privateProjectsMock` |
| `src/data/skills.ts` | Skills radar |
| `src/i18n/translations.ts` | EN / AR |
| `public/profile.png` | Profile photo |

## Game controls

`WASD` drive · `M` GPS map · `E` enter building · `L` lights · `Space` horn
