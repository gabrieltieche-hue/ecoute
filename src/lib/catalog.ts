import type { Level, Source } from "./types";

/**
 * Catalogue de l'application : uniquement des sources verifiees (HTTP 200,
 * flux parse, pochettes disponibles). Rien n'est suppose.
 */
export const SOURCES: Source[] = [
  {
    id: "ai-daily-brief",
    kind: "audio",
    title: "The AI Daily Brief",
    author: "Nathaniel Whittemore",
    theme: "Intelligence artificielle",
    level: "B2",
    blurb: "L'essentiel de l'actualité IA, chaque jour, en 30 minutes.",
    artwork:
      "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/41472609/41472609-1752234663609-8665756a468e5.jpg",
    feedUrl: "https://anchor.fm/s/f7cac464/podcast/rss",
  },
  {
    id: "openai-podcast",
    kind: "video",
    title: "OpenAI Podcast",
    author: "OpenAI",
    theme: "Intelligence artificielle",
    level: "B2",
    blurb: "Les épisodes vidéo d'OpenAI, avec sous-titres natifs en anglais.",
    artwork: "",
    playlistId: "PLEMCKj4AZ_iI",
  },
  {
    id: "six-minute-english",
    kind: "audio",
    title: "6 Minute English",
    author: "BBC Learning English",
    theme: "Anglais",
    level: "A2",
    blurb: "Six minutes d'anglais sur un sujet d'actualité, avec le vocabulaire expliqué.",
    artwork: "https://ichef.bbci.co.uk/images/ic/3000x3000/p0hxqkd0.jpg",
    feedUrl: "https://podcasts.files.bbci.co.uk/p02pc9tn.rss",
  },
  {
    id: "english-we-speak",
    kind: "audio",
    title: "Learning English Conversations",
    author: "BBC Learning English",
    theme: "Anglais",
    level: "A2",
    blurb: "Des conversations Britain's en anglais simple, deux fois par semaine.",
    artwork: "https://ichef.bbci.co.uk/images/ic/3000x3000/p0hxql2c.jpg",
    feedUrl: "https://podcasts.files.bbci.co.uk/p02pc9zn.rss",
  },
  {
    id: "all-ears-english",
    kind: "audio",
    title: "All Ears English",
    author: "Michelle",
    theme: "Anglais",
    level: "B1",
    blurb: "L'anglais naturel des gens qui parlent, expliqué point par point.",
    artwork:
      "https://megaphone.imgix.net/podcasts/88b85f10-a0c0-11ec-9e52-bfcf9441f742/image/All_Ears_English_New_Cover_with_Michelle_Under_500_KB.jpg?w=800&h=800&fit=crop&auto=format",
    feedUrl: "https://feeds.megaphone.fm/allearsenglish",
  },
  {
    id: "the-daily",
    kind: "audio",
    title: "The Daily",
    author: "The New York Times",
    theme: "Actualités",
    level: "B2",
    blurb: "Le monde en 20 minutes, chaque matin.",
    artwork:
      "https://image.simplecastcdn.com/images/7f2f4c05-9c2f-4deb-82b7-b538062bc22d/73549bf1-94b3-40ff-8aeb-b4054848ec1b/3000x3000/the-daily-album-art-original.jpg?aid=rss_feed",
    feedUrl: "https://feeds.simplecast.com/54nAGcIl",
  },
  {
    id: "ted-talks-daily",
    kind: "audio",
    title: "TED Talks Daily",
    author: "TED",
    theme: "Idées",
    level: "B1",
    blurb: "Une idée par jour, en dix minutes.",
    artwork: "https://assets.pippa.io/shows/67587e77c705e441797aff96/show-cover.png",
    feedUrl: "https://feeds.feedburner.com/TEDTalks_audio",
  },
  {
    id: "science-vs",
    kind: "audio",
    title: "Science Vs",
    author: "Wondery",
    theme: "Sciences",
    level: "B2",
    blurb: "Des questions scientifiques, des réponses sans détour.",
    artwork:
      "https://megaphone.imgix.net/podcasts/f521b120-2c30-11e6-b5f3-63ee984ee1a4/image/e7470287efbfa0aff068175bb6c31805.jpg?w=800&h=800&fit=crop&auto=format",
    feedUrl: "https://feeds.megaphone.fm/sciencevs",
  },
  {
    id: "huberman-lab",
    kind: "audio",
    title: "Huberman Lab",
    author: "Andrew Huberman",
    theme: "Sciences",
    level: "B2",
    blurb: "Des discussions longues et denses sur le cerveau, le sommeil, la performance.",
    artwork:
      "https://megaphone.imgix.net/podcasts/042e6144-725e-11ec-a75d-c38f702aecad/image/ee4f0b7b466ca35620792970d9bce2d2.jpg?w=800&h=800&fit=crop&auto=format",
    feedUrl: "https://feeds.megaphone.fm/hubermanlab",
  },
];

export const THEMES: string[] = Array.from(new Set(SOURCES.map((s) => s.theme)));

export const LEVELS: Level[] = ["A2", "B1", "B2", "C1"];

export const LEVEL_LABEL: Record<Level, string> = {
  A2: "Débutant",
  B1: "Intermédiaire",
  B2: "Avancé",
  C1: "Confirmé",
};
