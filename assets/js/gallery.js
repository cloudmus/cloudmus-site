// Screenshot carousel: centre slide large, neighbours smaller and faded (a rotating drum),
// arrows, dots, swipe, autoplay and a fullscreen popup.
(() => {
  'use strict';
  const AUTOPLAY_MS = 5000, SWIPE_PX = 40;
  const root = document.querySelector('[data-gallery]');
  if (!root) return;
  const slides = [...root.querySelectorAll('.g-slide')], n = slides.length;
  const dotsBox = root.querySelector('.g-dots');
  const lb = document.querySelector('.g-lightbox'), lbImg = lb && lb.querySelector('.g-lb-img'), lbCount = lb && lb.querySelector('.g-lb-count');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = 0, hover = false, visible = true;

  const wrap = i => (i % n + n) % n;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', (i + 1) + ' / ' + n);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });

  const render = () => {
    slides.forEach((s, i) => {
      let d = wrap(i - cur);
      if (d > n / 2) d -= n;
      s.dataset.pos = Math.abs(d) <= 2 ? String(d) : 'far';
      s.tabIndex = d === 0 ? 0 : -1;
      s.setAttribute('aria-hidden', Math.abs(d) > 1 ? 'true' : 'false');
    });
    dots.forEach((b, i) => b.toggleAttribute('aria-current', i === cur));
  };
  const go = i => { cur = wrap(i); render(); if (lb && lb.open) showLb(); };

  // Autoplay: paused on hover/focus, while the popup is open, off-screen or in a hidden tab.
  const schedule = () => {
    clearTimeout(timer);
    if (reduce || hover || !visible || document.hidden || (lb && lb.open)) return;
    timer = setTimeout(() => { go(cur + 1); schedule(); }, AUTOPLAY_MS);
  };
  const restart = schedule;
  root.addEventListener('mouseenter', () => { hover = true; schedule(); });
  root.addEventListener('mouseleave', () => { hover = false; schedule(); });
  root.addEventListener('focusin', () => { hover = true; schedule(); });
  root.addEventListener('focusout', () => { hover = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) new IntersectionObserver(e => { visible = e[0].isIntersecting; schedule(); }).observe(root);

  root.querySelector('.g-prev').addEventListener('click', () => { go(cur - 1); restart(); });
  root.querySelector('.g-next').addEventListener('click', () => { go(cur + 1); restart(); });
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { go(cur - 1); restart(); }
    else if (e.key === 'ArrowRight') { go(cur + 1); restart(); }
  });

  // Swipe; a swipe must not also count as a click on the slide.
  const swipe = (el, onLeft, onRight) => {
    let x0 = null, swiped = false;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; swiped = false; });
    el.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > SWIPE_PX) { swiped = true; (dx < 0 ? onLeft : onRight)(); }
    });
    el.addEventListener('click', e => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);
  };
  swipe(root.querySelector('.g-stage'), () => { go(cur + 1); restart(); }, () => { go(cur - 1); restart(); });

  slides.forEach((s, i) => s.addEventListener('click', () => {
    if (s.dataset.pos === '0') openLb(); else { go(i); restart(); }
  }));

  // Fullscreen popup
  const showLb = () => {
    const s = slides[cur], img = s.querySelector('img');
    lbImg.src = s.dataset.full; lbImg.alt = img.alt;
    lbCount.textContent = (cur + 1) + ' / ' + n;
  };
  const openLb = () => {
    if (!lb || !lb.showModal) return;
    showLb();
    lb.classList.remove('closing');
    lb.showModal();
    document.documentElement.style.overflow = 'hidden';
    schedule();
  };
  const closeLb = () => {
    if (!lb.open || lb.classList.contains('closing')) return;
    const done = () => { lb.classList.remove('closing'); lb.close(); };
    if (reduce) return done();
    lb.classList.add('closing');
    lb.addEventListener('animationend', done, { once: true });
    setTimeout(() => { if (lb.classList.contains('closing')) done(); }, 400);
  };
  if (lb) {
    lb.addEventListener('close', () => { document.documentElement.style.overflow = ''; slides[cur].focus({ preventScroll: true }); schedule(); });
    lb.addEventListener('cancel', e => { e.preventDefault(); closeLb(); });
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    lb.querySelector('.g-lb-close').addEventListener('click', closeLb);
    lb.querySelector('.g-lb-prev').addEventListener('click', () => go(cur - 1));
    lb.querySelector('.g-lb-next').addEventListener('click', () => go(cur + 1));
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(cur - 1);
      else if (e.key === 'ArrowRight') go(cur + 1);
    });
    swipe(lb, () => go(cur + 1), () => go(cur - 1));
  }

  render();
  root.classList.add('is-ready');
  schedule();
})();
