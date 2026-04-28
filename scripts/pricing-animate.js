/* =====================================================
   WIN AGENCY — PRICING-ANIMATE.JS
   Services page 5th section: Transparent Pricing

   Features implemented (Vanilla JS + GSAP):
   ─────────────────────────────────────────────
   1. Vertical-Cut Word Reveal  → heading words clip-path
                                  slide up, 0.15s stagger
   2. Eyebrow + cards stagger   → blur-to-focus + Y-axis
   3. Spring-loaded toggle      → CSS custom property
                                  driven spring physics
   4. NumberFlow odometer       → GSAP proxy count-up
                                  with comma formatting
   5. Feature list cascade      → 0.1s stagger per item
   6. Cards: blur reveal        → filter: blur() → 0
   ===================================================== */

'use strict';

(function initPricingSection() {

    /* ── Guard ── */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('pricingSection');
    if (!section) return;

    /* ───────────────────────────────────────────────────
       DATA: price values for monthly vs project-base
    ─────────────────────────────────────────────────── */
    const PLANS = {
        starter:    { monthly: 8000,  project: 15000 },
        growth:     { monthly: 25000, project: 45000 },
        enterprise: null     /* always "Custom"          */
    };

    /* ───────────────────────────────────────────────────
       UTILITY: format a number with commas (Indian style)
    ─────────────────────────────────────────────────── */
    function formatINR(n) {
        return n.toLocaleString('en-IN');
    }

    /* ───────────────────────────────────────────────────
       1. VERTICAL-CUT WORD REVEAL
       Each .vcr-word-wrap clips overflow; the inner
       .vcr-word translates from 110% → 0%.
    ─────────────────────────────────────────────────── */
    const words = section.querySelectorAll('.vcr-word');
    if (words.length) {
        gsap.set(words, { yPercent: 110, opacity: 0 });

        ScrollTrigger.create({
            trigger: '#pricingHeadline',
            start: 'top 85%',
            once: true,
            onEnter() {
                gsap.to(words, {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.75,
                    stagger: 0.15,           /* 0.15s per word — spec requirement */
                    ease: 'power4.out',       /* spring-like snap */
                });
            }
        });
    }

    /* ───────────────────────────────────────────────────
       2. EYEBROW REVEAL
    ─────────────────────────────────────────────────── */
    const eyebrow = document.getElementById('pricingEyebrow');
    if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 18 });
        ScrollTrigger.create({
            trigger: eyebrow,
            start: 'top 88%',
            once: true,
            onEnter() {
                gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            }
        });
    }

    /* ───────────────────────────────────────────────────
       3. TOGGLE REVEAL
    ─────────────────────────────────────────────────── */
    const toggleWrap = document.getElementById('pricingToggleWrap');
    if (toggleWrap) {
        gsap.set(toggleWrap, { opacity: 0, y: 14 });
        ScrollTrigger.create({
            trigger: toggleWrap,
            start: 'top 88%',
            once: true,
            onEnter() {
                gsap.to(toggleWrap, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.35 });
            }
        });
    }

    /* ───────────────────────────────────────────────────
       4. CARD BLUR-TO-FOCUS + Y-AXIS STAGGER REVEAL
    ─────────────────────────────────────────────────── */
    const cards = section.querySelectorAll('.pricing-card');
    if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 50, filter: 'blur(12px)' });

        ScrollTrigger.create({
            trigger: '#pricingGrid',
            start: 'top 80%',
            once: true,
            onEnter() {
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.75,
                    stagger: 0.13,
                    ease: 'power3.out',
                    clearProps: 'filter'
                });

                /* Feature list items stagger with 0.1s delay each */
                section.querySelectorAll('.pf-item').forEach((item, i) => {
                    gsap.fromTo(item,
                        { opacity: 0, x: -16 },
                        {
                            opacity: 1, x: 0,
                            duration: 0.45,
                            ease: 'power2.out',
                            delay: 0.35 + i * 0.1,   /* 0.1s cascade — spec requirement */
                            scrollTrigger: {
                                trigger: item,
                                start: 'top 92%',
                                once: true
                            }
                        }
                    );
                });
            }
        });
    }

    /* ───────────────────────────────────────────────────
       5. SPRING-LOADED BILLING TOGGLE
       Physics: custom spring parameters mapped to CSS
       transition cubic-bezier.
       stiffness=500, damping=30 → overdamped, snappy.
       Equivalent bezier: cubic-bezier(0.55, 0, 0.1, 1)
       combined with a short 0.28s duration.
    ─────────────────────────────────────────────────── */
    const pill       = document.getElementById('togglePill');
    const btnMonthly = document.getElementById('toggleMonthly');
    const btnProject = document.getElementById('toggleProject');

    let currentMode = 'project';   /* tracks active plan */

    function positionPill(activeBtn) {
        if (!pill || !activeBtn) return;
        const wrapper = document.getElementById('pricingToggle');
        if (!wrapper) return;

        const wRect = wrapper.getBoundingClientRect();
        const bRect = activeBtn.getBoundingClientRect();

        /* Translate pill to match the active button's position */
        pill.style.width  = bRect.width  + 'px';
        pill.style.height = bRect.height + 'px';
        pill.style.left   = (bRect.left - wRect.left) + 'px';
    }

    /* Initial pill position — run after layout */
    requestAnimationFrame(() => positionPill(btnProject));

    /* ───────────────────────────────────────────────────
       6. NUMBERFLOW ODOMETER — price count tween
       Animates current displayed value → new target value.
    ─────────────────────────────────────────────────── */
    function animatePrice(el, fromVal, toVal) {
        if (!el || typeof fromVal !== 'number' || typeof toVal !== 'number') return;
        const proxy = { v: fromVal };
        gsap.to(proxy, {
            v: toVal,
            duration: 0.55,
            ease: 'expo.out',             /* spec: 500 stiffness = very fast */
            onUpdate() {
                el.textContent = formatINR(Math.round(proxy.v));
            },
            onComplete() {
                el.textContent = formatINR(toVal);
            }
        });
    }

    function switchPlan(mode) {
        if (mode === currentMode) return;
        currentMode = mode;

        const isProject = (mode === 'project');

        /* Move price pill with spring animation */
        positionPill(isProject ? btnProject : btnMonthly);

        /* Update aria-pressed */
        btnMonthly.setAttribute('aria-pressed', String(!isProject));
        btnProject.setAttribute('aria-pressed', String(isProject));
        btnMonthly.classList.toggle('toggle-btn--active', !isProject);
        btnProject.classList.toggle('toggle-btn--active',  isProject);

        /* Cadence label */
        const cadenceStarter = document.getElementById('cadenceStarter');
        const cadenceGrowth  = document.getElementById('cadenceGrowth');
        const newCadence = isProject ? '/project' : '/mo';
        if (cadenceStarter) cadenceStarter.textContent = newCadence;
        if (cadenceGrowth)  cadenceGrowth.textContent  = newCadence;

        /* Animate prices with NumberFlow-style odometer */
        const starterEl = document.getElementById('priceStarter');
        const growthEl  = document.getElementById('priceGrowth');

        if (starterEl) {
            const from = PLANS.starter[isProject ? 'monthly' : 'project'];
            const to   = PLANS.starter[mode];
            animatePrice(starterEl, from, to);
        }

        if (growthEl) {
            const from = PLANS.growth[isProject ? 'monthly' : 'project'];
            const to   = PLANS.growth[mode];
            animatePrice(growthEl, from, to);
        }

        /* Spring-bounce the pricing cards on switch for tactile feel */
        gsap.to(cards, {
            scale: 0.975,
            duration: 0.08,
            ease: 'power2.in',
            onComplete() {
                gsap.to(cards, {
                    scale: 1,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.45)',
                    stagger: 0.04
                });
            }
        });
    }

    /* Attach toggle events */
    if (btnMonthly) btnMonthly.addEventListener('click', () => switchPlan('monthly'));
    if (btnProject) btnProject.addEventListener('click', () => switchPlan('project'));

    /* Reposition pill on resize */
    window.addEventListener('resize', () => {
        positionPill(currentMode === 'project' ? btnProject : btnMonthly);
    }, { passive: true });

})();
