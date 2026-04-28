/* =====================================================
   WIN AGENCY — TESTIMONIALS.JS
   Professional Authority Orbital Hero + Glass Gallery
   ===================================================== */
'use strict';

/* ══════════════════════════════════════════════════════
   1. HERO ENTRANCE — Staggered reveal (left content + LTS wrap)
   ══════════════════════════════════════════════════════ */
(function initHeroReveal() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline({
        defaults: { ease: 'power4.out', duration: 0.9 },
        delay: 0.15,
    });

    /* Status pill — slide up */
    tl.to('#ohStatusPill', { opacity: 1, y: 0, duration: 0.7 }, 0);

    /* Main headline */
    tl.to('#ohHeadline', { opacity: 1, y: 0, duration: 1.0 }, 0.18);

    /* Sub-copy */
    tl.to('#ohSub', { opacity: 1, y: 0 }, 0.38);

    /* LTS wrap — fade + rise in (replaces the old orbital stage reveal) */
    tl.to('#ohStageWrap', {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'back.out(1.3)',
        onComplete() {
            /* After entrance, allow the CSS float animation to run */
            const activeCard = document.querySelector('.lts-card.lts-active');
            if (activeCard) activeCard.classList.add('lts-floating');
        }
    }, 0.30);

})();


/* ══════════════════════════════════════════════════════
   2. BACKGROUND BLOB AMBIENT FLOAT
      The two soft blobs drift gently for a living feel.
   ══════════════════════════════════════════════════════ */
(function initBlobFloat() {
    if (typeof gsap === 'undefined') return;

    const blobs = [
        { sel: '.ohb-blob--a', x: 40, y: -28, dur: 12 },
        { sel: '.ohb-blob--b', x: -32, y: 22, dur: 15 },
    ];

    blobs.forEach(({ sel, x, y, dur }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        gsap.to(el, {
            x: `+=${x}`, y: `+=${y}`,
            duration: dur,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    });

})();


/* ══════════════════════════════════════════════════════
   3. CTA BUTTON — Magnetic hover micro-interaction
      Desktop only: buttons shift slightly toward cursor.
   ══════════════════════════════════════════════════════ */
(function initButtonMagnets() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.orbit-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            gsap.to(btn, {
                x: dx * 0.18, y: dy * 0.18,
                duration: 0.35, ease: 'power2.out', overwrite: 'auto'
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0, y: 0,
                duration: 0.55, ease: 'elastic.out(1, 0.4)', overwrite: 'auto'
            });
        });
    });

})();


/* ══════════════════════════════════════════════════════
   4. LIVING TESTIMONIAL STACK — Full Controller
      Auto-advance, dot nav, 3D hover tilt, swipe, a11y
   ══════════════════════════════════════════════════════ */
