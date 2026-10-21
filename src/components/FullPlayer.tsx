import { Airplay, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../state/player";
import { formatClock } from "../lib/format";
import { SPEEDS } from "./PlayerBar";

export function FullPlayer() {
  const { playing, isPlaying, currentTime, duration, speed, isFullOpen, closeFull, toggle, seek, skip, setSpeed } =
    usePlayer();
  const [showAirplay, setShowAirplay] = useState(false);

  if (!playing || !isFullOpen) return null;

  const art = playing.episode.artwork || playing.source.artwork;
  const percent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 pb-16 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-3">En lecture</span>
          <button
            onClick={closeFull}
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:text-ink"
            aria-label="Fermer"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[360px]">
          <div className="aspect-square overflow-hidden rounded-3xl border border-line-soft bg-surface-2 shadow-soft">
            {art ? <img src={art} alt="" className="h-full w-full object-cover" /> : null}
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold leading-snug tracking-tight">{playing.episode.title}</h2>
          <p className="mt-1.5 text-[13px] text-ink-3">
            {playing.source.title}
            {playing.source.author ? ` · ${playing.source.author}` : ""}
          </p>
        </div>

        <div className="mt-7">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-accent"
            style={{
              background: `linear-gradient(to right, var(--accent) ${percent}%, var(--line) ${percent}%)`,
              height: 4,
              borderRadius: 999,
              appearance: "none",
            }}
            aria-label="Position de lecture"
          />
          <div className="mt-1.5 flex justify-between font-mono text-[11.5px] tabular-nums text-ink-3">
            <span>{formatClock(currentTime)}</span>
            <span>-{formatClock(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            onClick={() => skip(-15)}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink"
            aria-label="Reculer de 15 secondes"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={toggle}
            className="grid h-16 w-16 place-items-center rounded-full bg-ink text-bg transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} className="ml-1" fill="currentColor" />}
          </button>
          <button
            onClick={() => skip(30)}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink"
            aria-label="Avancer de 30 secondes"
          >
            <RotateCw size={22} />
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                s === speed
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-2 hover:text-ink"
              }`}
            >
              {s}×
            </button>
          ))}
          <button
            onClick={() => setShowAirplay((v) => !v)}
            className="ml-1 flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:text-ink"
          >
            <Airplay size={14} />
            Enceintes
          </button>
        </div>

        {showAirplay && (
          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed text-ink-2">
            <p className="mb-2 font-medium text-ink">Écouter sur une enceinte</p>
            <ul className="space-y-1.5">
              <li>
                <span className="text-ink">iPhone / iPad :</span> lance la lecture, puis Centre de contrôle → AirPlay →
                choisis ton enceinte (Sonos, Bose SoundTouch, HomePod…).
              </li>
              <li>
                <span className="text-ink">Mac :</span> icône AirPlay dans la barre des menus, ou →
                <span className="font-mono">⌥</span> + clic sur le bouton Lecture du navigateur.
              </li>
              <li>
                <span className="text-ink">Android :</span> lecture → bouton Cast de la barre de notifications.
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
