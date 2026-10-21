import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Episode, Source } from "../lib/types";
import { fetchFeed } from "../lib/api";
import { storage } from "../lib/storage";
import { EpisodeRow } from "../components/EpisodeRow";
import { LEVEL_LABEL } from "../lib/catalog";
import { usePlayer } from "../state/player";

type Props = {
  source: Source;
  onBack: () => void;
  onOpenVideo: (episode: Episode) => void;
};

export function SourceView({ source, onBack, onOpenVideo }: Props) {
  const { play } = usePlayer();
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [artwork, setArtwork] = useState(source.artwork);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEpisodes(null);
    setError(null);

    const url =
      source.kind === "video"
        ? `https://www.youtube.com/feeds/videos.xml?playlist_id=${source.playlistId}`
        : source.feedUrl;

    if (!url) {
      setError("Source non configurée");
      return;
    }

    fetchFeed(url, 60)
      .then((payload) => {
        if (cancelled) return;
        if (!payload.ok || !payload.source) {
          setError(payload.error || "Flux indisponible");
          return;
        }
        setEpisodes(payload.source.episodes);
        if (payload.source.artwork) setArtwork(payload.source.artwork);
      })
      .catch((e) => !cancelled && setError(String(e?.message || e)));

    return () => {
      cancelled = true;
    };
  }, [source]);

  const progressList = storage.allProgress();
  const progressFor = (id: string) => progressList.find((p) => p.episodeId === id);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-40 sm:px-8">
      <button
        onClick={onBack}
        className="mt-8 inline-flex items-center gap-2 text-[13px] text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} />
        Tous les podcasts
      </button>

      <header className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-line-soft bg-surface-2 shadow-soft sm:h-40 sm:w-40">
          {artwork ? <img src={artwork} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-3">
            <span>{source.theme}</span>
            <span className="text-ink-3/50">•</span>
            <span>{source.kind === "video" ? "Vidéo" : LEVEL_LABEL[source.level]}</span>
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            {source.title}
          </h1>
          <p className="mt-1 text-[13px] text-ink-3">{source.author}</p>
          {source.blurb && <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-2">{source.blurb}</p>}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-[12px] uppercase tracking-[0.16em] text-ink-3">
          {source.kind === "video" ? "Vidéos" : "Épisodes"}
        </h2>

        {error && (
          <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
            Impossible de charger ce flux : {error}
          </p>
        )}

        {!error && !episodes && (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
            <Loader2 size={14} className="animate-spin" />
            Chargement des épisodes…
          </p>
        )}

        {episodes && episodes.length === 0 && (
          <p className="mt-4 text-[13px] text-ink-3">Aucun épisode disponible pour le moment.</p>
        )}

        {episodes && episodes.length > 0 && (
          <ul className="mt-3 space-y-0.5">
            {episodes.map((ep) => (
              <EpisodeRow
                key={ep.id}
                episode={ep}
                source={source}
                artwork={ep.artwork || artwork}
                progress={progressFor(ep.id)}
                onPlay={play}
                onOpenVideo={onOpenVideo}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
