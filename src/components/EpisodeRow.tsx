import { Play, Video } from "lucide-react";
import type { Episode, Progress, Source } from "../lib/types";
import { formatClock, formatDate } from "../lib/format";

type Props = {
  episode: Episode;
  source: Source;
  artwork: string;
  progress?: Progress;
  onPlay: (episode: Episode, source: Source) => void;
  onOpenVideo?: (episode: Episode) => void;
};

export function EpisodeRow({ episode, source, artwork, progress, onPlay, onOpenVideo }: Props) {
  const isVideo = source.kind === "video";
  const p = progress;
  const started = !!p && p.time > 5;
  const percent = started && p ? Math.min(100, (p.time / (p.duration || 1)) * 100) : 0;

  return (
    <li className="group relative">
      <div className="flex items-center gap-3.5 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-surface">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line-soft bg-surface-2">
          {artwork ? (
            <img src={artwork} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-semibold text-ink-3">
              {episode.title.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium leading-snug tracking-tight">{episode.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-3">
            {episode.published && <span>{formatDate(episode.published)}</span>}
            {episode.durationSec > 0 && (
              <>
                <span className="text-ink-3/50">•</span>
                <span>{formatClock(episode.durationSec)}</span>
              </>
            )}
            {started && p && (
              <>
                <span className="text-ink-3/50">•</span>
                <span className="text-accent">à {formatClock(p.time)}</span>
              </>
            )}
          </p>
          {percent > 0 && (
            <div className="mt-1.5 h-[3px] w-full max-w-[220px] overflow-hidden rounded-full bg-line-soft">
              <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>

        <button
          onClick={() => (isVideo && onOpenVideo ? onOpenVideo(episode) : onPlay(episode, source))}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-all hover:border-accent hover:bg-accent hover:text-white"
          aria-label={isVideo ? `Regarder ${episode.title}` : `Écouter ${episode.title}`}
        >
          {isVideo ? <Video size={15} /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
        </button>
      </div>
    </li>
  );
}
