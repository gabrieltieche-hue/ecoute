import type { Progress } from "./types";

const KEY = "ecoute.v1";

type Store = {
  theme: "dark" | "light";
  speed: number;
  progress: Record<string, Progress>;
};

const EMPTY: Store = { theme: "dark", speed: 1, progress: {} };

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      theme: parsed.theme === "light" ? "light" : "dark",
      speed: typeof parsed.speed === "number" ? parsed.speed : 1,
      progress: parsed.progress ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

let cache: Store | null = null;

function store(): Store {
  if (!cache) cache = read();
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store()));
  } catch {
    /* quota ou mode prive : on ignore */
  }
}

export const storage = {
  getTheme(): "dark" | "light" {
    return store().theme;
  },
  setTheme(theme: "dark" | "light") {
    store().theme = theme;
    persist();
  },
  getSpeed(): number {
    return store().speed;
  },
  setSpeed(speed: number) {
    store().speed = speed;
    persist();
  },
  allProgress(): Progress[] {
    return Object.values(store().progress).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  progressFor(episodeId: string): Progress | undefined {
    return store().progress[episodeId];
  },
  saveProgress(p: Progress) {
    const s = store();
    s.progress[p.episodeId] = p;
    // on garde au maximum 60 episodes en cours
    const entries = Object.values(s.progress).sort((a, b) => b.updatedAt - a.updatedAt);
    if (entries.length > 60) {
      for (const old of entries.slice(60)) delete s.progress[old.episodeId];
    }
    persist();
  },
  clearProgress(episodeId: string) {
    delete store().progress[episodeId];
    persist();
  },
};
