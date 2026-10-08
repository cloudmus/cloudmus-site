"use strict";
(() => {
const CM_SH = [[[3.4,9.4,2.9],[7.2,6.6,3.8],[11.4,7.6,3],[13,10,2.4],[8.2,9.6,3]],[[3.6,9.6,2.8],[6.6,6.8,3.4],[10.6,6,3.4],[13,9.4,2.6],[8.6,9.8,2.9]],[[2.9,10.2,2.5],[6,8.2,3],[9.6,7,3.4],[13,9.6,2.6],[7.8,10.2,2.5],[11,10.4,2.4]],[[3.8,10,2.6],[6.4,8,2.8],[10,6.4,3.8],[13.2,9.8,2.4],[9,10,2.8]]], cmSvg = k => CM_SH[k % CM_SH.length].map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"></circle>').join('');
// On Linux the AppImage button becomes the primary hero action.
const swapDownloadButtons = () => {
  const a = document.getElementById('cta-primary'), b = document.getElementById('cta-secondary');
  if (!a || !b) return;
  [a.innerHTML, b.innerHTML] = [b.innerHTML, a.innerHTML];
  [a.dataset.asset, b.dataset.asset] = [b.dataset.asset, a.dataset.asset];
};

// Latest release: direct download links, real file names, version and size.
// The page works without this (static fallbacks point at /releases/latest).
const RELEASE_API = 'https://api.github.com/repos/cloudmus/cloudmus/releases/latest';
const RELEASE_CACHE_KEY = 'cloudmus.release', RELEASE_TTL = 10 * 60 * 1000;
const ASSET_PATTERNS = { windows: /-Setup\.exe$/i, linux: /\.AppImage$/i };

const readReleaseCache = () => {
  try { return JSON.parse(localStorage.getItem(RELEASE_CACHE_KEY)); } catch { return null; }
};
const fetchRelease = async () => {
  const cached = readReleaseCache();
  if (cached && Date.now() - cached.at < RELEASE_TTL) return cached.release;
  try {
    const res = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const r = await res.json();
    const release = { tag: String(r.tag_name || '').replace(/^v/, ''), assets: {} };
    for (const [os, re] of Object.entries(ASSET_PATTERNS)) {
      const a = (r.assets || []).find(x => re.test(x.name));
      if (a && String(a.browser_download_url).startsWith('https://github.com/')) release.assets[os] = { name: a.name, url: a.browser_download_url, size: a.size };
    }
    try { localStorage.setItem(RELEASE_CACHE_KEY, JSON.stringify({ at: Date.now(), release })); } catch {}
    return release;
  } catch {
    return cached ? cached.release : null;
  }
};
const loadRelease = async () => {
  const release = await fetchRelease();
  if (!release) return;
  const unitEl = document.querySelector('[data-unit-mb]');
  const unit = unitEl ? unitEl.dataset.unitMb : 'MB';
  const mb = new Intl.NumberFormat(document.documentElement.lang || 'en');
  for (const [os, a] of Object.entries(release.assets)) {
    document.querySelectorAll('a[data-asset="' + os + '"]').forEach(el => { el.href = a.url; el.removeAttribute('target'); });
    document.querySelectorAll('[data-release-file="' + os + '"]').forEach(el => { el.textContent = a.name; });
    document.querySelectorAll('[data-release-meta="' + os + '"]').forEach(el => {
      el.textContent = ' · ' + [release.tag, a.size ? mb.format(Math.round(a.size / 1048576)) + ' ' + unit : ''].filter(Boolean).join(' · ');
    });
  }
};

class Landing {
  constructor() {
    const ref = id => ({ current: document.getElementById(id) });
    this.heroCanvas = ref('hero-canvas');
    this.heroLogo = ref('hero-logo');
    this.featCanvas = ref('feat-canvas');
    this.bgLayer = ref('bg-layer');
    this.navBg = ref('nav-bg');
    this.planetRef = ref('planet');
    this.pulseLayer = ref('pulse-layer');
    this.orbLayer = ref('orb-layer');
    this.lgCloud = ref('lg-cloud');
    this.lgRing1 = ref('lg-ring1');
    this.lgRing2 = ref('lg-ring2');
    this.lgCore = ref('lg-core');
    this.cloudGridRef = ref('cloud-grid');
  }
  init() {
    if (/Linux|X11/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)) swapDownloadButtons();
    this.startHero();
    this.startClouds();
    loadRelease();
    const IN = 'max(clamp(16px,4vw,48px),calc((100% - 1200px) / 2))';
    let full = null;
    this.onNavScroll = () => {
      const f = scrollY > 8, b = this.navBg.current;
      if (!b || f === full) return; full = f;
      b.style.top = b.style.bottom = f ? '0px' : '14px';
      b.style.left = b.style.right = f ? '0px' : IN;
      b.style.borderRadius = f ? '0px' : '16px';
      b.style.borderColor = f ? 'transparent transparent rgba(255,255,255,.08)' : 'rgba(255,255,255,.08)';
      b.style.background = f ? 'rgba(24,19,17,.62)' : 'rgba(30,24,21,.55)';
    };
    addEventListener('scroll', this.onNavScroll, { passive: true });
    let fh = 0, maxS = 0;
    const planetMeasure = () => {
      const p = this.planetRef.current; if (!p) return;
      const f = p.parentElement; fh = f.offsetHeight; p.style.height = fh + 'px';
      maxS = document.documentElement.scrollHeight - innerHeight;
    };
    const planetUpd = () => {
      const p = this.planetRef.current; if (!p) return;
      const rem = Math.max(0, p.parentElement.getBoundingClientRect().bottom - innerHeight), off = rem * 0.2;
      if (off > innerHeight) { if (p.style.visibility !== 'hidden') p.style.visibility = 'hidden'; return; }
      p.style.visibility = 'visible';
      p.style.transform = 'translate3d(0,' + off.toFixed(2) + 'px,0)';
    };
    let orbs = null;
    const orbUpd = () => {
      const L = this.orbLayer.current; if (!L) return;
      if (!orbs) orbs = [...L.children].map(el => [el, +el.dataset.k || 0]);
      const y = scrollY;
      for (const [el, k] of orbs) el.style.transform = 'translate3d(0,' + (y * k).toFixed(1) + 'px,0)';
    };
    this.onPlanetScroll = () => { planetUpd(); orbUpd(); };
    orbUpd();
    this.onPlanetResize = () => { planetMeasure(); planetUpd(); };
    const layoutBg = () => {
      const bl = this.bgLayer.current, shot = document.getElementById('shot'), dl = document.getElementById('download');
      if (!bl || !shot || !dl) return;
      const pr = bl.parentElement.getBoundingClientRect(), t = shot.getBoundingClientRect().top - pr.top, b = dl.getBoundingClientRect().bottom - pr.top;
      bl.style.top = t.toFixed(0) + 'px'; bl.style.height = Math.max(0, b - t).toFixed(0) + 'px';
    };
    layoutBg(); new ResizeObserver(layoutBg).observe(document.body); addEventListener('load', layoutBg);
    this.planetRO = new ResizeObserver(this.onPlanetResize); this.planetRO.observe(document.body);
    addEventListener('scroll', this.onPlanetScroll, { passive: true });
    addEventListener('resize', this.onPlanetResize);
    this.onPlanetResize();
    const contPaths = ["M60 300C90 250 170 235 230 250C290 262 300 300 350 296C400 292 420 330 380 360C330 400 240 380 190 405C140 430 70 400 50 360C40 335 45 320 60 300Z","M520 175C570 150 660 150 700 170C740 190 720 225 760 240C800 255 790 300 740 310C690 320 650 290 610 300C560 312 520 290 510 255C500 222 490 192 520 175Z","M900 150C960 135 1060 140 1110 165C1160 190 1150 230 1110 245C1070 260 1040 240 1000 255C950 274 900 250 885 215C872 185 870 160 900 150Z","M1250 210C1300 190 1400 195 1460 220C1520 245 1600 270 1610 330L1610 430L1330 430C1300 400 1270 380 1250 340C1220 300 1210 230 1250 210Z","M820 330C850 315 900 320 905 345C910 370 870 385 840 375C815 366 800 342 820 330Z"].map(d => new Path2D(d)), hitCtx = document.createElement('canvas').getContext('2d');
    const spawnPulse = () => {
      const L = this.pulseLayer.current, P = this.planetRef.current;
      this.pulseT = setTimeout(spawnPulse, 500 + Math.random() * 1300);
      if (!L || !P || P.style.visibility === 'hidden' || document.hidden) return;
      const W = P.offsetWidth, H = P.offsetHeight, k = Math.max(W / 1600, H / 420), ox = (W - 1600 * k) / 2;
      const ft = P.parentElement.lastElementChild, pr = P.getBoundingClientRect(), boxes = ft ? [...ft.querySelectorAll('a, span, img')].map(el => { const b = el.getBoundingClientRect(); return [b.left - pr.left - 40, b.top - pr.top - 26, b.right - pr.left + 40, b.bottom - pr.top + 26]; }) : [];
      let px = -1, py = -1, vy = 0;
      for (let t = 0; t < 30; t++) {
        const vx = Math.random() * 1600; vy = 120 + Math.random() * 300;
        if ((vx - 800) ** 2 + (vy - 3320) ** 2 > 3185 ** 2) continue;
        if (!contPaths.some(p => hitCtx.isPointInPath(p, vx, vy))) continue;
        const sx = vx * k + ox, sy = vy * k;
        if (sx < 24 || sx > W - 24 || sy > H - 10 || boxes.some(b => sx > b[0] && sx < b[2] && sy > b[1] && sy < b[3])) continue;
        px = sx; py = sy; break;
      }
      if (px < 0) return;
      const s = (0.85 + (vy - 120) / 300 * 0.6) * Math.min(1.3, Math.max(.75, k)), g = document.createElement('div');
      g.style.cssText = 'position:absolute;left:' + px.toFixed(1) + 'px;top:' + py.toFixed(1) + 'px;width:0;height:0';
      const dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#ffc2a8;box-shadow:0 0 16px 6px rgba(255,90,43,.85)';
      g.appendChild(dot);
      dot.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(' + s + ')', offset: .15 }, { opacity: 0, transform: 'scale(' + s * .6 + ')' }], { duration: 3000, easing: 'ease-out', fill: 'forwards' });
      for (let q = 0; q < 3; q++) {
        const r = document.createElement('div');
        r.style.cssText = 'position:absolute;left:-80px;top:-80px;width:160px;height:160px;border-radius:50%;border:2px solid rgba(255,122,77,.9);opacity:0';
        g.appendChild(r);
        r.animate([{ opacity: .9, transform: 'scale(.04,.015)' }, { opacity: 0, transform: 'scale(' + (1.5 * s) + ',' + (0.45 * s) + ')' }], { duration: 2800, delay: q * 450, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' });
      }
      L.appendChild(g);
      setTimeout(() => g.remove(), 4400);
    };
    spawnPulse();
    this.onNavScroll();
  }
  startClouds() {
    const mouse = { x: -1e4, y: -1e4 };
    this.onCloudMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', this.onCloudMove, { passive: true });
    document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -1e4; });
    const rnd = i => { const s = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
    const st = [], lay = { W: 0, n: 0, p: [] };
    const tick = () => {
      const grid = this.cloudGridRef.current;
      if (grid) {
        const els = grid.querySelectorAll('[data-cloud]');
        const gr = grid.getBoundingClientRect(), W = grid.clientWidth, n = els.length;
        const near = mouse.x > gr.left - 320 && mouse.x < gr.right + 320 && mouse.y > gr.top - 320 && mouse.y < gr.bottom + 320;
        const laid = W === lay.W && n === lay.n && lay.done;
        if (laid && (gr.bottom < -200 || gr.top > innerHeight + 200 || (!near && lay.idle))) { this.cloudRaf = requestAnimationFrame(tick); return; }
        if (!lay.ch || W !== lay.W) lay.ch = els[0] ? els[0].offsetHeight : 190;
        if (n && (W !== lay.W || n !== lay.n)) {
          lay.W = W; lay.n = n; lay.p = [];
          const cw = 300, ch = 200;
          if (W < 640) {
            els.forEach((el, i) => lay.p.push([W / 2 - cw / 2 + (rnd(i) - .5) * Math.min(60, W - cw), i * (ch - 20)]));
            grid.style.height = (n * (ch - 20) + 20) + 'px';
          } else {
            const AO = W / 2;
            let BO = Math.max(ch, AO * 0.9);
            const sc = Math.max(0.85, Math.min(1, Math.sqrt(Math.PI * AO * BO / (n * cw * ch * 1.4))));
            BO = Math.max(BO, n * cw * ch * sc * sc * 1.4 / (Math.PI * AO));
            lay.sc = sc;
            const SX = (cw + 10) * sc, SY = (ch - 10) * sc, A = AO - cw * sc / 2, B = BO - ch * sc / 2, GA = Math.PI * (3 - Math.sqrt(5));
            const pts = [];
            for (let i = 0; i < n; i++) { const r = Math.sqrt((i + .5) / n) * .92, t = i * GA + 0.4 + (rnd(i) - .5) * .5; pts.push([Math.cos(t) * r * A, Math.sin(t) * r * B]); }
            for (let it = 0; it < 1500; it++) {
              let moved = false;
              for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
                const P = pts[i], Q = pts[j], dx = Q[0] - P[0], dy = Q[1] - P[1], ox = SX - Math.abs(dx), oy = SY - Math.abs(dy);
                if (ox > 0.5 && oy > 0.5) {
                  moved = true;
                  if (ox / SX < oy / SY) { const m = ox * .5 * (dx < 0 ? -1 : 1); P[0] -= m; Q[0] += m; }
                  else { const m = oy * .5 * (dy < 0 ? -1 : 1); P[1] -= m; Q[1] += m; }
                }
              }
              if (it % 3 === 0) for (const P of pts) { const k = Math.hypot(P[0] / A, P[1] / B); if (k > 1) { const f = 1 - (1 - 1 / k) * .5; P[0] *= f; P[1] *= f; } }
              if (!moved) break;
            }
            let minY = Infinity, maxY = -Infinity;
            pts.forEach(P => { minY = Math.min(minY, P[1]); maxY = Math.max(maxY, P[1]); });
            pts.forEach(P => lay.p.push([W / 2 + P[0] - cw / 2, P[1] - minY - ch * (1 - sc) / 2]));
            grid.style.height = (maxY - minY + ch * sc + 20) + 'px';
          }
        }
        let moving = false;
        els.forEach((el, i) => {
          if (!st[i]) {
            st[i] = { rot: (rnd(i + 99) - .5) * 6, sc: .97 + rnd(i + 21) * .06, x: 0, y: 0 };
            const sh = el.querySelector('[data-cloud-shape]');
            if (sh) { sh.firstChild.innerHTML = cmSvg(i + 1); if (rnd(i + 7) > .5) sh.style.transform = 'scaleX(-1)'; if (rnd(i + 13) < .35) { sh.firstChild.setAttribute('fill', 'rgb(255,140,95)'); sh.firstChild.setAttribute('opacity', '.22'); } }
          }
          const s = st[i], p = lay.p[i] || [0, 0];
          const cx = gr.left + p[0] + 150, cy = gr.top + p[1] + 100;
          const dx = cx - mouse.x, dy = cy - mouse.y, d = Math.hypot(dx, dy) || 1;
          const R = 300, f = d < R ? Math.pow(1 - d / R, 2) * 40 : 0;
          s.x += ((dx / d) * f - s.x) * .1; s.y += ((dy / d) * f - s.y) * .1;
          if (Math.abs(s.x) > .3 || Math.abs(s.y) > .3) moving = true;
          el.style.transform = 'translate(' + (p[0] + s.x).toFixed(1) + 'px,' + (p[1] + s.y).toFixed(1) + 'px) rotate(' + s.rot.toFixed(2) + 'deg) scale(' + (s.sc * (lay.sc || 1)).toFixed(3) + ')';
        });
        lay.idle = !moving && !near; lay.done = n > 0 && W > 0;
      }
      this.cloudRaf = requestAnimationFrame(tick);
    };
    tick();
  }
  startHero() {
    const cv = this.heroCanvas.current, logo = this.heroLogo.current;
    if (!cv || !logo) return;
    const mkSprite = (col, k) => { const c = document.createElement('canvas'); c.width = 346; c.height = 244; const x = c.getContext('2d'); x.scale(20, 20); x.translate(0.7, -1.6); x.fillStyle = col; CM_SH[k].forEach(([cx, cy, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }); return c; };
    const spW = CM_SH.map((_, k) => mkSprite('rgb(255,240,232)', k)), spO = CM_SH.map((_, k) => mkSprite('rgb(255,140,95)', k));
    const spWd = CM_SH.map((_, k) => mkSprite('rgb(120,104,98)', k)), spOd = CM_SH.map((_, k) => mkSprite('rgb(140,72,52)', k)), urlsD = [spWd.map(c => c.toDataURL()), spOd.map(c => c.toDataURL())];
    const CW = 160, CH = 113, SVGNS = 'http://www.w3.org/2000/svg';
    const shape = '<circle cx="3.4" cy="9.4" r="2.9"></circle><circle cx="7.2" cy="6.6" r="3.8"></circle><circle cx="11.4" cy="7.6" r="3"></circle><circle cx="13" cy="10" r="2.4"></circle><circle cx="8.2" cy="9.6" r="3"></circle>';
    cv.innerHTML = '';
    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;left:50%;top:50%;width:600px;height:600px;margin:-300px 0 0 -300px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,110,60,.7),rgba(255,90,43,.25) 45%,rgba(255,90,43,0));will-change:transform,opacity';
    cv.appendChild(glow);
    const pool = [];
    const urls = [spW.map(c => c.toDataURL()), spO.map(c => c.toDataURL())];
    for (let i = 0; i < 28; i++) {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:0;top:0;width:' + CW + 'px;height:' + CH + 'px;margin:' + (-CH / 2) + 'px 0 0 ' + (-CW / 2) + 'px;will-change:transform,opacity;opacity:0';
      const im = new Image(); im.src = urls[i % 3 === 0 ? 1 : 0][i % 4]; im.width = CW; im.height = CH; im.decoding = 'async'; im.style.display = 'block'; el.appendChild(im);
      cv.appendChild(el); pool.push({ el, warm: i % 3 === 0, used: false, vis: false });
    }
    let dpr = 1, W = 0, H = 0;
    const resize = () => { W = cv.clientWidth; H = cv.clientHeight; };
    resize();
    this.ro = new ResizeObserver(resize); this.ro.observe(cv);
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clouds = [], ZF = 14, ZN = 0.35; let zc = 100000;
    const spawn = (z0) => {
      const a = Math.random() * Math.PI * 2, r = 0.9 + Math.random() * 2.6;
      const p = pool.find(q => !q.used); if (!p) return; p.used = true; p.el.style.zIndex = String(--zc);
      clouds.push({ p, x: Math.cos(a) * r * 1.5, y: Math.sin(a) * r * 0.85, z: z0 ?? ZF, s: 0.6 + Math.random() * 0.8, rot: (Math.random() - .5) * 14, flip: Math.random() < .5 ? -1 : 1 });
    };
    for (let i = 0; i < 22; i++) spawn(ZN + 0.5 + Math.random() * (ZF - ZN - 0.5));
    const ms = { x: 0, y: 0, tx: 0, ty: 0 };
    this.onHeroMove = e => { ms.tx = e.clientX / innerWidth - .5; ms.ty = e.clientY / innerHeight - .5; };
    window.addEventListener('mousemove', this.onHeroMove, { passive: true });
    const layers = [[this.lgCloud, .035, .16, .74], [this.lgRing1, .07, .2, .7], [this.lgRing2, .11, .26, .64], [this.lgCore, .17, .34, .58]].map(([r, amp, k, d]) => ({ r, amp, k, d, x: 0, v: 0 }));
    let bpm = 112, beatLen = 60000 / bpm, nextBeat = performance.now() + 300, beatN = 0;
    let env = 0, speed = 1, last = performance.now(), spawnAcc = 0;
    const hit = (strength) => { env = Math.max(env, strength); };
    const tick = (now) => {
      this.raf = requestAnimationFrame(tick);
      const dt = Math.min(50, now - last); last = now;
      if (document.hidden) return;
      this.fr = (this.fr || 0) + 1;
      const on = !reduce;
      if (on && now >= nextBeat) {
        beatN++;
        const bar = beatN % 4;
        if (Math.random() > 0.08) hit(bar === 1 ? 1 : 0.55 + Math.random() * 0.3);
        if (Math.random() < 0.18) setTimeout(() => hit(0.35 + Math.random() * 0.35), beatLen * (Math.random() < .5 ? 0.5 : 0.75));
        if (beatN % 32 === 0) { bpm = 96 + Math.random() * 40; beatLen = 60000 / bpm; }
        nextBeat += beatLen * (1 + (Math.random() - .5) * 0.04);
        if (now - nextBeat > 1000) nextBeat = now + beatLen;
      }
      env *= Math.pow(0.0035, dt / 1000);
      const target = on ? 1.6 : 0.15;
      speed += (target - speed) * Math.min(1, dt / 90);
      const heroVis = cv.getBoundingClientRect().bottom > 0;
      const cx = W / 2, cy = H / 2;
      if (heroVis) {
      const gs = (160 + env * 140) / 300;
      glow.style.transform = 'scale(' + gs.toFixed(3) + ')'; glow.style.opacity = (0.45 + env * 0.55).toFixed(3);
      spawnAcc += dt * speed * 0.0035;
      while (spawnAcc > 1 && clouds.length < 28) { spawn(); spawnAcc -= 1; }
      const fl = Math.min(W, H * 1.6) * 0.55, camX = ms.x * 0.9, camY = ms.y * 0.6;
      for (let i = clouds.length - 1; i >= 0; i--) {
        const c = clouds[i];
        c.z -= speed * dt * 0.0011;
        if (c.z < ZN) { c.p.used = false; c.p.el.style.opacity = '0'; c.p.vis = false; clouds.splice(i, 1); }
      }
      for (const c of clouds) {
        const k = fl / c.z;
        const x = cx + (c.x - camX) * k, y = cy + (c.y - camY) * k;
        const sc = c.s * k * 0.09;
        const ext = sc * 9, ex = Math.min(x - ext, W - x - ext) / (W * .22), ey = Math.min(y - ext * .6, H - y - ext * .6) / (H * .22), vg = Math.max(0, Math.min(1, ex, ey));
        const alpha = Math.min(1, (ZF - c.z) / 4) * Math.min(1, (c.z - ZN) / 1.2) * 0.16 * vg * (c.p.warm ? 1.35 : 0.8);
        const st = c.p.el.style;
        if (alpha <= 0.003) { if (c.p.vis) { st.opacity = '0'; c.p.vis = false; } continue; }
        const f = sc * 17.3 / CW, big = f * CW / W; if (big > 1.3) { if (c.p.vis) { st.opacity = '0'; c.p.vis = false; } continue; }
        st.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + c.rot.toFixed(1) + 'deg) scale(' + (f * c.flip).toFixed(3) + ',' + f.toFixed(3) + ')';
        st.opacity = (alpha * Math.min(1, (1.3 - big) / 0.5)).toFixed(3); c.p.vis = true;
      }
      }
      ms.x += (ms.tx - ms.x) * Math.min(1, dt / 220); ms.y += (ms.ty - ms.y) * Math.min(1, dt / 220);
      if (heroVis) layers.forEach(L => { const w = 2 * Math.PI * (5 + L.k * 12), z = 0.32, n = Math.ceil(dt / 4), st = dt / n / 1000; for (let j = 0; j < n; j++) { L.v += ((env - L.x) * w * w - 2 * z * w * L.v) * st; L.x += L.v * st; } if (!isFinite(L.x)) { L.x = 0; L.v = 0; } L.x = Math.max(-.5, Math.min(1.5, L.x)); if (L.r.current) L.r.current.style.transform = 'scale(' + (1 + L.x * L.amp).toFixed(4) + ')'; });
      const fc = this.featCanvas.current;
      if (fc) {
        const rr = fc.getBoundingClientRect();
        if (rr.bottom > 0 && rr.top < innerHeight && (fc.width !== Math.round(fc.clientWidth) || fc.height !== Math.round(fc.clientHeight) || !this.fcDrawn)) { this.fcDrawn = true;
          const fw = fc.clientWidth, fh = fc.clientHeight;
          if (fc.width !== Math.round(fw * dpr) || fc.height !== Math.round(fh * dpr)) { fc.width = Math.round(fw * dpr); fc.height = Math.round(fh * dpr); }
          const fx = fc.getContext('2d');
          fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.clearRect(0, 0, fw, fh);
          const gx = fw / 2, gy = fh / 2, grr = Math.max(fw, fh) * .42 * (1 + env * .06);
          const gg = fx.createRadialGradient(gx, gy, 0, gx, gy, grr);
          gg.addColorStop(0, 'rgba(255,100,55,0.16)'); gg.addColorStop(.5, 'rgba(160,60,110,0.07)'); gg.addColorStop(1, 'rgba(255,90,43,0)');
          fx.fillStyle = gg; fx.fillRect(0, 0, fw, fh);

        }
      }
      const bl = this.bgLayer.current;
      if (bl) {
        // Drifting clouds cover everything from the screenshot down to the download block.
        const bh = bl.clientHeight, bw = bl.clientWidth;
        if (bh > 0 && bw > 0) {
          if (!this.bgl) this.bgl = [];
          const want = Math.max(10, Math.min(120, Math.round(18 * (bh / 900) * (bw / 1390))));
          while (this.bgl.length < want) {
            const i = this.bgl.length, z = .2 + Math.random() * .8, warm = Math.random() < .3, w = Math.round(80 + z * 200);
            const im = new Image(); im.src = urlsD[warm ? 1 : 0][i % 4]; im.width = w; im.height = Math.round(w * 12.2 / 17.3); im.decoding = 'async';
            im.style.cssText = 'position:absolute;left:0;top:0;display:block;opacity:0.001;will-change:transform,opacity';
            bl.appendChild(im);
            this.bgl.push({ im, z, w, fl: Math.random() < .5 ? ' scaleX(-1)' : '', op: warm ? 0.12 + z * 0.16 : 0.08 + z * 0.12, x: Math.random() * 1.6 - .3, y: Math.random(), dir: Math.random() < .5 ? -1 : 1, vy: (Math.random() - .5) * .3 });
          }
          while (this.bgl.length > want) this.bgl.pop().im.remove();
          const br = bl.getBoundingClientRect(), vc = innerHeight / 2, fadeY = Math.min(bh * .18, 260), fz = innerWidth * .25;
          const sm = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
          for (const c of this.bgl) {
            c.x += c.dir * dt * 0.000026 * (0.3 + c.z) * (on ? 1 : 0.3);
            c.y += c.vy * dt * 0.000004 * (900 / bh);
            if (c.x > 1.3 || c.x < -0.3) { c.x = c.dir > 0 ? -0.3 : 1.3; c.y = Math.random(); }
            if (c.y > 1.05) c.y = -0.05; else if (c.y < -0.05) c.y = 1.05;
            const st = c.im.style, py0 = c.y * bh - c.w * .35, ys = br.top + py0 + c.w * .35;
            if (ys < -300 || ys > innerHeight + 300) { if (c.vis) { st.opacity = '0.001'; c.vis = false; } continue; }
            // depth parallax: near clouds (large z) move faster than the page, far ones slower
            const py = py0 + (ys - vc) * (c.z - .5) * 0.9, px = c.x * bw, sxc = br.left + px + c.w / 2, syc = br.top + py + c.w * .35;
            const fe = sm(Math.min(c.x + 0.3, 1.3 - c.x) / 0.45) * sm(Math.min(sxc, innerWidth - sxc) / fz) * sm(Math.min(c.y * bh + 40, bh - c.y * bh + 40) / fadeY);
            st.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)' + c.fl;
            st.opacity = Math.max(0.001, c.op * fe).toFixed(4); c.vis = true;
          }
        }
      }
      if (heroVis) logo.style.transform = 'translate(' + (ms.x * 14).toFixed(1) + 'px,' + (ms.y * 10).toFixed(1) + 'px)';
      
    };
    this.raf = requestAnimationFrame(tick);
  }
}

new Landing().init();
})();
