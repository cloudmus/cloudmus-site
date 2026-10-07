# CloudMus site

Landing page for [CloudMus](https://github.com/cloudmus/cloudmus), a desktop music player (Yandex Music, YouTube Music, local folders). Hosted on GitHub Pages. The page copy is in Russian.

## Structure

```
index.html                 the whole page: markup, styles, and the React component script
assets/js/dc-runtime.js    generated runtime that renders index.html (do not edit)
assets/js/image-slot.js    <image-slot> placeholder component, used for upcoming sources
assets/img/                logo and app screenshot
assets/img/services/       service logos
.nojekyll                  tells GitHub Pages to serve files as-is
```

There is no build step. React and Babel are loaded from unpkg at runtime, so the page needs internet access.

## Preview locally

Opening the file directly (`file://`) does not work. Use a local server:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000/>.

## Edit content

At the bottom of `index.html`, the `services`, `soon` and `features` arrays hold the text and icons for the sources, upcoming sources and feature list. The download links point to the latest release of the player repository.

## Deploy

GitHub → Settings → Pages → Deploy from a branch → `main` / `(root)`.
