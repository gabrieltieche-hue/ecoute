import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Episode, Source } from "../lib/types";
import { usePlayer } from "../state/player";

let scriptPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => reject(new Error("YouTube API indisponible"));
    window.onYouTubeIframeAPIReady = () => resolve();
    document.head.appendChild(tag);
  });
  return scriptPromise;
}

type Props = {
  episode: Episode | null;
  source: Source;
  onClose: () => void;
};

export function VideoOverlay({ episode, source, onClose }: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const { pause } = usePlayer();

  useEffect(() => {
    if (!episode?.videoId) return;
    pause();
    let destroyed = false;
    let player: YT.Player | null = null;

    const create = () => {
      if (destroyed || !holder.current || !episode.videoId) return;
      player = new YT.Player(holder.current, {
        videoId: episode.videoId,
        playerVars: {
          // sous-titres natifs forces, en anglais
          cc_load_policy: "1",
          cc_lang_pref: "en",
          hl: "en",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          autoplay: "1",
          iv_load_policy: "3",
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
          },
        },
      });
    };

    loadYouTubeApi()
      .then(() => {
        if (window.YT?.Player) create();
        else window.onYouTubeIframeAPIReady = create;
      })
      .catch(() => undefined);

    return () => {
      destroyed = true;
      try {
        player?.destroy();
      } catch {
        /* ignore */
      }
    };
  }, [episode?.videoId, pause]);

  if (!episode) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="min-w-0 truncate text-[12px] uppercase tracking-[0.16em] text-ink-3">
            {source.title}
          </span>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:text-ink"
            aria-label="Fermer la vidéo"
          >
            <X size={17} />
          </button>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-line-soft bg-black shadow-soft">
          <div ref={holder} className="h-full w-full" />
        </div>

        <h2 className="mt-5 text-lg font-semibold leading-snug tracking-tight">{episode.title}</h2>
        {episode.published && (
          <p className="mt-1 text-[12px] text-ink-3">Publié le {new Date(episode.published).toLocaleDateString("fr-FR")}</p>
        )}
        {episode.description && (
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">{episode.description}</p>
        )}
        <p className="mt-5 rounded-xl border border-line-soft bg-surface px-4 py-3 text-[12.5px] leading-relaxed text-ink-3">
          Les sous-titres affichés dans la vidéo sont ceux de YouTube. Active-les avec le bouton&nbsp;CC si besoin, ou
          dans les réglages de la vidéo.
        </p>
      </div>
    </div>
  );
}
