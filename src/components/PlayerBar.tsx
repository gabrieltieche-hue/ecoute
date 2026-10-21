import { ChevronUp, Gauge, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { usePlayer } from "../state/player";
import { formatClock } from "../lib/format";

export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function PlayerBar() {
  const { playing, isPlaying, currentTime, duration, speed, toggle, skip, setSpeed, openFull, stop } = usePlayer();

  if (!playing) return null;

  const art = playing.episode.artwork || playing.source.artwork;
  const percent = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8">
        <div className="mb-2.5 h-[3px] w-full overflow-hidden rounded-full bg-line-soft">
          <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${percent}%` }} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openFull}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            aria-label="Ouvrir le lecteur"
          >
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line-soft bg-surface-2">
              {art ? <img src={art} alt="" className="h-full w-full object-cover" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium tracking-tight">{playing.episode.title}</span>
              <span className="block truncate text-[11px] text-ink-3">{playing.source.title}</span>
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => skip(-15)}
              className="hidden h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink sm:grid"
              aria-label="Reculer de 15 secondes"
            >
              <RotateCcw size={17} />
            </button>
            <button
              onClick={toggle}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-bg transition-transform hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
            </button>
            <button
              onClick={() => skip(30)}
              className="hidden h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink sm:grid"
              aria-label="Avancer de 30 secondes"
            >
              <RotateCw size={17} />
            </button>
          </div>

          <div className="ml-1 hidden items-center gap-1 md:flex">
            <button
              onClick={() => {
                const i = SPEEDS.indexOf(speed);
                setSpeed(SPEEDS[(i + 1) % SPEEDS.length] ?? 1);
              }}
              className="flex h-9 items-center gap-1.5 rounded-full border border-line px-2.5 text-[12px] font-medium text-ink-2 transition-colors hover:text-ink"
              title="Vitesse de lecture"
            >
              <Gauge size={14} />
              {speed}×
            </button>
            <span className="ml-1 hidden font-mono text-[11px] tabular-nums text-ink-3 lg:inline">
              {formatClock(currentTime)} / {formatClock(duration)}
            </span>
            <button
              onClick={openFull}
              className="ml-1 grid h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink"
              aria-label="Agrandir le lecteur"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={stop}
              className="ml-1 hidden h-9 w-9 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink sm:grid"
              aria-label="Arrêter la lecture"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
