// Static site generator: src/index.template.html + i18n/*.json -> dist/.
// Usage: node build.mjs   (set SITE_URL to emit canonical/hreflang/sitemap)
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const DEFAULT_LANG = 'en';
const LANGS = {
  en: { name: 'English', locale: 'en_US' },
  ru: { name: 'Русский', locale: 'ru_RU' },
  de: { name: 'Deutsch', locale: 'de_DE' },
  fr: { name: 'Français', locale: 'fr_FR' },
  es: { name: 'Español', locale: 'es_ES' },
  it: { name: 'Italiano', locale: 'it_IT' },
};
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const readJson = f => JSON.parse(readFileSync(f, 'utf8'));
const template = readFileSync('src/index.template.html', 'utf8');
const dicts = Object.fromEntries(Object.keys(LANGS).map(l => [l, readJson(`i18n/${l}.json`)]));
const source = dicts[DEFAULT_LANG];

let failed = false;
const fail = msg => { console.error('error: ' + msg); failed = true; };

for (const [l, d] of Object.entries(dicts)) {
  for (const k of Object.keys(d)) if (!(k in source)) fail(`${l}.json has unknown key "${k}"`);
  for (const k of Object.keys(source)) if (!(k in d)) console.warn(`warning: ${l}.json is missing "${k}", using English`);
}

const pathOf = l => (l === DEFAULT_LANG ? '' : l + '/');
const urlOf = l => SITE_URL + '/' + pathOf(l);

const render = lang => {
  const dict = { ...source, ...dicts[lang] };
  const base = lang === DEFAULT_LANG ? '' : '../';
  const links = Object.entries(LANGS).map(([l, { name }]) =>
    `<a href="${base ? base + pathOf(l) : pathOf(l) || './'}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${name}</a>`).join('');
  const switcher = `<details class="lang"><summary aria-label="Language">${lang.toUpperCase()}</summary><div class="lang-menu">${links}</div></details>`;
  let head = '';
  if (SITE_URL) {
    head = [`<link rel="canonical" href="${urlOf(lang)}">`, `<meta property="og:url" content="${urlOf(lang)}">`,
      ...Object.keys(LANGS).map(l => `<link rel="alternate" hreflang="${l}" href="${urlOf(l)}">`),
      `<link rel="alternate" hreflang="x-default" href="${urlOf(DEFAULT_LANG)}">`].join('\n');
  }
  const vars = { ...Object.fromEntries(Object.entries(dict).map(([k, v]) => [k, esc(v)])),
    lang, base, og_locale: LANGS[lang].locale, head_extra: head, lang_switcher: switcher,
    html_attrs: lang === DEFAULT_LANG ? ' data-lang-root' : '' };
  return template.replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
    if (!(k in vars)) { fail(`template uses unknown placeholder "${k}"`); return ''; }
    return vars[k];
  });
};

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
cpSync('assets', 'dist/assets', { recursive: true });
writeFileSync('dist/.nojekyll', '');
for (const lang of Object.keys(LANGS)) {
  const dir = 'dist/' + pathOf(lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + 'index.html', render(lang));
}
if (SITE_URL) {
  const urls = Object.keys(LANGS).map(l => `  <url><loc>${urlOf(l)}</loc></url>`).join('\n');
  writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}
if (failed) process.exit(1);
console.log(`built ${Object.keys(LANGS).length} languages into dist/`);
