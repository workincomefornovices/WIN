/* ═══════════════════════════════════════════════════════════════
   WIN AGENCY — LOADER.JS
   Liquid iris-collapse preloader (0 → 100% counter + clip-path)
   
   PHASE 1 : Counter animates 0% → 100%, progress bar fills (2 s)
   PHASE 2 : Loader iris collapses  circle(100%) → circle(0%)
             revealing #main-content beneath (1.4 s, expo.inOut)
   PHASE 3 : Hero text / navbar slide up into view (0.9 s)
   
   Trigger  : window 'load' — all assets (fonts, WebGL, images) ready
   Safety   : 8 s fallback removes loader in case of failure
   ═══════════════════════════════════════════════════════════════ */

(function WIN_Loader() {
    'use strict';

    /* ── Guard: only run when #loader exists (home page only) ── */
    const loader = document.getElementById('loader');
    if (!loader) return;

    /* ── Guard: GSAP must be present ── */
    if (typeof gsap === 'undefined') {
        console.warn('[WIN Loader] GSAP not found — skipping preloader.');
        const mc = document.getElementById('main-content');
        if (mc) mc.style.visibility = 'visible';
        loader.remove();
        return;
    }

    /* ── Element references ── */
    const barEl = document.getElementById('bar');
    const percentEl = document.getElementById('percent');
    const mainContent = document.getElementById('main-content');
    const navbar = document.getElementById('navbar');
    const heroLines = document.querySelectorAll('.hero-line, .reveal-line');
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    const heroSub = document.querySelector('.hero-sub');
    const heroActions = document.querySelector('.hero-actions');

    /* ── Freeze hero content until Phase 3 ── */
    /* (global.js fires reveal-line tweens immediately on DOMContentLoaded;
       we override them here so they only play after the loader exits)     */
    document.body.classList.add('loader-active');
    const toFreeze = [navbar, heroEyebrow, ...heroLines, heroSub, heroActions].filter(Boolean);
    gsap.set(toFreeze, { opacity: 0, y: 40 });

    /* ── Counter object (GSAP tweens this numeric property) ── */
    const counter = { value: 0 };

    /* ════════════════════════════════════════════════════════════
       BUILD THE GSAP TIMELINE
    ════════════════════════════════════════════════════════════ */
    function buildTimeline() {
        const tl = gsap.timeline({ paused: true });

        /* PHASE 1 — Loading counter (0 → 100) over 2 s */
        tl.to(counter, {
            value: 100,
            duration: 2,
            ease: 'power2.inOut',
            onUpdate() {
                const v = Math.round(counter.value);
                if (percentEl) percentEl.textContent = v + '%';
                if (barEl) barEl.style.width = v + '%';
            },
        }, 0);

        /* Brief hold at 100% so the eye registers it */
        tl.to({}, { duration: 0.25 });

        /* PHASE 2 — Iris collapse: circle(100%) → circle(0%)
           The loader shrinks away from the edges toward the center,
           exposing the fully-rendered homepage underneath.          */
        tl.call(() => {
            /* Make the main content visible BEFORE the iris starts closing
               so the page is already rendered when the mask lifts.         */
            if (mainContent) mainContent.style.visibility = 'visible';
        });

        tl.to(loader, {
            clipPath: 'circle(0% at 50% 50%)',
            duration: 1.4,
            ease: 'expo.inOut',
            onComplete() {
                loader.style.display = 'none';
                document.body.classList.remove('loader-active');

                /* Re-enable page-transition exit wipes for link navigation */
                const pt = document.getElementById('page-transition');
                if (pt) pt.classList.add('pt-ready');

                /* Refresh ScrollTrigger now that layout is stable */
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            },
        });

        /* PHASE 3 — Content entry (overlaps last 0.5 s of the iris close) */

        /* Navbar slides down */
        tl.fromTo(navbar || {},
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
            '-=0.5'
        );

        /* Hero eyebrow */
        if (heroEyebrow) {
            tl.fromTo(heroEyebrow,
                { y: 28, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
                '-=0.5'
            );
        }

        /* Hero lines stagger */
        if (heroLines.length) {
            tl.fromTo(heroLines,
                { y: 55, opacity: 0, rotationX: -8 },
                {
                    y: 0, opacity: 1, rotationX: 0, duration: 0.95,
                    ease: 'power4.out', stagger: 0.11
                },
                '-=0.4'
            );
        }

        /* Subheading + CTA */
        const postLines = [heroSub, heroActions].filter(Boolean);
        if (postLines.length) {
            tl.fromTo(postLines,
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
                '-=0.45'
            );
        }

        return tl;
    }

    /* ════════════════════════════════════════════════════════════
       TRIGGER — window 'load' (all CDN scripts + assets ready)
    ════════════════════════════════════════════════════════════ */
    const MIN_SHOW_MS = 500; // always show loader for at least 0.5 s
    const loadStart = performance.now();

    function start() {
        const elapsed = performance.now() - loadStart;
        const delay = Math.max(0, MIN_SHOW_MS - elapsed);
        setTimeout(() => buildTimeline().play(), delay);
    }

    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start, { once: true });
    }

    /* ════════════════════════════════════════════════════════════
       SAFETY NET — force-remove after 8 s on slow connections
    ════════════════════════════════════════════════════════════ */
    setTimeout(() => {
        if (loader && loader.style.display !== 'none') {
            console.warn('[WIN Loader] Fallback triggered.');
            loader.style.display = 'none';
            if (mainContent) mainContent.style.visibility = 'visible';
            document.body.classList.remove('loader-active');
            gsap.set(toFreeze, { opacity: 1, y: 0 });
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
    }, 8000);

})();
