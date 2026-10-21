import { XMLParser } from "fast-xml-parser";

const UA =
  "Mozilla/5.0 (compatible; Ecoute/1.0; +https://ecoute.app) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: true,
  htmlEntities: true,
});

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const text = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return String(v["#text"] ?? "").trim();
  return "";
};
const attr = (v, key) => (v && typeof v === "object" ? v["@_" + key] ?? "" : "");

function parseDuration(raw) {
  const s = text(raw);
  if (!s) return 0;
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function pickImage(obj) {
  const itunes = asArray(obj?.["itunes:image"])[0];
  const a = attr(itunes, "href");
  if (a) return a;
  if (itunes && typeof itunes === "object" && itunes.url) return text(itunes.url);
  const img = obj?.image;
  if (typeof img === "string") return img;
  if (img && typeof img === "object") return attr(img, "href") || text(img.url);
  const thumb = asArray(obj?.["media:thumbnail"])[0];
  return attr(thumb, "url");
}

function stripHtml(s) {
  return text(s)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hashId(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function normalizeRss(channel, limit) {
  const episodes = [];
  for (const item of asArray(channel.item)) {
    const title = stripHtml(text(item.title));
    if (!title) continue;
    const enc = asArray(item.enclosure)[0];
    const audioUrl = attr(enc, "url");
    const guid = text(item.guid) || audioUrl || title;
    const published = text(item.pubDate) || text(item["dc:date"]) || "";
    episodes.push({
      id: hashId(guid),
      title,
      description: stripHtml(text(item.description) || text(item["content:encoded"])).slice(0, 600),
      audioUrl,
      published,
      durationSec: parseDuration(item["itunes:duration"] || item.duration),
      artwork: pickImage(item),
    });
  }
  return {
    title: stripHtml(text(channel.title)),
    author: stripHtml(text(channel["itunes:author"]) || text(channel.managingEditor) || text(channel["dc:creator"])),
    description: stripHtml(text(channel.description) || text(channel.subtitle)).slice(0, 400),
    artwork: pickImage(channel),
    episodes: episodes.slice(0, limit),
  };
}

function normalizeAtom(feed, limit) {
  const episodes = [];
  for (const entry of asArray(feed.entry)) {
    const title = stripHtml(text(entry.title));
    if (!title) continue;
    const id = text(entry.id);
    const videoId = (id.match(/yt:video:([\w-]{6,})/) || [])[1] || (id.match(/^UC[\w-]{22}$/) ? "" : id);
    const group = entry["media:group"];
    const thumbs = asArray(group?.["media:thumbnail"])[0];
    episodes.push({
      id: hashId(id || title),
      title,
      description: stripHtml(text(group?.["media:description"] || entry.summary)).slice(0, 600),
      videoId,
      published: text(entry.published) || text(entry.updated),
      durationSec: 0,
      artwork: attr(thumbs, "url"),
    });
  }
  return {
    title: stripHtml(text(feed.title)),
    author: stripHtml(text(feed.author?.name)),
    description: "",
    artwork: "",
    episodes: episodes.slice(0, limit),
  };
}

export async function feedHandler(req, res) {
  const send = (code, payload) => {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };

  try {
    const parsedUrl = new URL(req.url || "/", "http://localhost");
    const target = parsedUrl.searchParams.get("url");
    const limit = Math.min(Number(parsedUrl.searchParams.get("limit") || 60) || 60, 120);

    if (!target) return send(400, { ok: false, error: "missing url" });
    if (!/^https?:\/\//i.test(target)) return send(400, { ok: false, error: "bad url" });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let body;
    let contentType = "";
    try {
      const upstream = await fetch(target, {
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
        redirect: "follow",
      });
      if (!upstream.ok) {
        clearTimeout(timer);
        return send(502, { ok: false, error: `upstream ${upstream.status}` });
      }
      contentType = upstream.headers.get("content-type") || "";
      body = await upstream.text();
    } finally {
      clearTimeout(timer);
    }

    let xml;
    try {
      xml = parser.parse(body);
    } catch {
      return send(502, { ok: false, error: "xml parse failed" });
    }

    let out;
    if (xml?.rss?.channel) out = normalizeRss(xml.rss.channel, limit);
    else if (xml?.feed) out = normalizeAtom(xml.feed, limit);
    else return send(502, { ok: false, error: "unrecognised feed", contentType });

    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400");
    return send(200, { ok: true, source: out });
  } catch (err) {
    return send(500, { ok: false, error: String(err?.message || err) });
  }
}
