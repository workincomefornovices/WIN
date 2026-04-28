/* =====================================================
   WIN AGENCY — STAT-BAR-ANIMATE.JS
   Masterpiece scroll-triggered animation for the
   Testimonials page rating-bar section.

   Animations implemented (Vanilla JS / GSAP):
   ─────────────────────────────────────────────
   1. Container entrance  → scale(0.97) + y(40) + opacity fade
                            easing: back.out(1.6)  duration: 0.8s
   2. Divider grow        → scaleY 0→1 (transform-origin: center)
                            staggered with the stat blocks
   3. Stat block stagger  → x(-24) + opacity, 0.1s between each block
   4. Odometer count-up   → GSAP proxy tween 0→target, 2.5s, expo ease
   5. 3D tilt hover       → rotateX/Y tracks mouse position (desktop only)
   ===================================================== */

'use strict';

(function initStatBarAnimation() {

    /* ── Guard: need GSAP + ScrollTrigger ── */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[StatBar] GSAP or ScrollTrigger not found.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ── Target elements ── */
    const bar     = document.querySelector('.rating-inner');   /* glassmorphic card  */
    const section = document.querySelector('.rating-bar');     /* outer section      */
    if (!bar || !section) return;

    /* Stat blocks: rating-score + rating-stat elements */
    const statBlocks = bar.querySelectorAll('.rating-score, .rating-stat');
    /* Dividers between them */
    const dividers   = bar.querySelectorAll('.rating-divider');
    /* Number elements that we will count up */
    const scoreNum   = bar.querySelector('.score-num');
    const statNums   = bar.querySelectorAll('.rating-stat span');

    /* ══════════════════════════════════════════════════════
       1. PREP — set initial hidden states
       ══════════════════════════════════════════════════════ */

    /* Bar starts scaled down, transparent */
    gsap.set(bar, {
        opacity: 0,
        y: 40,
        scale: 0.97,
        transformOrigin: 'center center',
    });

    /* Stat blocks start off to the left */
    gsap.set(statBlocks, { opacity: 0, x: -24 });

    /* Dividers start collapsed vertically */
    gsap.set(dividers, {
        scaleY: 0,
        transformOrigin: '50% 50%',   /* grow from centre, matching Framer spec */
    });

    /* Number counters: store their final values, start at 0 */
    const counterData = [];

    function parseCounter(el) {
        if (!el) return null;
        const raw     = el.textContent.trim();
        const numeric = parseFloat(raw.replace(/[^\d.]/g, ''));
        const suffix  = raw.replace(/[\d.]/g, '');
        const isFloat = raw.includes('.');
        return { el, numeric, suffix, isFloat };
    }

    /* Collect all counters */
    if (scoreNum) {
        const d = parseCounter(scoreNum);
        if (d) { d.el.textContent = '0.0'; counterData.push(d); }
    }
    statNums.forEach(el => {
        const d = parseCounter(el);
        if (d) { d.el.textContent = '0' + d.suffix; counterData.push(d); }
    });

    /* ══════════════════════════════════════════════════════
       2. SCROLL-TRIGGERED MASTER TIMELINE
       ══════════════════════════════════════════════════════ */
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top 82%',   /* fire when bar is 82% down the viewport */
            once: true,         /* one-shot — re-entering doesn't replay   */
        },
        defaults: { ease: 'power3.out' }
    });

    /* ── STEP 1: Bar entrance — 0.8s with a "snap" backOut ── */
    tl.to(bar, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.6)',
        clearProps: 'transform',   /* let hover tilt take over after entrance */
    }, 0);

    /* ── STEP 2: Stat blocks stagger in ── */
    tl.to(statBlocks, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,             /* 0.1s between each block = spec requirement */
        ease: 'power3.out',
    }, 0.2);

    /* ── STEP 3: Dividers grow from centre ── */
    tl.to(dividers, {
        scaleY: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
    }, 0.5);

    /* ── STEP 4: Odometer count-up ── */
    /* Each counter runs in parallel but triggered at the start of the TL
       (they have their own independent clock via GSAP tweens). We use a
       proxy object (the "ticker") pattern to hit onUpdate every frame. */
    tl.add(() => {
        counterData.forEach((data, i) => {
            const proxy = { v: 0 };
            gsap.to(proxy, {
                v: data.numeric,
                duration: 2.5,
                delay: 0.2 + i * 0.1,          /* stagger start per stat */
                ease: 'expo.out',               /* closest to [0.16,1,0.3,1] cubic */
                onUpdate() {
                    data.el.textContent = data.isFloat
                        ? proxy.v.toFixed(1) + data.suffix
                        : Math.floor(proxy.v) + data.suffix;
                },
                onComplete() {
                    /* Snap to exact final value in case of float rounding */
                    data.el.textContent = data.isFloat
                        ? data.numeric.toFixed(1) + data.suffix
                        : data.numeric + data.suffix;
                }
            });
        });
    }, 0.3);   /* start count-up 0.3s after bar begins entering */


    /* ══════════════════════════════════════════════════════
       3. 3D TILT HOVER — desktop only
          Tracks mouse position relative to the bar's bounding
          box and applies a subtle rotateX/Y to simulate the
          "glassmorphism" premium feel from the spec.
       ══════════════════════════════════════════════════════ */

    const TILT_MAX = 6;   /* degrees — keep subtle, premium */
    let tiltActive = false;

    if (!window.matchMedia('(hover: none)').matches) {

        bar.addEventListener('mouseenter', () => {
            tiltActive = true;
            gsap.to(bar, {
                boxShadow: '0 24px 64px rgba(99,102,241,0.14), 0 8px 32px rgba(56,189,248,0.10)',
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });

        bar.addEventListener('mousemove', e => {
            if (!tiltActive) return;
            const rect = bar.getBoundingClientRect();

            /* Normalised -1 to +1 positions within the bar */
            const nx = (e.clientX - rect.left)  / rect.width  - 0.5;   /* -0.5 to 0.5 */
            const ny = (e.clientY - rect.top)   / rect.height - 0.5;

            /* rotateX is inverted: moving mouse up (negative ny) → positive tilt */
            const rotX =  -ny * TILT_MAX * 2;
            const rotY =   nx * TILT_MAX * 2;

            gsap.to(bar, {
                rotateX: rotX,
                rotateY: rotY,
                transformPerspective: 900,
                transformOrigin: 'center center',
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });

        bar.addEventListener('mouseleave', () => {
            tiltActive = false;
            gsap.to(bar, {
                rotateX: 0,
                rotateY: 0,
                boxShadow: '',   /* restore CSS default */
                duration: 0.65,
                ease: 'elastic.out(1, 0.5)',
                overwrite: 'auto'
            });
        });
    }

})();
