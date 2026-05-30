"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translations, type Locale } from "@/i18n/translations";

export type ViewMode = "website" | "game";

export type GameUnlock =
  | "home"
  | "skills"
  | "certs"
  | "projects"
  | "contact";

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof translations)[Locale];
  dir: "ltr" | "rtl";
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  gameUnlocks: Set<GameUnlock>;
  unlockSection: (key: GameUnlock) => void;
  gameScore: number;
  addGameScore: (n: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_LOCALE = "portfolio-locale";
const STORAGE_UNLOCKS = "portfolio-game-unlocks";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [viewMode, setViewMode] = useState<ViewMode>("website");
  const [gameUnlocks, setGameUnlocks] = useState<Set<GameUnlock>>(new Set());
  const [gameScore, setGameScore] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_LOCALE) as Locale | null;
    if (saved === "en" || saved === "ar") setLocaleState(saved);

    try {
      const raw = localStorage.getItem(STORAGE_UNLOCKS);
      if (raw) setGameUnlocks(new Set(JSON.parse(raw) as GameUnlock[]));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_LOCALE, l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, hydrated]);

  const unlockSection = useCallback((key: GameUnlock) => {
    setGameUnlocks((prev) => {
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem(STORAGE_UNLOCKS, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const addGameScore = useCallback((n: number) => {
    setGameScore((s) => s + n);
  }, []);

  const t = translations[locale];
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dir,
      viewMode,
      setViewMode,
      gameUnlocks,
      unlockSection,
      gameScore,
      addGameScore,
    }),
    [
      locale,
      setLocale,
      t,
      dir,
      viewMode,
      gameUnlocks,
      unlockSection,
      gameScore,
      addGameScore,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {!hydrated ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : null}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
