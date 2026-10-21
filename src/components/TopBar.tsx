import { Moon, Sun } from "lucide-react";

type Props = {
  theme: "dark" | "light";
  onToggle: () => void;
};

export function TopBar({ theme, onToggle }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line-soft bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <button
          onClick={onToggle}
          className="group flex items-center gap-3 text-left"
          aria-label="Retour à l'accueil"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-2 shadow-soft">
            <span className="block h-2.5 w-2.5 rounded-full bg-white/95" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold leading-tight tracking-tight">Écoute</span>
            <span className="block text-[11px] leading-tight text-ink-3">podcasts en anglais</span>
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggle}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-line hover:text-ink"
            aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
            title={theme === "dark" ? "Thème clair" : "Thème sombre"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
