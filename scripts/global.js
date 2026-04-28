/* =====================================================
   WIN AGENCY — GLOBAL.JS
   Cursor, Navbar, Page Transition, Reveal Animations
   ===================================================== */
'use strict';

// ── CURSOR ──────────────────────────────────────────
(function initCursor() {
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  if (!ring || !dot) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  document.querySelectorAll('a, button, [data-cursor-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0'; dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1'; dot.style.opacity = '1';
  });
})();

// ── NAVBAR (scroll + hamburger toggle) ────────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll state — adds .scrolled class for denser glass
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile hamburger toggle
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('no-scroll', open);
    });

    // Close drawer when a nav link is clicked
    links.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  }
})();

// ── PAGE TRANSITION ──────────────────────────────────
(function initPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay || typeof gsap === 'undefined') return;

  const panels = overlay.querySelectorAll('.pt-panel');

  // Entry animation (page reveal)
  gsap.fromTo(panels,
    { scaleX: 1 },
    {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 0.65,
      ease: 'power3.inOut',
      stagger: 0.08,
      delay: 0.1,
    }
  );

  // Intercept <a> clicks for exit animation
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
      href.startsWith('tel') || href.startsWith('http')) return;

    a.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.href;
      overlay.style.pointerEvents = 'all';

      gsap.fromTo(panels,
        { scaleX: 0, transformOrigin: 'right' },
        {
          scaleX: 1,
          duration: 0.6,
          ease: 'power3.inOut',
          stagger: 0.07,
          onComplete: () => { window.location.href = target; }
        }
      );
    });
  });
})();

// ── REVEAL ANIMATIONS ────────────────────────────────
(function initReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero lines ────────────────────────────────────────
     GUARD: if loader.js is running (body has .loader-active),
     skip these tweens entirely — loader.js owns the hero reveal
     and will animate these elements itself in Phase 3.
     Running both simultaneously causes an opacity race condition
     that produces a visible flicker and breaks the smooth reveal.
  ──────────────────────────────────────────────────────── */
  if (!document.body.classList.contains('loader-active')) {
    const heroLines = document.querySelectorAll('.hero-line, .reveal-line');
    heroLines.forEach(el => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { opacity: 0, y: 60, rotationX: -8 },
        {
          opacity: 1, y: 0, rotationX: 0,
          duration: 1.1,
          ease: 'power4.out',
          delay
        }
      );
    });

    const revealTexts = document.querySelectorAll('.reveal-text');
    revealTexts.forEach(el => {
      const delay = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay
        }
      );
    });
  }
  /* On pages WITH the loader, reveal-line / reveal-text tweens
     are handled by loader.js Phase 3 after the iris closes.    */

  // ScrollTrigger for sections (safe on all pages)
  gsap.utils.toArray('.glass-card, .stat-item, .process-step, .timeline-item, .tcard, .pricing-card, .service-detail-block').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 4) * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });

  // Elastic paper effect on images
  gsap.utils.toArray('[data-elastic]').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0% 0 0 0)',
        opacity: 1,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true
        }
      }
    );
  });
})();

// ── COUNTER ANIMATION ────────────────────────────────
(function initCounters() {
  if (typeof ScrollTrigger === 'undefined') return;

  document.querySelectorAll('[data-count]').forEach((wrapper) => {
    const target = parseInt(wrapper.dataset.count);
    const id = wrapper.id;
    const el = wrapper.querySelector('.stat-num');
    if (!el) return;

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        let start = 0;
        const dur = 1800;
        const startTime = performance.now();
        (function tick(now) {
          const pct = Math.min((now - startTime) / dur, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          el.textContent = Math.round(ease * target);
          if (pct < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
    });
  });
})();

// ── PARALLAX HERO SCROLL ─────────────────────────────
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || typeof gsap === 'undefined') return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    const lines = hero.querySelectorAll('.hero-line');
    lines.forEach((l, i) => {
      l.style.transform = `translateY(${y * (0.05 + i * 0.02) * -1}px)`;
    });
  }, { passive: true });
})();

// ── MOBILE SMOOTH SCROLL REVEAL ──────────────────────
// Only activates on viewports ≤ 1024px (phones & tablets).
// Uses CSS class toggling so it never conflicts with GSAP on PC.
// Hero-type sections are excluded — they should be visible immediately.
(function initMobileScrollReveal() {
  // Guard: do nothing on PC/desktop
  const mq = window.matchMedia('(max-width: 1024px)');
  if (!mq.matches) return;

  // Sections to exclude from the reveal effect (always-visible)
  const EXCLUDE = new Set([
    'brain-hero', 'about-spatial-hero', 'contact-hero',
    'testi-orbit-hero', 'hero'
  ]);

  const allSections = document.querySelectorAll('section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('section-reveal-pending');
        entry.target.classList.add('section-revealed');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  allSections.forEach(section => {
    // Skip hero-type and already-visible sections
    const shouldExclude = [...EXCLUDE].some(cls => section.classList.contains(cls));
    if (shouldExclude) return;

    // Pre-set the pending state (CSS handles the visual)
    section.classList.add('section-reveal-pending');
    observer.observe(section);
  });

  // Re-check on orientation change (portrait ↔ landscape)
  window.addEventListener('orientationchange', () => {
    if (!window.matchMedia('(max-width: 1024px)').matches) {
      // If user is now on a wider viewport, remove all pending states
      allSections.forEach(s => {
        s.classList.remove('section-reveal-pending');
        s.classList.add('section-revealed');
      });
      observer.disconnect();
    }
  }, { passive: true });
})();
