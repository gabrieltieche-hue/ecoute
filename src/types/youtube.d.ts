export {};

declare global {
  namespace YT {
    interface YTPlayer {
      playVideo(): void;
      pauseVideo(): void;
      destroy(): void;
      getPlayerState(): number;
    }

    class Player {
      constructor(
        target: string | HTMLElement,
        options: {
          videoId: string;
          width?: number | string;
          height?: number | string;
          playerVars?: Record<string, string | number>;
          events?: Record<string, (event: { target: YTPlayer }) => void>;
        },
      );
      playVideo(): void;
      pauseVideo(): void;
      destroy(): void;
      getPlayerState(): number;
    }
  }

  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}
