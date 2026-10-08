// Language choice: remember the switcher click and, on the English root page,
// send first-time visitors to their browser language if we have a translation.
(() => {
  const KEY = 'cloudmus.lang';
  const SUPPORTED = ['en', 'ru', 'de', 'fr', 'es', 'it'];
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch {} };

  if (document.documentElement.hasAttribute('data-lang-root') && !get()) {
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
    const match = prefs.map(l => String(l).toLowerCase().split('-')[0]).find(l => SUPPORTED.includes(l));
    if (match && match !== 'en') location.replace(match + '/' + location.search + location.hash);
  }

  // <details> closes instantly, so play the slide-out first and then drop [open].
  const closeMenu = d => {
    if (!d.open || d.classList.contains('closing')) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { d.open = false; return; }
    d.classList.add('closing');
    const done = () => { d.classList.remove('closing'); d.open = false; };
    d.querySelector('.lang-menu').addEventListener('animationend', done, { once: true });
    setTimeout(() => { if (d.classList.contains('closing')) done(); }, 400);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('details.lang');
    if (menu) {
      menu.querySelector('summary').addEventListener('click', e => { if (menu.open) { e.preventDefault(); closeMenu(menu); } });
      document.addEventListener('click', e => { if (!menu.contains(e.target)) closeMenu(menu); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(menu); });
    }
    document.querySelectorAll('.lang-menu a').forEach(a => a.addEventListener('click', () => set(a.getAttribute('hreflang'))));
  });
})();
