# AGENTS.md

Static landing page for CloudMus, deployed on GitHub Pages. See [README.md](README.md) for the layout and how to run it.

## Rules

- `assets/js/dc-runtime.js` is generated ("do not edit" in its header). Never modify it by hand.
- `assets/js/image-slot.js` is an upstream starter component. Leave it alone unless a slot really needs a change.
- All page content lives in `index.html`: inline styles, `{{ }}` bindings, `sc-for` / `sc-if` blocks, and a `class Component extends DCLogic` script at the bottom with the data (`services`, `soon`, `features`). Follow the existing inline-style approach.
- Page copy is Russian. Code, comments, file names and docs are English.
- Asset names are lowercase kebab-case English (`app-screenshot.png`). Keep paths relative so the site works under a GitHub Pages project path.
- Keep images small. The screenshot is already 1.2 MB; compress new ones.
- There is no build and no tests. Verify changes with `python -m http.server` and a browser: the page must render and the console must show no 404s.
- Do not commit unless asked.
