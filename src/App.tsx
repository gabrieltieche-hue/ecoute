import { useEffect, useMemo, useState } from "react";
import { TopBar } from "./components/TopBar";
import { HomeView } from "./views/HomeView";
import { SourceView } from "./views/SourceView";
import { PlayerBar } from "./components/PlayerBar";
import { FullPlayer } from "./components/FullPlayer";
import { VideoOverlay } from "./components/VideoOverlay";
import { PlayerProvider } from "./state/player";
import { storage } from "./lib/storage";
import { fetchFeed } from "./lib/api";
import { SOURCES } from "./lib/catalog";
import type { Episode, Source } from "./lib/types";

type View = { name: "home" } | { name: "source"; source: Source };

function Shell() {
  const [theme, setTheme] = useState<"dark" | "light">(() => storage.getTheme());
  const [view, setView] = useState<View>({ name: "home" });
  const [video, setVideo] = useState<{ episode: Episode; source: Source } | null>(null);
  const [artworks, setArtworks] = useState<Record<string, string>>({});

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Pochettes : on demande chaque flux avec limit=1 (charge utile minimale)
  useEffect(() => {
    let cancelled = false;
    for (const source of SOURCES) {
      const url =
        source.kind === "video"
          ? `https://www.youtube.com/feeds/videos.xml?playlist_id=${source.playlistId}`
          : source.feedUrl;
      if (!url) continue;
      fetchFeed(url, 1)
        .then((payload) => {
          if (cancelled || !payload.ok || !payload.source) return;
          const art = payload.source.artwork || payload.source.episodes[0]?.artwork;
          if (art) setArtworks((prev) => ({ ...prev, [source.id]: art }));
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const artworkFor = useMemo(
    () => (source: Source) => artworks[source.id] || source.artwork,
    [artworks],
  );

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <TopBar
        theme={theme}
        onToggle={() => {
          const next = theme === "dark" ? "light" : "dark";
          storage.setTheme(next);
          setTheme(next);
        }}
      />

      <main>
        {view.name === "home" ? (
          <HomeView onOpen={(source) => setView({ name: "source", source })} artworkFor={artworkFor} />
        ) : (
          <SourceView
            source={view.source}
            onBack={() => setView({ name: "home" })}
            onOpenVideo={(episode) => setVideo({ episode, source: view.source })}
          />
        )}
      </main>

      <PlayerBar />
      <FullPlayer />
      {video && (
        <VideoOverlay episode={video.episode} source={video.source} onClose={() => setVideo(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <Shell />
    </PlayerProvider>
  );
}
