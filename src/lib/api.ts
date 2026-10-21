import type { FeedPayload } from "./types";

const cache = new Map<string, { at: number; payload: FeedPayload }>();
const TTL = 15 * 60 * 1000;

export async function fetchFeed(url: string, limit = 60): Promise<FeedPayload> {
  const key = `${url}|${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.payload;

  const res = await fetch(`/api/feed?url=${encodeURIComponent(url)}&limit=${limit}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  const payload = (await res.json()) as FeedPayload;
  cache.set(key, { at: Date.now(), payload });
  return payload;
}
