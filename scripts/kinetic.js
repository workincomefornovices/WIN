/* =====================================================
   WIN AGENCY — KINETIC.JS  (v2 — glitch-fixed)
   Five Pillars: Viewport-triggered entrance animation

   Changes from v1:
   • Header (#kineticHeader): IMMEDIATELY visible — no scroll anim
   • Cards: y:30, duration:0.8, stagger:0.2, once:true (no reverse)
   • Removed toggleActions 'play reverse' which caused scroll glitch
   • Idle float only starts AFTER card reveal is complete (onComplete)
   • Mouse parallax guard: only runs when section is in view
   ===================================================== */
'use strict';

(function initKineticPillars() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('kineticPillars');
    const header = document.getElementById('kineticHeader');
    const container = document.getElementById('cardsContainer');
    const cards = gsap.utils.toArray('.kinetic-card');
    const bgGrid = document.querySelector('.kp-bg-grid');

    if (!section || !cards.length) return;

    /* ─────────────────────────────────────────────────────────────
       1. HEADER — FIXED / IMMEDIATELY VISIBLE
       No entrance animation. The heading is always readable
       as soon as the user scrolls to the section.
    ───────────────────────────────────────────────────────────── */
    if (header) {
        gsap.set(header, { opacity: 1, y: 0, clearProps: 'transform' });
    }

    /* ─────────────────────────────────────────────────────────────
       2. INITIAL CARD STATE
       Cards start invisible + offset below their final position.
    ───────────────────────────────────────────────────────────── */
    gsap.set(cards, { opacity: 0, y: 30 });

    /* ─────────────────────────────────────────────────────────────
       3. CARD STAGGER REVEAL — spec-aligned
       • duration : 0.8 s  (high-end, responsive)
       • stagger  : 0.2 s  (deliberate, premium cascade)
       • y        : 30 px  (subtle — not heavy)
       • once     : true   — plays ONCE on enter → prevents
                             the reverse-on-scroll-up glitch
       • onComplete → triggers idle float AFTER cards settle
    ───────────────────────────────────────────────────────────── */
    let idleTweens = null;

    gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.kinetic-cards-container',
                start: 'top 80%',
                once: true,          // ← key fix: no reverse glitch
            },
            onComplete() {
                /* Start idle float only after all cards have settled */
                startIdleFloat();
            },
        }
    );

    /* ─────────────────────────────────────────────────────────────
       4. BACKGROUND GRID — fades in when cards are in view
    ───────────────────────────────────────────────────────────── */
    if (bgGrid) {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom top',
            onEnter() { bgGrid.classList.add('kp-bg-grid--active'); },
            onLeaveBack() { bgGrid.classList.remove('kp-bg-grid--active'); },
        });
    }

    /* ─────────────────────────────────────────────────────────────
       5. IDLE FLOAT — desktop only, starts after card reveal
       Gentle sinusoidal breathing. Killed cleanly when section
       leaves the viewport to avoid memory / jank.
    ───────────────────────────────────────────────────────────── */
    function startIdleFloat() {
        /* Guard: only on computers with enough screen real estate */
        if (window.innerWidth <= 1024) return;
        if (idleTweens) return;

        idleTweens = gsap.to(cards, {
            y: '+=7',
            rotationX: '+=0.6',
            rotationY: '+=0.8',
            duration: 4.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.3, from: 'start' },
        });
    }

    function killIdleFloat() {
        if (idleTweens) {
            idleTweens.kill();
            idleTweens = null;
            gsap.set(cards, { y: 0, rotationX: 0, rotationY: 0 });
        }
        if (bgGrid) bgGrid.classList.remove('kp-bg-grid--active');
    }

    /* Stop float when section scrolls out of view */
    ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onLeaveBack() { killIdleFloat(); },
        onLeave() { killIdleFloat(); },
    });

    /* ─────────────────────────────────────────────────────────────
       6. MOUSE PARALLAX MICRO-ORBIT — desktop only
       Applies subtle rotationX/Y to the card container as the
       mouse moves within the section. Skipped entirely on mobile.
    ───────────────────────────────────────────────────────────── */
    if (window.innerWidth > 1024 && container) {
        let targetRY = 0, currentRY = 0;
        let targetRX = 0, currentRX = 0;
        let sectionInView = false;

        /* Track section visibility so parallax doesn't fire when
           the section is off-screen (avoids fighting the idle float) */
        ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => { sectionInView = self.isActive; },
        });

        section.addEventListener('mousemove', (e) => {
            if (!sectionInView) return;
            const rect = section.getBoundingClientRect();
            const normX = (e.clientX - rect.left) / rect.width - 0.5;
            const normY = (e.clientY - rect.top) / rect.height - 0.5;
            targetRY = normX * 4;
            targetRX = -normY * 2.5;
        });

        section.addEventListener('mouseleave', () => {
            targetRX = 0;
            targetRY = 0;
        });

        (function microOrbit() {
            requestAnimationFrame(microOrbit);
            currentRX += (targetRX - currentRX) * 0.07;
            currentRY += (targetRY - currentRY) * 0.07;

            if (sectionInView) {
                gsap.set(container, {
                    rotationX: currentRX,
                    rotationY: currentRY,
                    transformOrigin: '50% 50%',
                });
            }
        })();
    }

})();
