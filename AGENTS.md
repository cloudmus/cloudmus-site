# AGENTS.md

Static landing page for CloudMus, deployed on GitHub Pages. See [README.md](README.md) for the layout and how to run it.

## Rules

- No frameworks, no build step, no package manager. Keep it plain HTML, CSS and vanilla JS.
- Everything is self-hosted. Do not add CDN scripts, web-font links, analytics or any other external request. The only allowed exceptions are plain `<a href>` links and the single GitHub API call in `loadRelease()` (`assets/js/main.js`).
- Download links carry `data-asset="windows|linux"`; file name and version/size placeholders carry `data-release-file` / `data-release-meta`. Keep a working static fallback (`/releases/latest`) for when the API is unavailable, and set API-provided values with `textContent`, never `innerHTML`.
- Content and layout live in `index.html` with inline styles (the original design). Put only reusable things in `assets/css/style.css`: `@font-face`, keyframes, hover states.
- `assets/js/main.js` drives the animations through element ids (`hero-canvas`, `nav-bg`, `planet`, `cloud-grid`, ...) and `data-cloud`, `data-k`. If you rename an id in `index.html`, update `main.js`.
- Page copy is Russian. Code, comments, file names and docs are English.
- Asset names are lowercase kebab-case English (`app-screenshot.png`). Keep paths relative so the site works under a GitHub Pages project path.
- Keep images small. The screenshot is already 1.2 MB; compress new ones. Fonts are woff2, Cyrillic and Latin subsets only.
- There are no tests. Verify changes in a browser (open `index.html` or `python -m http.server`): the page must render, the console must show no errors and the network tab no external requests.
- Do not commit unless asked.
