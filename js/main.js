/* ═══════════════════════════════════════════════════════════
   DevByAmmar — Interaction Engine (vanilla ES2023, zero deps)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);

/* ── 0 · Inertial smooth-scroll engine (software-house feel) ─
   Wheel input accumulates into a virtual target; a rAF loop
   eases the native scroll position toward it. Touch devices and
   reduced-motion users keep native scrolling. External scrolls
   (keyboard, scrollbar, anchor links) re-sync the target.      */
const Smooth = (() => {
  let target = scrollY, current = scrollY, expected = scrollY, running = false;
  const EASE = 0.09, SNAP = 0.7, TOL = 3;

  // Per-frame write. `expected` records exactly what we asked for this
  // frame (immutable once set) so the scroll listener can distinguish
  // our own writes from genuine external scrolls — no race.
  function write(y) {
    expected = y;
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  }
  function step() {
    current = lerp(current, target, EASE);
    if (Math.abs(target - current) <= SNAP) {
      current = target;
      write(current);
      running = false;
      return;
    }
    write(current);
    requestAnimationFrame(step);
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };

  if (finePointer && !reduceMotion) {
    // Tell the browser not to tween our per-frame writes.
    document.documentElement.classList.add('js-smooth');

    addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) return;              // let pinch-zoom through
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;                  // line deltas
      if (e.deltaMode === 2) d *= innerHeight * 0.9;   // page deltas
      target = clamp(target + d, 0, maxScroll());
      kick();
    }, { passive: false });

    // External scroll (keyboard, scrollbar, trackpad)? Adopt it.
    // Own writes match `expected`; late events for a previous frame
    // match `current` (advanced only on the next rAF) — both ignored.
    addEventListener('scroll', () => {
      if (Math.abs(scrollY - expected) > TOL && Math.abs(scrollY - current) > TOL) {
        target = current = expected = scrollY;
      }
    }, { passive: true });

    addEventListener('resize', () => {
      target = current = clamp(current, 0, maxScroll());
      expected = scrollY;
    });
  }

  return {
    goTo(y) {
      target = clamp(y, 0, maxScroll());
      if (finePointer && !reduceMotion) kick();
      else window.scrollTo({ top: target, left: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
    },
    sync() { target = current = expected = scrollY; }
  };
})();

/* ── 1 · Theme (persist + system preference) ─────────────── */
(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem('dba-theme');
  if (saved) root.dataset.theme = saved;
  else root.dataset.theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dba-theme', root.dataset.theme);
  });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem('dba-theme')) root.dataset.theme = e.matches ? 'light' : 'dark';
  });
})();

/* ── 2 · Preloader ───────────────────────────────────────── */
(() => {
  const pre = $('#preloader'), bar = $('#preloaderBar');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(p + Math.random() * 22, 92);
    bar.style.width = p + '%';
  }, 160);
  const done = () => {
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => { pre.classList.add('is-done'); document.body.classList.add('is-ready'); }, 350);
  };
  (document.readyState === 'complete') ? done() : addEventListener('load', done, { once: true });
  setTimeout(done, 4000); // hard failsafe
})();

/* ── 3 · Custom cursor (dot = instant, ring = physics lerp)  */
(() => {
  if (!finePointer || reduceMotion) return;
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
  (function loop() {
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    ring.classList.toggle('is-view', !!e.target.closest('[data-cursor="view"]'));
    ring.classList.toggle('is-hover', !!e.target.closest('[data-cursor="hover"]'));
  });
})();

