import { Play, Video } from "lucide-react";
import type { Source } from "../lib/types";
import { LEVEL_LABEL } from "../lib/catalog";

type Props = {
  source: Source;
  artwork: string;
  onOpen: (source: Source) => void;
};

export function SourceCard({ source, artwork, onOpen }: Props) {
  return (
    <button
      onClick={() => onOpen(source)}
      className="group w-full text-left"
      aria-label={`Ouvrir ${source.title}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line-soft bg-surface-2">
        {artwork ? (
          <img
            src={artwork}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-surface-2 to-line-soft text-ink-3">
            <span className="text-3xl font-semibold">{source.title.charAt(0)}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute right-2.5 top-2.5 grid h-8 w-8 translate-y-1 place-items-center rounded-full bg-accent text-white opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {source.kind === "video" ? <Video size={15} /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
        </span>

        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur">
          {source.level}
        </span>
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="truncate text-[13.5px] font-medium leading-snug tracking-tight">{source.title}</p>
        <p className="mt-0.5 truncate text-[11.5px] text-ink-3">{source.author}</p>
        <p className="mt-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-3/80">
          {source.kind === "video" ? "Vidéo" : LEVEL_LABEL[source.level]}
        </p>
      </div>
    </button>
  );
}
