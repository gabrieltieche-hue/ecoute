import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { feedHandler } from "./api/_lib/feed.js";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // En dev, la même fonction que celle deployee sur Vercel (/api/feed)
      name: "ecoute-dev-api",
      configureServer(server) {
        server.middlewares.use("/api/feed", (req, res, next) => {
          if (!req.url) return next();
          feedHandler(req, res).catch(() => next());
        });
      },
    },
  ],
  server: { host: "127.0.0.1", port: 5188, strictPort: true },
  preview: { host: "127.0.0.1", port: 4188 },
});
