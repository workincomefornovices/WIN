/* ═══════════════════════════════════════════════════════════════
   WIN — PREMIUM PRELOADER  (preloader.js)
   
   PHASE 1 : Loading — counter 0→100% + progress bar fill (2.5 s)
   PHASE 2 : Reveal  — WIN logo scales up, liquid circle expands
             from clip-path: circle(0% at 50% 50%)
             to   clip-path: circle(150% at 50% 50%)
   PHASE 3 : Content Entry — navbar + hero text slide up from below
   
   Dependencies: GSAP core (must be loaded before this script)
   Trigger     : window 'load' event (all assets ready)
   ═══════════════════════════════════════════════════════════════ */

(function WIN_Preloader() {
    'use strict';

    /* ── GUARD : only run on the home page ─────────────────────── */
    const preloaderEl = document.getElementById('preloader');
    if (!preloaderEl) return;

    /* ── GUARD : GSAP must be available ────────────────────────── */
    if (typeof gsap === 'undefined') {
        console.warn('[WIN Preloader] GSAP not found — skipping preloader.');
        document.getElementById('main-content')?.classList.add('is-revealed');
        preloaderEl.remove();
        return;
    }

    /* ── REFERENCES ─────────────────────────────────────────────── */
    const mainContent = document.getElementById('main-content');
    const revealMask = document.getElementById('pl-reveal-mask');
    const progressFill = document.getElementById('pl-progress-fill');
    const counterEl = document.getElementById('pl-counter');
    const logoEl = document.getElementById('pl-logo');
    const navbar = document.getElementById('navbar');

    /* Hero elements to animate in Phase 3 */
    const heroEyebrow = document.querySelector('.hero-eyebrow');
    const heroLines = document.querySelectorAll('.hero-line, .reveal-line');
    const heroSub = document.querySelector('.hero-sub');
    const heroActions = document.querySelector('.hero-actions');

    /* ── INITIAL STATES ─────────────────────────────────────────── */
    // Prevent global.js reveal animations from running prematurely —
    // those fire on DOMContentLoaded; we override them here after load.
    document.body.classList.add('preloader-active');

    // Freeze all hero reveal elements until Phase 3
    const heroFreeze = [heroEyebrow, ...heroLines, heroSub, heroActions, navbar].filter(Boolean);
    gsap.set(heroFreeze, { opacity: 0, y: 40 });

    /* ── COUNTER OBJECT (GSAP tweens this property) ─────────────── */
    const counter = { value: 0 };

    /* ═══════════════════════════════════════════════════════════════
       MASTER GSAP TIMELINE
       ═══════════════════════════════════════════════════════════════ */
    function buildTimeline() {
        const tl = gsap.timeline({ paused: true });

        /* ─── PHASE 1 : LOADING (0 – 2.5 s) ──────────────────────── */
        tl.to(counter, {
            value: 100,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate() {
                const v = Math.round(counter.value);
                if (counterEl) counterEl.textContent = v;
                if (progressFill) progressFill.style.width = v + '%';
            },
        }, 0);

        /* ─── PHASE 2a : LOGO PULSE (at 100% reached) ──────────────── */
        tl.to(logoEl, {
            scale: 1.08,
            duration: 0.22,
            ease: 'power2.out',
        }, '+=0.05');

        tl.to(logoEl, {
            scale: 1,
            duration: 0.18,
            ease: 'power2.in',
        });

        /* Short hold so the eye catches "100%" */
        tl.addPause('+=0.12');

        /* ─── PHASE 2b : LOGO FADES OUT (preloader content exits) ─── */
        tl.to('.pl-inner', {
            opacity: 0,
            y: -24,
            duration: 0.45,
            ease: 'power3.in',
        });

        /* ─── PHASE 2c : LIQUID BUBBLE EXPANDS (THE REVEAL) ─────────
           We simultaneously:
             • collapse the preloader shell (clip shrinks to 0%)
             • reveal main-content so it's visible beneath
             • expand the white mask from 0% → 150% then instantly hide it
        ─────────────────────────────────────────────────────────────── */
        tl.add(() => {
            // Make main content visible immediately underneath
            if (mainContent) mainContent.classList.add('is-revealed');

            // Show and prime the reveal mask layer
            if (revealMask) {
                revealMask.style.display = 'block';
            }
        });

        /* Collapse the preloader INTO itself (iris close) */
        tl.to(preloaderEl, {
            clipPath: 'circle(0% at 50% 50%)',
            duration: 0.85,
            ease: 'power4.inOut',
            onComplete() {
                preloaderEl.style.display = 'none';
                document.body.classList.remove('preloader-active');
                // Dismiss the mask layer too
                if (revealMask) revealMask.style.display = 'none';
                // Re-enable the page-transition element for exit wipes on link clicks
                const pt = document.getElementById('page-transition');
                if (pt) pt.classList.add('pt-ready');
                // Refresh ScrollTrigger now that body is full-height
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            },
        }, '-=0.1');

        /* Expand the white mask from center → off-screen (liquid iris open) */
        if (revealMask) {
            tl.fromTo(revealMask,
                { clipPath: 'circle(0% at 50% 50%)' },
                {
                    clipPath: 'circle(150% at 50% 50%)',
                    duration: 0.9,
                    ease: 'power4.inOut',
                },
                '<'  // starts at same time as preloader collapse
            );
        }

        /* ─── PHASE 3 : CONTENT ENTRY ─────────────────────────────── */
        /* Navbar glides down from above */
        tl.fromTo(navbar || {},
            { y: -60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
            '-=0.4'
        );

        /* Hero eyebrow pops in */
        if (heroEyebrow) {
            tl.fromTo(heroEyebrow,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
                '-=0.55'
            );
        }

        /* Hero lines stagger up — same motion as original .reveal-line */
        if (heroLines.length) {
            tl.fromTo(heroLines,
                { y: 60, opacity: 0, rotationX: -8 },
                {
                    y: 0, opacity: 1, rotationX: 0,
                    duration: 1.0,
                    ease: 'power4.out',
                    stagger: 0.12,
                },
                '-=0.45'
            );
        }

        /* Subheading + actions fade in */
        const postLines = [heroSub, heroActions].filter(Boolean);
        if (postLines.length) {
            tl.fromTo(postLines,
                { y: 28, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.75,
                    ease: 'power3.out',
                    stagger: 0.1,
                },
                '-=0.5'
            );
        }

        return tl;
    }

    /* ═══════════════════════════════════════════════════════════════
       TRIGGER : window 'load' — all assets (images, fonts, WebGL) ready
       ═══════════════════════════════════════════════════════════════ */
    let timeline = null;

    function startPreloader() {
        timeline = buildTimeline();
        timeline.play();

        // The addPause at 100% needs a manual resume — we call it via a callback
        // bound to the onUpdate of the counter tween
        // But GSAP's addPause already halts; we set a one-shot timeout to resume
        // after the user has a brief moment to see "100%"
        timeline.eventCallback('onComplete', null); // clear any default

        // Listen for the pause point then auto-resume
        const pauseCheckInterval = setInterval(() => {
            if (timeline && timeline.paused() && counter.value >= 99) {
                clearInterval(pauseCheckInterval);
                gsap.delayedCall(0.18, () => timeline.resume());
            }
        }, 50);
    }

    // Minimum display time: show preloader for at least 0.6 s even on fast networks
    const MIN_DISPLAY_MS = 600;
    const loadStart = performance.now();

    if (document.readyState === 'complete') {
        // Already loaded (e.g., cached page)
        const elapsed = performance.now() - loadStart;
        const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
        setTimeout(startPreloader, wait);
    } else {
        window.addEventListener('load', () => {
            const elapsed = performance.now() - loadStart;
            const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(startPreloader, wait);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       FALLBACK SAFETY NET
       If something goes wrong, auto-remove preloader after 8 s
       so users aren't stuck on a blank screen.
       ═══════════════════════════════════════════════════════════════ */
    setTimeout(() => {
        if (preloaderEl && preloaderEl.style.display !== 'none') {
            console.warn('[WIN Preloader] Fallback triggered — removing preloader.');
            preloaderEl.style.display = 'none';
            if (mainContent) mainContent.classList.add('is-revealed');
            document.body.classList.remove('preloader-active');
            gsap.set(heroFreeze, { opacity: 1, y: 0 });
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }
    }, 8000);

})();
