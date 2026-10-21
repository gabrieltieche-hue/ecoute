# AGENTS.md — Écoute

> Contexte complet pour le prochain agent IA qui reprend le projet.
> Langue de travail : **français** (UI, code commenté, réponses).
> Dernière mise à jour : **2026-10-21** (v0.1).

---

## 0. Origine du projet

Projet né d'un entretien produit (`grill-me`) le 2026-10-21. Décisions
arbitrées **avec** l'utilisateur, pas déduites :

- **Amélie** (francophone) veut améliorer son anglais en écoutant des
  podcasts sur ses enceintes.
- Contenu : **podcasts audio (RSS)** + **podcasts vidéo (YouTube)**.
- Pour la vidéo : **afficher le lecteur YouTube avec ses sous-titres
  natifs** (exigence formulée explicitement, avec l'exemple de l'OpenAI
  Podcast).
- Plateforme : **web app HTTPS (PWA)**, pas d'app native.
- Diffusion : **AirPlay 2** (couvre les Bose SoundTouch, HomePod, enceintes
  AirPlay) + **Chromecast** en v2 + Bluetooth en repli.
- Interface **en français**, contenu en anglais.
- Direction artistique : **sobre et premium**, thème sombre et thème clair.
- **Pas de transcription, pas de base de données, pas de compte.** Tout est
  dans le navigateur. Coût d'hébergement : 0.

### Décisions écartées explicitement (ne pas les rouvrir sans l'utilisateur)

- **Transcription automatique** : mesurée, elle coûte 5,5× le temps réel sur
  cette tablette (2 h 35 de CPU pour un épisode de 28 min). L'utilisateur a
  tranché : « pas de transcription maison ».
- **API catalogue (Listen Notes / Podcasts Index)** : le catalogue est curaté
  à la main, pas de dépendance externe.
- **Application native iOS** : impossible à compiler ici (pas de Xcode).
- **Alexa / Echo** comme diffuseur : hors de portée (exige un skill).
- **Sonos en app native** : réservé aux partenaires Sonos.

---

## 1. Architecture

```
api/                       fonctions Vercel (serverless)
  feed.js                  point d'entrée : /api/feed?url=...&limit=60
  _lib/feed.js             fetch + parse RSS/Atom + normalisation
  _lib/feed.d.ts           types du handler

src/
  lib/
    catalog.ts             LE CATALOGUE (à la main, flux vérifiés)
    types.ts               Source, Episode, Progress
    api.ts                 client /api/feed + cache mémoire (15 min)
    storage.ts             localStorage : thème, vitesse, positions
    format.ts              durées, dates relatives en français
  state/player.tsx         contexte React : lecteur audio, MediaSession
  components/              TopBar, SourceCard, EpisodeRow, PlayerBar,
                           FullPlayer, VideoOverlay
  views/                   HomeView, SourceView
  types/youtube.d.ts       typage minimal de l'IFrame API YouTube

public/                    manifest.webmanifest, sw.js, icon.svg, icônes PNG
```

- **Front statique** (Vite + React 19 + Tailwind 4 + TS strict) sur Vercel.
- **Une seule fonction serveur** : proxy + parseur RSS (contourne le CORS,
  réduit un flux de 7,7 Mo à ~50 Ko de JSON, met en cache 1 h).
- **Zéro base de données.** Progression, vitesse et thème dans
  `localStorage` (`ecoute.v1`).
- L'audio n'est **pas** proxyfié : on lit directement l'URL du CDN du
  podcast (pas de problème de CORS pour un élément `<audio>`).

---

## 2. Règles du catalogue

`src/lib/catalog.ts` est la seule source de vérité des podcasts.

1. **Aucun flux non vérifié.** Chaque URL a été testée en HTTP 200 et son
   XML parsé. Ne pas ajouter un flux « parce qu'il a l'air bien ».
2. Un flux audio a `feedUrl` ; un flux vidéo a `playlistId` (playlist ou
   chaîne YouTube).
3. `artwork` est un **repli** : la pochette réelle vient du flux
   (`itunes:image` ou `media:thumbnail`) et écrase le repli au chargement.
4. Ajouter un podcast = une entrée dans `SOURCES`. Rien d'autre.

## 3. Pièges connus

- **L'audio ne se lit pas sur iOS si la PWA n'est pas installée** sur l'écran
  d'accueil : le navigateur suspend la page au verrouillage. Installer
  l'app (Partage → Sur l'écran d'accueil) règle le fond ; sinon, on diffuse
  en AirPlay.
- **Fast-xml-parser** : les attributs sont préfixés `@_` (pas `@`). Le
  helper `attr()` de `api/_lib/feed.js` fait le pont. Ne pas le simplifier.
- **Le lecteur YouTube** force les sous-titres natifs avec
  `cc_load_policy=1` et `cc_lang_pref=en` : c'est l'exigence produit.
- Un flux RSS qui ne répond pas en CORS **doit** passer par `/api/feed`.
- Les flux lourds (7,7 Mo) sont mis en cache 1 h par le CDN Vercel
  (`s-maxage=3600`).

## 4. Commandes

```bash
npm install
npm run dev        # http://127.0.0.1:5188  (+ /api/feed en local)
npm run typecheck  # tsc -b, strict
npm run lint       # oxlint
npm run build      # tsc -b && vite build
npm run preview    # http://127.0.0.1:4188
```

Déploiement : `npx vercel --prod` (token dans
`/root/.config/snowball-pro/vercel_token`, exporté en `VERCEL_TOKEN`).

## 5. Vérification visuelle obligatoire

Le projet a une exigence « jolie ». Après toute modif d'interface :
captures headless via Playwright (`/root/notube-batch/node_modules/playwright-core`)
+ Chromium (`/root/.local/chromium-125/chrome`), puis **lire les images** et
écrire un verdict. Un `tsc` propre ne dit rien du rendu.
