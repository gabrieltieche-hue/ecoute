import { useEffect, useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { SOURCES, THEMES } from "../lib/catalog";
import type { Source } from "../lib/types";
import { storage } from "../lib/storage";
import { SourceCard } from "../components/SourceCard";
import { formatClock } from "../lib/format";
import { usePlayer } from "../state/player";

type Props = {
  onOpen: (source: Source) => void;
  artworkFor: (source: Source) => string;
};

export function HomeView({ onOpen, artworkFor }: Props) {
  const { resume } = usePlayer();
  const [progressList, setProgressList] = useState(storage.allProgress());
  const [filter, setFilter] = useState<string>("Tous");

  useEffect(() => {
    setProgressList(storage.allProgress());
  }, []);

  const inProgress = useMemo(
    () => progressList.filter((p) => p.time > 15 && (!p.duration || p.time < p.duration - 20)).slice(0, 6),
    [progressList],
  );

  const list = filter === "Tous" ? SOURCES : SOURCES.filter((s) => s.theme === filter);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-40 sm:px-8">
      <section className="pt-10 sm:pt-14">
        <h1 className="max-w-xl text-[30px] font-semibold leading-[1.15] tracking-tight sm:text-[38px]">
          Des podcasts en anglais, choisis pour toi.
        </h1>
        <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ink-2">
          Un catalogue court, des sous-titres natifs pour les vidéos, et la lecture sur tes enceintes en un geste.
        </p>
      </section>

      {inProgress.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[12px] uppercase tracking-[0.16em] text-ink-3">Reprendre l'écoute</h2>
          <ul className="mt-4 space-y-1">
            {inProgress.map((p) => (
              <li
                key={p.episodeId}
                className="group flex items-center gap-3.5 rounded-2xl px-2.5 py-2.5 hover:bg-surface"
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line-soft bg-surface-2">
                  {p.artwork ? <img src={p.artwork} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium tracking-tight">{p.title}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-3">
                    {p.sourceTitle} · {formatClock(p.time)} / {formatClock(p.duration)}
                  </p>
                </div>
                <button
                  onClick={() => resume(p)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-all hover:border-accent hover:bg-accent hover:text-white"
                  aria-label={`Reprendre ${p.title}`}
                >
                  {p.time > 60 ? <RotateCcw size={15} /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <div className="flex flex-wrap items-center gap-2">
          {["Tous", ...THEMES].map((theme) => (
            <button
              key={theme}
              onClick={() => setFilter(theme)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                filter === theme
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-2 hover:border-ink-3 hover:text-ink"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((source) => (
            <SourceCard key={source.id} source={source} artwork={artworkFor(source)} onOpen={onOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
