export type Level = "A2" | "B1" | "B2" | "C1";

export type Source = {
  id: string;
  kind: "audio" | "video";
  title: string;
  author: string;
  theme: string;
  level: Level;
  blurb: string;
  artwork: string;
  /** flux RSS (podcasts audio) */
  feedUrl?: string;
  /** identifiant de chaine ou de playlist YouTube (podcasts video) */
  playlistId?: string;
};

export type Episode = {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  videoId?: string;
  published: string;
  durationSec: number;
  artwork?: string;
};

export type FeedPayload = {
  ok: boolean;
  error?: string;
  source?: {
    title: string;
    author: string;
    description: string;
    artwork: string;
    episodes: Episode[];
  };
};

export type Progress = {
  episodeId: string;
  sourceId: string;
  sourceTitle: string;
  title: string;
  artwork: string;
  time: number;
  duration: number;
  updatedAt: number;
  audioUrl?: string;
  videoId?: string;
};
