# Écoute

> Des podcasts en anglais, choisis pour toi. Un catalogue court, des
> sous-titres natifs pour les vidéos, et la lecture sur tes enceintes en un
> geste.

Application web (PWA). Interface en français, podcasts en anglais.

---

## Ce que ça fait

- **Catalogue curaté** de podcasts classés par thème et par niveau
  (A2 → C1), avec filtres par thème.
- **Lecteur audio** : lecture, pause, avant 15 s / après 30 s, vitesse
  0,75× → 2×, reprise exacte de l'épisode là où il a été arrêté.
- **« Reprendre l'écoute »** : les épisodes en cours, avec la position.
- **Podcasts vidéo** : lecteur YouTube intégré **avec les sous-titres natifs
  activés** (bouton CC, anglais).
- **Diffusion vers les enceintes** : AirPlay 2 (Bose SoundTouch, HomePod,
  enceintes AirPlay, Mac), Bluetooth depuis iOS/Android, Chromecast en v2.
- **Thème sombre et thème clair**, choix mémorisé.
- **Installable** sur l'écran d'accueil (iPhone, iPad, Mac, Android) :
  lecture en arrière-plan et contrôles sur l'écran verrouillé.

## Ce que ça ne fait pas (volontairement)

- Pas de compte, pas d'inscription, pas de base de données : tout est dans
  le navigateur de l'appareil.
- Pas de transcription automatique, pas de sous-titres pour les podcasts
  audio (seulement ceux qui en fournissent, en vidéo).
- Pas de recommandations algos : le catalogue est choisi à la main.

---

## Lancer en local

```bash
npm install
npm run dev
```

Puis <http://127.0.0.1:5188>.

Autres commandes :

```bash
npm run typecheck   # TypeScript strict
npm run lint
npm run build       # build de production dans dist/
npm run preview     # sert le build sur http://127.0.0.1:4188
```

## Comment c'est fait

| Brique | Choix |
|---|---|
| Front | Vite 8 + React 19 + Tailwind 4 + TypeScript strict |
| Flux | Une fonction Vercel `/api/feed` : récupère, parse (RSS **et** Atom/YouTube), normalise, met en cache 1 h |
| Audio | `<audio>` HTML5 sur l'URL du CDN du podcast — pas de proxy, pas de coût de bande passante |
| Vidéo | IFrame Player API YouTube, `cc_load_policy=1` + `cc_lang_pref=en` (sous-titres natifs forcés) |
| Persistance | `localStorage` (`ecoute.v1`) : thème, vitesse, positions d'écoute |
| Hébergement | Vercel (front statique + 1 fonction serverless) |

## Ajouter un podcast

Une entrée dans `src/lib/catalog.ts` :

```ts
{
  id: "mon-podcast",
  kind: "audio",            // "video" pour une playlist YouTube
  title: "Mon podcast",
  author: "Auteur",
  theme: "Anglais",         // devient un filtre de l'accueil
  level: "B1",              // A2 | B1 | B2 | C1
  blurb: "Une phrase.",
  artwork: "",              // repli ; la vraie pochette vient du flux
  feedUrl: "https://.../rss.xml",
}
```

Le flux est ensuite vérifié en direct par `/api/feed`. **Tester l'URL avant
de l'ajouter** (HTTP 200 + XML parsable) — le catalogue ne contient que des
flux vérifiés.

## Déploiement

```bash
export VERCEL_TOKEN=$(cat /root/.config/snowball-pro/vercel_token)
npx vercel --prod
```

## Licence / droits

L'app ne stocke et ne redistribue aucun média : elle lit les flux RSS publics
et affiche les vidéos YouTube via le lecteur officiel. Les contenus restent
la propriété de leurs auteurs.