(function initLivingTestiStack() {

    const cards    = Array.from(document.querySelectorAll('.lts-card'));
    const dots     = Array.from(document.querySelectorAll('.lts-dot'));
    const stack    = document.getElementById('ltsStack');
    if (!cards.length || !stack) return;

    const TOTAL        = cards.length;
    const AUTO_DELAY   = 4200;  /* ms between automatic advances */
    const TILT_MAX     = 12;    /* degrees — 3D tilt intensity */
    const isMobile     = window.matchMedia('(max-width: 768px)').matches;
    const isReducedMot = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIdx = 0;
    let autoTimer  = null;

    /* ── Helper: depth-class mapper ── */
    const DEPTH_CLASSES = ['lts-active', 'lts-behind-1', 'lts-behind-2', 'lts-behind-3'];

    function assignDepthClasses(activeIdx) {
        cards.forEach((card, i) => {
            /* Remove all depth classes first */
            card.classList.remove('lts-active', 'lts-exiting',
                'lts-behind-1', 'lts-behind-2', 'lts-behind-3', 'lts-floating');

            /* Relative position to the active card (wrapping) */
            const relPos = (i - activeIdx + TOTAL) % TOTAL;
            const cls = DEPTH_CLASSES[relPos] || null;
            if (cls) card.classList.add(cls);
        });
    }

    /* ── Activate dot indicators ── */
    function updateDots(idx) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('lts-dot--active', i === idx);
            dot.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        });
    }

    /* ── Transition to a specific card index ── */
    function goTo(nextIdx, userTriggered) {
        if (nextIdx === currentIdx) return;
        if (userTriggered) stopAuto();

        /* Mark exiting card */
        cards[currentIdx].classList.remove('lts-floating');
        cards[currentIdx].classList.add('lts-exiting');

        /* On mobile use a shorter exit so card doesn't linger at edge */
        const isMob = window.__ltsMobileMode || isMobile;
        const exitDur = isReducedMot ? 200 : (isMob ? 400 : 600);

        /* Schedule removing exiting class after transition */
        const exiting = cards[currentIdx];
        setTimeout(() => {
            exiting.classList.remove('lts-exiting');
            exiting.classList.add('lts-behind-1'); /* settle behind new stack */
        }, exitDur);

        currentIdx = nextIdx;
        assignDepthClasses(currentIdx);
        updateDots(currentIdx);

        /* Float class restored after CSS transition settles */
        if (!isMob && !isReducedMot) {
            setTimeout(() => {
                const active = document.querySelector('.lts-card.lts-active');
                if (active) active.classList.add('lts-floating');
            }, 750);
        }

        if (userTriggered) startAuto();
    }

    /* ── Auto-advance ── */
    function startAuto() {
        stopAuto();
        if (isReducedMot) return;
        autoTimer = setInterval(() => {
            goTo((currentIdx + 1) % TOTAL, false);
        }, AUTO_DELAY);
    }

    function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    /* ── Dot click ── */
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goTo(i, true));
    });

    /* ── Keyboard: arrow nav when stack is focused ── */
    stack.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            goTo((currentIdx + 1) % TOTAL, true);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            goTo((currentIdx - 1 + TOTAL) % TOTAL, true);
        }
    });
    stack.setAttribute('tabindex', '0');
    stack.setAttribute('role', 'region');

    /* ── Desktop 3D tilt on active card ── */
    if (!isMobile && !isReducedMot) {
        const wrap = document.getElementById('ohStageWrap');
        if (wrap) {
            wrap.addEventListener('mousemove', e => {
                const activeCard = document.querySelector('.lts-card.lts-active');
                if (!activeCard) return;

                const r   = wrap.getBoundingClientRect();
                const cx  = r.left + r.width  / 2;
                const cy  = r.top  + r.height / 2;
                const dx  = (e.clientX - cx) / (r.width  / 2);  /* -1 … 1 */
                const dy  = (e.clientY - cy) / (r.height / 2);

                /* Remove float so tilt can own the transform */
                activeCard.classList.remove('lts-floating');

                if (typeof gsap !== 'undefined') {
                    gsap.to(activeCard, {
                        rotationY:  dx * TILT_MAX,
                        rotationX: -dy * TILT_MAX,
                        scale: 1,
                        duration: 0.55,
                        ease: 'power2.out',
                        overwrite: 'auto',
                        transformPerspective: 900,
                    });
                }
            });

            wrap.addEventListener('mouseleave', () => {
                const activeCard = document.querySelector('.lts-card.lts-active');
                if (!activeCard) return;
                if (typeof gsap !== 'undefined') {
                    gsap.to(activeCard, {
                        rotationY: 0, rotationX: 0,
                        duration: 0.75, ease: 'elastic.out(1, 0.5)', overwrite: 'auto',
                        onComplete() {
                            /* Re-apply float after tilt resets */
                            const ac = document.querySelector('.lts-card.lts-active');
                            if (ac) ac.classList.add('lts-floating');
                        }
                    });
                }
            });
        }
    }

    /* ── Touch swipe (mobile) ── */
    let touchStartX = 0;
    const SWIPE_THRESHOLD = 50;

    stack.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stack.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) >= SWIPE_THRESHOLD) {
            goTo(dx < 0
                ? (currentIdx + 1) % TOTAL
                : (currentIdx - 1 + TOTAL) % TOTAL,
                true
            );
        }
    }, { passive: true });

    /* ── Initialise ── */
    assignDepthClasses(0);
    updateDots(0);
    startAuto();

    /* Pause auto on page visibility change */
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAuto() : startAuto();
    });

    /* ── GSAP matchMedia: mobile transition tuning ── */
    if (typeof gsap !== 'undefined') {
        const mm = gsap.matchMedia();

        /* ── MOBILE (≤ 768px) ── */
        mm.add('(max-width: 768px)', () => {
            const wrap = document.querySelector('.lts-wrap');
            const stack = document.getElementById('ltsStack');

            /* 1. Clear any stray GSAP scale/y that may fight CSS layout */
            if (wrap) {
                gsap.set(wrap, { clearProps: 'scale,y,transform,x,xPercent,yPercent' });
            }

            /* 2. Reduce card exit travel — tighter on small screens.
               We patch the CSS custom property approach by temporarily
               overriding the exiting card's keyframe via a live GSAP tween
               that's faster and shorter than the desktop value. */
            const origGoTo = goTo;
            /* Shadow the outer goTo so mobile gets shorter travel */
            /* (Note: goTo is already defined and used above — we use
               a global flag instead to stay safe with closures) */
            window.__ltsMobileMode = true;

            /* Return cleanup fn for when matchMedia condition exits */
            return () => {
                window.__ltsMobileMode = false;
                if (wrap) gsap.set(wrap, { clearProps: 'all' });
            };
        });

        /* ── DESKTOP (> 768px) ── */
        mm.add('(min-width: 769px)', () => {
            window.__ltsMobileMode = false;
            const wrap = document.querySelector('.lts-wrap');
            if (wrap) gsap.set(wrap, { clearProps: 'all' });
        });
    }

})();





