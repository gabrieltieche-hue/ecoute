# MEMORY.md — Écoute

> Journal de sessions. Chaque session significative laisse une entrée.

---

## SESSION — 2026-10-21 (v0.1 : premier jet, déployé)

### Résumé

Projet né d'un entretien produit (`grill-me`) demandé par l'utilisateur :
« une nouvelle application » → après affinage, l'idée retenue est un
**lecteur de podcasts en anglais pour Amélie**, diffusable sur ses
enceintes.

L'utilisateur a explicitly écarté la complexité : « fais simple et
efficace », « je veux juste une app jolie », « je veux juste un truc avec les
audios des podcasts ». L'app est donc restée un **lecteur simple**, sans
transcription, sans base de données, sans compte.

Livré : app React/Tailwind déployée sur Vercel, catalogue de 9 sources
vérifiées, lecteur audio complet, lecteur YouTube à sous-titres natifs
forcés, thème clair/sombre, PWA installable.

**Production :** https://ecoute-gabriels-projects-811a62ab.vercel.app
(projet Vercel `ecoute`, team `gabriels-projects-811a62ab`).

> ⚠️ **Protection désactivée à la main.** Vercel crée les nouveaux projets
> avec `ssoProtection: {"deploymentType": "all_except_custom_domains"}` →
> 302 « Protected by Vercel Authentication » → Amélie ne pourrait pas ouvrir
> l'app sans compte Vercel. Corrigé par :
> `PATCH https://api.vercel.com/v9/projects/prj_BIwbh9VUHzRVeDadxTLBE9autUOm`
> avec `{"ssoProtection": null}`. **À revérifier après chaque déploiement.**


### Décisions

- **Pas de transcription maison.** Mesurée avant de trancher : whisper `base`
  sur la tablette met **16 min 25 s pour 3 min d'audio** (5,5× le temps
  réel, 2 h 35 pour un épisode de 28 min). Une API cloud aurait coûté
  ~0,10 à 0,25 € par épisode. L'utilisateur a tranché : rien.
- **AirPlay plutôt que Chromecast en v1.** AirPlay 2 couvre nativement les
  Bose SoundTouch, les HomePod et toutes les enceintes AirPlay, sans SDK ni
  compte. Chromecast exige d'enregistrer un Cast Media Receiver dans la
  console Google Cloud : reporté en v2.
- **Une seule fonction serveur** (`/api/feed`) : proxy + parseur RSS/Atom.
  Necessaire car plusieurs flux n'ont pas d'en-têtes CORS, et parce que le
  flux du AI Daily Brief pèse 7,7 Mo (réduit à ~50 Ko de JSON).
- **Pochettes prises dans le flux** (`itunes:image`, `media:thumbnail`), avec
  repli codé en dur pour 2 sources.
- **Vidéo YouTube en lecture native**, pas de lecteur maison : les
  sous-titres natifs sont une exigence, et les réimplémenter serait
  fragile et hors ToS.

### Vérifications

- 9 flux RSS testés en HTTP 200 et parsés (les autres URLs candidates ont
  été éliminées : 404 / 403 / timeout).
- Chaîne YouTube OpenAI : 10 playlists de la chaîne inspectées, aucune ne
  s'appelle « OpenAI Podcast » ; le bon playlist a été fourni par
  l'utilisateur : `PLOXw6I10VTv9GAOCZjUAAkSVyW2cDXs4u` (« The OpenAI
  Podcast », 14 épisodes, Ep. 15 → 22). C'est lui qui est en production.
- `tsc -b` : 0 erreur. `vite build` : 12 s, 79 Ko gzip.
- Parcours piloté au navigateur (Playwright + Chromium 125) : accueil →
  podcast → lecture (0:05 / 28:39, lecture réelle confirmée par la
  MediaSession) → lecteur plein écran → mobile 390 px → vidéo YouTube
  (`cc_load_policy=1&cc_lang_pref=en` dans l'URL de l'iframe).
- **0 erreur console** sur l'ensemble du parcours.

### Pièges corrigés en cours de route

- `attr()` cherchait `@url` au lieu de `@_url` (préfixe fast-xml-parser) :
  pochettes et URLs audio vides. Corrigé.
- La liste d'épisodes était étirée sur toute la largeur de l'écran (bouton
  de lecture à 1200 px du titre) : contenu resserré à `max-w-4xl`.
- La barre de lecture recouvrait la dernière ligne d'épisode : padding
  `pb-40` sur les vues.

### Suite

- v2 : Chromecast (Cast Media Receiver), téléchargement hors-ligne
  (IndexedDB), recherche dans le catalogue.
- Décision en attente : un accès secret (mot de passe partagé) pour
  l'app, aujourd'hui ouverte à quiconque a le lien.
