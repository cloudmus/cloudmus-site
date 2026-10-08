# AGENTS.md

Static, multilingual landing page for CloudMus, built by `build.mjs` and deployed to GitHub Pages by Actions. See [README.md](README.md) for the layout and commands.

## Rules

- Edit `src/index.template.html`, `i18n/*.json`, `assets/` and `build.mjs`. Never edit or commit `dist/`.
- The site lives at the apex domain `https://cloudmus.app` (`SITE_URL` default in `build.mjs`), deployed from `master`. Pending SEO work is tracked in `docs/seo.md`.
- No frameworks, no npm packages, no bundler. The generator uses only Node built-ins.
- All user-visible text (including `alt`, `title`, `aria-label`, meta tags) is a `{{key}}` from `i18n/*.json`; never hard-code a language in the template or in JS. Product names (CloudMus, Yandex Music, ...) and file names stay literal.
- `i18n/en.json` is the source of truth. When you add or rename a key, update all six dictionaries in the same change. Run `node build.mjs`: it must finish with no warnings and no errors.
- Everything is self-hosted. Do not add CDN scripts, web-font links or other external requests. The only exceptions are plain `<a href>` links, the GitHub API calls in `loadRelease()` (`assets/js/main.js`, latest release) and `assets/js/changelog.js` (release notes, fetched only when the version badge is clicked) and Google Analytics, which `build.mjs` injects (measurement ID in `build.mjs`).
- Download links carry `data-asset="windows|linux"`; file name and version/size placeholders carry `data-release-file` / `data-release-meta`. Keep a working static fallback (`/releases/latest`) for when the API is unavailable, and set API-provided values with `textContent`, never `innerHTML`.
- Styles repeated across elements (cards, chips, feature clouds, section wrapper, text colors) are classes in `assets/css/style.css`; one-off layout stays inline in the template. If the same inline `style` appears twice, make it a class. The stylesheet also holds `@font-face`, keyframes, hover states and the language switcher.
- `assets/js/main.js` drives the animations through element ids (`hero-canvas`, `nav-bg`, `planet`, `cloud-grid`, `shot`, `bg-layer`, ...) and `data-cloud`, `data-k`. If you rename an id in the template, update `main.js`.
- Asset names are lowercase kebab-case English. Paths in the template use `{{base}}assets/...` so every language folder resolves them (works under a GitHub Pages project path too).
- Keep images small; fonts are woff2, Cyrillic and Latin subsets only. Screenshots live in `assets/img/screenshots/` as WebP: `<name>.webp` (≤1920 px wide, used in the popup) plus `<name>-960.webp` for the carousel `srcset` when the original is wider than 960 px. Each slide in the template needs `width`/`height` and a localized `alt` (`shot.*` keys). `assets/js/gallery.js` drives the carousel (`[data-gallery]`, `.g-slide`, `.g-lightbox`).
- Code, comments, file names and docs are English.
- There are no tests. Verify in a browser: build, serve `dist/` over HTTP, check every language renders, the console is clean and the network tab shows no external requests except the release API.
- Mobile layout: at ≤760 px the header menu collapses into the hamburger panel (`.nav-toggle`, `.nav-links`, `assets/js/nav.js`); at ≤640 px blocks are compacted (sources become a swipeable row, features switch from the JS physics layout to a two-column CSS grid via `.cloud-grid.compact` in `startClouds`, download cards shrink). Check both widths (e.g. 390 px) after layout changes.
- Do not commit unless asked.
