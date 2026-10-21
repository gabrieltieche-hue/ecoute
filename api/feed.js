import { feedHandler } from "./_lib/feed.js";

export default async function handler(req, res) {
  await feedHandler(req, res);
}