/* ── 4 · Magnetic elements ───────────────────────────────── */
(() => {
  if (!finePointer || reduceMotion) return;
  $$('.magnetic').forEach(el => {
    const strength = 26;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x / r.width * strength}px, ${y / r.height * strength}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ── 5 · Header state + scroll progress + right rail thumb ─ */
(() => {
  const header = $('#header'), prog = $('#scrollProgress'),
        thumb = $('#railThumb'), pct = $('#railPct'),
        track = $('.scroll-rail__track');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = maxScroll();
      const y = scrollY, ratio = max > 0 ? y / max : 0;
      prog.style.width = (ratio * 100) + '%';
      const trackH = track.clientHeight;
      thumb.style.height = Math.max(trackH * Math.min(innerHeight / (max + innerHeight), 1), 28) + 'px';
      thumb.style.top = (ratio * (trackH - thumb.offsetHeight)) + 'px';
      pct.textContent = Math.round(ratio * 100) + '%';
      header.classList.toggle('is-scrolled', y > 40);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();

/* ── 6 · Active section ↔ rail dots + nav links ──────────── */
(() => {
  const dots = $$('.rail-dot'), links = $$('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      dots.forEach(d => {
        const active = d.dataset.section === id;
        d.classList.toggle('is-active', active);
        active ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current');
      });
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-42% 0px -42% 0px' });
  $$('[data-rail]').forEach(s => io.observe(s));
})();

/* ── 7 · Reveal on scroll + staggered delays + skill bars ── */
(() => {
  const els = $$('.reveal');
  els.forEach(el => { const d = el.dataset.delay; if (d) el.style.setProperty('--rd', d + 'ms'); });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
  const bars = $$('.skill__bar i');
  const bio = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { bars.forEach(b => b.style.width = b.dataset.skill + '%'); bio.disconnect(); }
  }), { threshold: 0.3 });
  const grid = $('.skills__grid'); if (grid) bio.observe(grid);
})();

/* ── 8 · Animated counters ───────────────────────────────── */
(() => {
  const counters = $$('[data-counter]');
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.counter, suffix = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1600;
    (function step(t) {
      const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    io.unobserve(el);
  }), { threshold: 0.6 });
  counters.forEach(c => io.observe(c));
})();

/* ── 9 · 3D tilt + spotlight on cards ────────────────────── */
(() => {
  if (matchMedia('(hover: none)').matches || reduceMotion) return;
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', px * 100 + '%');
      card.style.setProperty('--my', py * 100 + '%');
      card.style.transform = `rotateX(${(py - .5) * -8}deg) rotateY(${(px - .5) * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── 10 · Parallax orbs ──────────────────────────────────── */
(() => {
  if (reduceMotion) return;
  const orbs = $$('[data-parallax]');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      orbs.forEach(o => { o.style.translate = `0 ${y * +o.dataset.parallax}px`; });
      ticking = false;
    });
  }, { passive: true });
})();

/* ── 11 · Project filters ────────────────────────────────── */
(() => {
  const filters = $$('.filter'), projects = $$('.project');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('is-active'));
    btn.classList.add('is-active');
    const tag = btn.dataset.filter;
    projects.forEach(p => {
      const show = tag === 'all' || p.dataset.tags.includes(tag);
      if (show) { p.classList.remove('is-hidden'); p.classList.add('is-in'); }
      else p.classList.add('is-hidden');
    });
  }));
})();

/* ── 12 · Clickable project previews (whole visual opens demo) */
(() => {
  $$('.project__visual[data-link]').forEach(v => {
    const open = () => window.open(v.dataset.link, '_blank', 'noopener');
    v.addEventListener('click', open);
    v.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
})();

/* ── 13 · Smooth anchor scrolling via the inertial engine ── */
(() => {
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    Smooth.goTo(target.getBoundingClientRect().top + scrollY - 80);
  }));
  $('#toTop').addEventListener('click', () => Smooth.goTo(0));
})();

/* ── 14 · FAQ accordion with animated height ─────────────── */
(() => {
  $$('.faq__item').forEach(item => {
    const summary = $('summary', item), body = $('div', item);
    summary.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = item.hasAttribute('open');
      if (isOpen) {
        const h = body.offsetHeight;
        const anim = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'ease-in-out' });
        anim.onfinish = () => item.removeAttribute('open');
      } else {
        item.setAttribute('open', '');
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });
})();

/* ── 15 · Mobile menu ────────────────────────────────────── */
const burger = $('#burger'), mobileMenu = $('#mobileMenu');
function closeMenu() {
  burger.classList.remove('is-open');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
}
burger.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('is-open');
  burger.classList.toggle('is-open', open);
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
});
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ── 16 · Readiness flag ─────────────────────────────────── */
addEventListener('pageshow', () => document.body.classList.add('is-ready'));
