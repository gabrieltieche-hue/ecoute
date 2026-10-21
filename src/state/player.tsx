import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Episode, Source } from "../lib/types";
import { storage } from "../lib/storage";

export type Playing = {
  episode: Episode;
  source: Source;
};

type PlayerContextValue = {
  playing: Playing | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  isFullOpen: boolean;
  play: (episode: Episode, source: Source) => void;
  toggle: () => void;
  pause: () => void;
  resume: (p: {
    episodeId: string;
    sourceId: string;
    sourceTitle: string;
    title: string;
    artwork: string;
    time: number;
    duration: number;
    audioUrl?: string;
    videoId?: string;
  }) => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  setSpeed: (speed: number) => void;
  openFull: () => void;
  closeFull: () => void;
  stop: () => void;
};

const Ctx = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer hors PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(() => storage.getSpeed());
  const [isFullOpen, setFullOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSaveRef = useRef(0);

  useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    audioRef.current = el;

    const onTime = () => setCurrentTime(el.currentTime);
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (playing) {
        storage.clearProgress(playing.episode.id);
        setCurrentTime(0);
        el.currentTime = 0;
      }
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      el.pause();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarde de la position (toutes les 3 s)
  useEffect(() => {
    if (!playing) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 3000) return;
    lastSaveRef.current = now;
    const el = audioRef.current;
    if (!el || !el.duration) return;
    storage.saveProgress({
      episodeId: playing.episode.id,
      sourceId: playing.source.id,
      sourceTitle: playing.source.title,
      title: playing.episode.title,
      artwork: playing.episode.artwork || playing.source.artwork || "",
      time: el.currentTime,
      duration: el.duration,
      updatedAt: now,
      audioUrl: playing.episode.audioUrl,
    });
  }, [currentTime, playing]);

  // MediaSession : contrôles sur l'écran verrouillé (iOS / Android)
  useEffect(() => {
    if (!("mediaSession" in navigator) || !playing) return;
    const artwork = playing.episode.artwork || playing.source.artwork;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: playing.episode.title,
      artist: playing.source.title,
      album: playing.source.author,
      artwork: artwork ? [{ src: artwork, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => void audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(30));
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const play = useCallback((episode: Episode, source: Source) => {
    const el = audioRef.current;
    if (!el) return;
    if (!episode.audioUrl) return;
    const known = storage.progressFor(episode.id);
    const resumeAt =
      known && known.time > 15 && known.duration && known.time < known.duration - 20 ? known.time : 0;
    if (el.src !== episode.audioUrl) {
      el.src = episode.audioUrl;
      el.load();
    }
    el.playbackRate = storage.getSpeed();
    setPlaying({ episode, source });
    setCurrentTime(resumeAt);
    void el.play().then(() => {
      if (resumeAt > 0) el.currentTime = resumeAt;
    });
  }, []);

  const resume = useCallback<PlayerContextValue["resume"]>((p) => {
    const el = audioRef.current;
    if (!el || !p.audioUrl) return;
    if (el.src !== p.audioUrl) {
      el.src = p.audioUrl;
      el.load();
    }
    el.playbackRate = storage.getSpeed();
    setPlaying({
      episode: {
        id: p.episodeId,
        title: p.title,
        description: "",
        audioUrl: p.audioUrl,
        published: "",
        durationSec: p.duration,
        artwork: p.artwork,
      },
      source: {
        id: p.sourceId,
        kind: "audio",
        title: p.sourceTitle,
        author: "",
        theme: "",
        level: "B2",
        blurb: "",
        artwork: p.artwork,
      },
    });
    setCurrentTime(p.time);
    void el.play().then(() => {
      el.currentTime = p.time;
    });
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(time, el.duration || time));
    setCurrentTime(el.currentTime);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const el = audioRef.current;
      if (!el) return;
      el.currentTime = Math.max(0, Math.min(el.currentTime + delta, el.duration || el.currentTime + delta));
      setCurrentTime(el.currentTime);
    },
    [],
  );

  const setSpeed = useCallback((value: number) => {
    storage.setSpeed(value);
    setSpeedState(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute("src");
    el.load();
    setPlaying(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      playing,
      isPlaying,
      currentTime,
      duration,
      speed,
      isFullOpen,
      play,
      toggle,
      pause,
      resume,
      seek,
      skip,
      setSpeed,
      openFull: () => setFullOpen(true),
      closeFull: () => setFullOpen(false),
      stop,
    }),
    [playing, isPlaying, currentTime, duration, speed, isFullOpen, play, toggle, pause, resume, seek, skip, setSpeed, stop],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
