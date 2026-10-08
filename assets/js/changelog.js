// Clicking the version badge in the header opens a panel with the latest release notes.
(() => {
  'use strict';
  const API = 'https://api.github.com/repos/cloudmus/cloudmus/releases?per_page=8';
  const RELEASES_URL = 'https://github.com/cloudmus/cloudmus/releases';
  const CACHE_KEY = 'cloudmus.changelog', TTL = 10 * 60 * 1000;
  const badge = document.querySelector('[data-release-version]'), panel = document.getElementById('changelog');
  if (!badge || !panel) return;
  const body = panel.querySelector('.cl-body'), t = panel.dataset;
  let loaded = false;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Minimal, safe markdown: everything is escaped first, then lists, headings, `code`, **bold** and https links.
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const markdown = text => {
    let html = '', list = false;
    for (const raw of String(text || '').split(/\r?\n/)) {
      const line = raw.trim(), li = /^[-*+]\s+(.*)$/.exec(line);
      if (li) { if (!list) { html += '<ul>'; list = true; } html += '<li>' + inline(li[1]) + '</li>'; continue; }
      if (list) { html += '</ul>'; list = false; }
      const h = /^#{1,6}\s+(.*)$/.exec(line);
      if (h) html += '<h4>' + inline(h[1]) + '</h4>';
      else if (line) html += '<p>' + inline(line) + '</p>';
    }
    return html + (list ? '</ul>' : '');
  };

  const render = releases => {
    const fmt = new Intl.DateTimeFormat(document.documentElement.lang || 'en', { year: 'numeric', month: 'long', day: 'numeric' });
    body.innerHTML = releases.map(r => {
      const tag = String(r.tag_name || ''), name = (/^\d/.test(tag) ? 'v' : '') + tag;
      const date = r.published_at ? fmt.format(new Date(r.published_at)) : '';
      const url = String(r.html_url || '').startsWith('https://github.com/') ? r.html_url : RELEASES_URL;
      return '<section class="cl-release"><h3><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(name) + '</a>' +
        (date ? '<time datetime="' + esc(r.published_at) + '">' + esc(date) + '</time>' : '') + '</h3>' + markdown(r.body) + '</section>';
    }).join('') + '<a class="cl-all" href="' + RELEASES_URL + '" target="_blank" rel="noopener">' + esc(t.all) + '</a>';
  };

  const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; } };
  const load = async () => {
    const cached = readCache();
    if (cached && Date.now() - cached.at < TTL) return cached.releases;
    try {
      const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const releases = (await res.json()).filter(r => !r.draft && !r.prerelease)
        .map(r => ({ tag_name: r.tag_name, published_at: r.published_at, html_url: r.html_url, body: r.body }));
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), releases })); } catch {}
      return releases;
    } catch {
      return cached ? cached.releases : null;
    }
  };

  const setOpen = open => {
    panel.classList.toggle('is-open', open);
    badge.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      // only one dropdown at a time
      document.getElementById('nav-menu')?.classList.remove('is-open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      const lang = document.querySelector('details.lang'); if (lang) lang.open = false;
      panel.focus({ preventScroll: true });
    }
  };
  const open = async () => {
    setOpen(true);
    if (loaded) return;
    body.innerHTML = '<p class="cl-state">' + esc(t.loading) + '</p>';
    const releases = await load();
    if (releases && releases.length) { render(releases); loaded = true; }
    else body.innerHTML = '<p class="cl-state">' + esc(t.error) + '</p><a class="cl-all" href="' + RELEASES_URL + '" target="_blank" rel="noopener">' + esc(t.all) + '</a>';
  };

  badge.addEventListener('click', e => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // keep "open in new tab" working
    e.preventDefault(); e.stopPropagation();
    if (panel.classList.contains('is-open')) { setOpen(false); badge.focus(); } else open();
  });
  panel.querySelector('.cl-close').addEventListener('click', () => { setOpen(false); badge.focus(); });
  document.addEventListener('click', e => { if (!panel.contains(e.target) && !badge.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) { setOpen(false); badge.focus(); } });
  // opening the mobile menu closes the changelog
  document.querySelector('.nav-toggle')?.addEventListener('click', () => panel.classList.remove('is-open'));
})();
