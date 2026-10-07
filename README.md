# CloudMus site

Landing page for [CloudMus](https://github.com/cloudmus/cloudmus), a desktop music player (Yandex Music, YouTube Music, local folders). Hosted on GitHub Pages. The page copy is in Russian.

Plain static HTML, CSS and vanilla JS. No build step, no framework. Fonts and images are in the repository; the only runtime request is to the GitHub API for the latest release (see below).

## Structure

```
index.html              the whole page (markup and inline styles)
assets/css/style.css    @font-face rules, keyframes, hover states
assets/js/main.js       animations: hero canvas, parallax, feature clouds, footer planet, OS-aware buttons
assets/fonts/           self-hosted Rubik and JetBrains Mono (woff2)
assets/img/             logo and app screenshot
assets/img/services/    service logos
.nojekyll               tells GitHub Pages to serve files as-is
```

## Release data

On load, `assets/js/main.js` (`loadRelease`) calls `https://api.github.com/repos/cloudmus/cloudmus/releases/latest` and:

- points every download link (`a[data-asset="windows|linux"]`, in the hero and in the download cards) at the release's `*-Setup.exe` / `*.AppImage` asset,
- replaces the placeholder file names (`[data-release-file]`) and shows version and size (`[data-release-meta]`).

The result is cached in `localStorage` for 10 minutes (the unauthenticated API limit is 60 requests per hour per IP). If the request fails, the static fallbacks stay: links go to `/releases/latest` and file names are generic.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000/>.

## Edit content

Edit `index.html` directly: the sources, the "coming soon" chips, the feature clouds and the download blocks are plain markup. Feature clouds are the elements with `data-cloud`; `main.js` lays them out, so just add or remove one.

## Deploy

GitHub → Settings → Pages → Deploy from a branch → `main` / `(root)`.