/* ══════════════════════════════════════════════════════
   5. GLASS TRANSACTION GALLERY — Bi-Directional GSAP
      Each card flies from below (y: 110vh, rotX: 45)
      through the sticky viewport to above (y: -110vh,
      rotX: -45), with scrub tied to data-speed so all
      8 cards pass at different depths & timings.
   ══════════════════════════════════════════════════════ */
(function initGlassGallery() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('testiGlassSection');
    if (!section) return;

    const cards = gsap.utils.toArray('.tgc');
    if (!cards.length) return;

    /* ── Mobile safety: CSS handles layout, just fade in ── */
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.08,
                    scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                }
            );
        });
        return;
    }

    /* ── Desktop: Temporally-staggered 3D pass-through ─────────────
       Each card gets its own entry WINDOW within the 350vh scroll.
       Cards are spread across 8 windows of 62.5vh each but overlapping,
       so at any scroll position you see 2-4 cards mid-flight.
       ─────────────────────────────────────────────────────────────── */

    /*
       We create ONE master GSAP timeline pinned to the section.
       Each card's tween is positioned at a staggered point within it.
       The timeline duration = 1 (unit), each card spans 0.35 of it,
       staggered by 0.10 per card — so cards 0-7 enter between
       progress 0.00 and 0.70, each visible for ~35% of the scroll.
    */
    const masterTL = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            invalidateOnRefresh: true,
        }
    });

    const CARD_SPAN = 0.38;   /* how much of the timeline each card occupies */
    const CARD_STAGGER = 0.09;  /* offset between card starts */

    cards.forEach((card, i) => {
        const tilt = parseFloat(card.dataset.tilt) || 0;
        const inner = card.querySelector('.tgc__inner');

        const cardStart = i * CARD_STAGGER;              /* when the card starts */
        const cardEnd = cardStart + CARD_SPAN;         /* when it finishes */
        const cardMid = cardStart + CARD_SPAN * 0.5;   /* peak visibility */

        /* Initial state: below viewport, angled toward user */
        gsap.set(card, { y: '110vh', rotationX: 40, rotationZ: tilt, opacity: 0 });

        /* Per-card scroll listener to handle opacity + blur independently */
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate(self) {
                const p = self.progress;

                /* Map global progress to this card's local 0-1 progress */
                const local = (p - cardStart) / CARD_SPAN;

                /* Only active while card is in its window */
                if (local < 0 || local > 1) {
                    card.style.opacity = '0';
                    return;
                }

                /* Opacity: fade in 0→0.18, full 0.18→0.82, fade out 0.82→1 */
                let alpha;
                if (local < 0.18) alpha = local / 0.18;
                else if (local > 0.82) alpha = (1 - local) / 0.18;
                else alpha = 1;
                card.style.opacity = alpha.toFixed(3);

                /* Blur: ramps from 6px to 20px at card midpoint */
                if (inner) {
                    const distFromMid = Math.abs(local - 0.5);
                    const blur = 6 + (1 - distFromMid * 2) * 14;
                    const bv = `blur(${blur.toFixed(1)}px) saturate(1.6)`;
                    inner.style.webkitBackdropFilter = bv;
                    inner.style.backdropFilter = bv;
                }
            }
        });

        /*
           Add card's tween to the master timeline at its staggered position.
           Cards travel from y:110vh rotX+40 → y:-110vh rotX-40 linearly.
        */
        masterTL.fromTo(card,
            { y: '110vh', rotationX: 40, rotationZ: tilt },
            { y: '-110vh', rotationX: -40, rotationZ: -tilt, ease: 'none', duration: CARD_SPAN },
            cardStart   /* position within master timeline */
        );
    });

})();




