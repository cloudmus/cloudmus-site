# SEO backlog

Postponed improvements for search visibility of https://cloudmus.app. Constraint: keep the home page visually clean, no hidden text.

## Target queries

| Language | Queries |
|---|---|
| ru | музыкальный плеер, десктопный плеер, плеер для Яндекс Музыки, плеер для YouTube Music, Яндекс Музыка для Linux, Яндекс Музыка для Mac |
| en | music player, desktop music player, Yandex Music player, YouTube Music desktop app / player for Windows, macOS and Linux |
| de | Musikplayer, Desktop-Musikplayer, Player für YouTube Music |
| fr | lecteur de musique, lecteur de musique de bureau, lecteur YouTube Music |
| es | reproductor de música, reproductor de escritorio, reproductor para YouTube Music |
| it | lettore musicale, lettore musicale desktop, lettore per YouTube Music |

## On-page (code)

Done: localized `meta.title` / `meta.description` built around the target queries, JSON-LD `SoftwareApplication` per language, `og:image` (square `og-logo.png`), `og:site_name`, `twitter:card=summary`, preload of the Rubik fonts, `<main>`, `sitemap.xml` with `lastmod` and `xhtml:link` alternates, `apple-touch-icon.png` and a 48 px PNG favicon.

Still open:

1. **H1 lead**: keep "CloudMus" as is and add one small grey second line inside the `<h1>` (new key `hero.lead`), e.g. ru «Десктопный музыкальный плеер для Яндекс Музыки, YouTube Music и локальной музыки». Order: CloudMus → lead → orange tagline. This is the only visible change.
2. **Release data at build time**: `build.mjs` fetches the latest release and bakes direct links, file names and "version · size" into the HTML (and `softwareVersion` into the JSON-LD); runtime `loadRelease()` keeps updating between deploys.
3. **Large social card**: 1200×630 localized `og:image` with the slogan and a screenshot, `twitter:card=summary_large_image`.
4. **Performance**: consider lighter canvas animations on phones (INP).
5. Have native speakers proof-read de/fr/es/it.

## Off-site (manual)

- Google Search Console and Yandex Webmaster: verify the domain, submit `https://cloudmus.app/sitemap.xml`.
- Repository `cloudmus/cloudmus`: Website field → https://cloudmus.app, link at the top of the README, topics (`music-player`, `yandex-music`, `youtube-music`, `qt`, `linux`, `windows`).
- Listings: AlternativeTo (as an alternative to the official clients), Flathub, AUR, Snapcraft.
- Posts: Habr, Linux.org.ru, 4PDA, Reddit (r/linux, r/linuxapps), Product Hunt.

## Later: content pages

Separate pages built by the generator for long-tail queries: "How to listen to Yandex Music on Linux", installation guides for Ubuntu / Fedora / Arch, comparison with the official clients, FAQ (Plus subscription, login safety, where downloads are stored), changelog page per release.
