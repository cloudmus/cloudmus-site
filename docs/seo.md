# SEO backlog

Postponed improvements for search visibility of https://cloudmus.app. Constraint: keep the home page visually clean, no hidden text.

## Target queries

| Language | Queries |
|---|---|
| ru | музыкальный плеер, десктопный плеер, плеер для Яндекс Музыки, плеер для YouTube Music, Яндекс Музыка для Linux |
| en | music player, desktop music player, Yandex Music player, YouTube Music desktop app / player for Windows and Linux |
| de | Musikplayer, Desktop-Musikplayer, Player für YouTube Music |
| fr | lecteur de musique, lecteur de musique de bureau, lecteur YouTube Music |
| es | reproductor de música, reproductor de escritorio, reproductor para YouTube Music |
| it | lettore musicale, lettore musicale desktop, lettore per YouTube Music |

## On-page (code)

1. **Title** (`meta.title`, ~70 chars), e.g.
   - ru: «CloudMus — музыкальный плеер для Яндекс Музыки и YouTube Music | Windows и Linux»
   - en: «CloudMus — desktop music player for Yandex Music and YouTube Music | Windows & Linux»
2. **Description** (`meta.description`, ≤160 chars), e.g. ru: «Бесплатный десктопный музыкальный плеер для Яндекс Музыки, YouTube Music и музыки на диске. Общая очередь, загрузка треков, медиаклавиши. Windows и Linux.» Update `og.*` the same way.
3. **H1**: keep "CloudMus" as is and add one small grey second line inside the `<h1>` (new key `hero.lead`), e.g. ru «Десктопный музыкальный плеер для Яндекс Музыки, YouTube Music и локальной музыки». Order: CloudMus → lead → orange tagline. This is the only visible change.
4. **JSON-LD `SoftwareApplication`** per language: name, localized description, `applicationCategory: MultimediaApplication`, `operatingSystem: "Windows 10, Windows 11, Linux"`, `offers` price 0, `softwareVersion`, `downloadUrl`, `screenshot`, `license` (MIT), `url`, `inLanguage`, `author`.
5. **Social previews**: `og:image` 1200×630 (`assets/img/og-image.png`), `og:image:width/height`, `og:site_name`, `twitter:card=summary_large_image`.
6. **Performance** (screenshots are already WebP with `srcset` and dimensions): preload `rubik-latin.woff2` (+ `rubik-cyrillic.woff2` on `/ru/`); consider lighter canvas animations on phones (INP).
7. **Release data at build time**: `build.mjs` fetches the latest release and bakes direct links, file names and "version · size" into the HTML; runtime `loadRelease()` keeps updating between deploys.
8. **Semantics and small things**: wrap content in `<main>`; `sitemap.xml` with `<lastmod>` and `xhtml:link` hreflang alternates; `apple-touch-icon.png` 180×180 and a ≥48 px PNG favicon; have native speakers proof-read de/fr/es/it.

## Off-site (manual)

- Google Search Console and Yandex Webmaster: verify the domain, submit `https://cloudmus.app/sitemap.xml`.
- Repository `cloudmus/cloudmus`: Website field → https://cloudmus.app, link at the top of the README, topics (`music-player`, `yandex-music`, `youtube-music`, `qt`, `linux`, `windows`).
- Listings: AlternativeTo (as an alternative to the official clients), Flathub, AUR, Snapcraft.
- Posts: Habr, Linux.org.ru, 4PDA, Reddit (r/linux, r/linuxapps), Product Hunt.

## Later: content pages

Separate pages built by the generator for long-tail queries: "How to listen to Yandex Music on Linux", installation guides for Ubuntu / Fedora / Arch, comparison with the official clients, FAQ (Plus subscription, login safety, where downloads are stored), changelog page per release.
