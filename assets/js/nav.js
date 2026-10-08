// Mobile menu: the hamburger toggles a dropdown panel (see .nav-links in style.css).
(() => {
  'use strict';
  const toggle = document.querySelector('.nav-toggle'), panel = document.getElementById('nav-menu');
  if (!toggle || !panel) return;
  const mq = matchMedia('(max-width: 760px)');
  const lang = panel.querySelector('details.lang');
  const set = open => {
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open && lang) lang.open = false;
  };
  toggle.addEventListener('click', e => { e.stopPropagation(); set(!panel.classList.contains('is-open')); });
  panel.addEventListener('click', e => { if (e.target.closest('a') && !e.target.closest('details.lang summary')) set(false); });
  document.addEventListener('click', e => { if (!panel.contains(e.target) && !toggle.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  mq.addEventListener('change', () => set(false));
})();