/* ══════════════════════════════════════════════════════
   6. EXISTING ANIMATIONS — preserved
   ══════════════════════════════════════════════════════ */
(function initTestimonials() {
    if (typeof gsap === 'undefined') return;

    /* Stagger tcard entrance */
    gsap.utils.toArray('.tcard').forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50, scale: 0.97 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                delay: (i % 4) * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    once: true
                }
            }
        );
    });

    /* Rating bar stats count-up */
    document.querySelectorAll('.rating-stat span, .score-num').forEach(el => {
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;
        const suffix = raw.replace(String(num), '');

        gsap.fromTo({ v: 0 }, { v: num }, {
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
                const val = this.targets()[0].v;
                el.textContent = (num % 1 !== 0 ? val.toFixed(1) : Math.round(val)) + suffix;
            },
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                once: true
            }
        });
    });

})();


/* ══════════════════════════════════════════════════════
   7. MOBILE SCROLL-REVEAL — Section 3: Glass Gallery
   ──────────────────────────────────────────────────────
   Uses IntersectionObserver (NOT GSAP/ScrollTrigger) to
   detect when .testi-glass-section enters the viewport
   on mobile, then adds .mobile-animate-start which
   triggers the CSS translateY(30px) → translateY(0)
   + opacity: 0 → 1 transition defined in testimonials.css.

   Swipe hint (.tgc-swipe-hint) is also revealed via CSS
   child selector once the class is on the parent section.

   CONSTRAINT: Strictly gated to mobile (≤ 768px) via
   matchMedia — the desktop GSAP 3D pass-through is NEVER
   touched. PC animation remains 100% intact.
   ══════════════════════════════════════════════════════ */
(function initMobileSwipeReveal() {

    /* ── Mobile guard: skip entirely on desktop ── */
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    /* ── Target: actual 3rd section (Glass Gallery) ── */
    /* User spec class .testimonial-section-03 maps to .testi-glass-section */
    const sectionThree = document.querySelector('.testi-glass-section');
    if (!sectionThree) return;

    /* ── IntersectionObserver — triggers when 20% of section is visible ── */
    const testimonialObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    /* Trigger the CSS reveal + swipe hint fade-in */
                    entry.target.classList.add('mobile-animate-start');
                    /* One-shot: stop watching after first trigger */
                    testimonialObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2,    /* fire when 20% of section enters viewport */
            rootMargin: '0px', /* no pre-firing */
        }
    );

    testimonialObserver.observe(sectionThree);

})();
