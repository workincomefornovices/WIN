/* =====================================================
   WIN AGENCY — ABOUT.JS
   Spatial Hero Canvas + page animations
   ===================================================== */
'use strict';

// ── SPATIAL HERO CANVAS — CHROMATIC GLASS ORB ────────
(function initSpatialHero() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* ── Resize ── */
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ── Particle field (blue-tinted for palette harmony) ── */
    const PARTICLE_COUNT = 72;
    const particles = [];
    function mkParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            a: Math.random() * 0.40 + 0.08,
        };
    }
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(mkParticle());

    /* ── Sphere state ── */
    let sphereY = 0;   // GSAP drives vertical float
    const START = performance.now();
    const SPHERE_CX_RATIO = 0.68;
    const SPHERE_CY_RATIO = 0.50;
    const SPHERE_R_RATIO = 0.28;

    /* ── slowWarp: 128-step organic blob (period ~18 s)
         Three sine frequencies produce the fluid border-radius feel ── */
    function drawBlob(cx, cy, baseR, t) {
        const w = (t % 18000) / 18000 * Math.PI * 2;
        const STEPS = 128;
        ctx.beginPath();
        for (let s = 0; s <= STEPS; s++) {
            const angle = (s / STEPS) * Math.PI * 2;
            const d1 = Math.sin(angle * 2 + w) * 0.028;
            const d2 = Math.sin(angle * 3 + w * 1.30) * 0.016;
            const d3 = Math.sin(angle * 5 + w * 0.70) * 0.009;
            const r = baseR * (1 + d1 + d2 + d3);
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    /* ── chromaticPulse gradient (period 12 s)
         Focal point orbits to produce the background-position shift ── */
    function buildChromaticGradient(cx, cy, r, t) {
        const cycle = (t % 12000) / 12000;
        const angle = cycle * Math.PI * 2;
        const fxOff = r * 0.35 * Math.cos(angle);
        const fyOff = r * 0.35 * Math.sin(angle);

        const g = ctx.createRadialGradient(
            cx + fxOff - r * 0.2, cy + fyOff - r * 0.2, r * 0.04,
            cx, cy, r * 1.05
        );

        // Soft Periwinkle #A5B4FC → Indigo #6366F1 → Icy Frost #D7ECFF
        const cA = 0.55 + 0.20 * Math.sin(cycle * Math.PI * 2);
        const pA = 0.45 + 0.20 * Math.sin(cycle * Math.PI * 2 + Math.PI * 0.66);
        const fA = 0.70 + 0.18 * Math.sin(cycle * Math.PI * 2 + Math.PI * 1.33);

        g.addColorStop(0.00, `rgba(215, 236, 255, ${fA.toFixed(2)})`);   // frost
        g.addColorStop(0.28, `rgba(165, 180, 252, ${cA.toFixed(2)})`);   // #A5B4FC
        g.addColorStop(0.60, `rgba(99,  102, 241, ${pA.toFixed(2)})`);   // #6366F1
        g.addColorStop(0.85, 'rgba(215, 236, 255, 0.14)');
        g.addColorStop(1.00, 'rgba(215, 236, 255, 0.00)');
        return g;
    }

    /* ── chromaticPulse scale oscillator (1.000 → 1.012) ── */
    function pulseScale(t) {
        const cycle = (t % 12000) / 12000;
        return 1.0 + 0.012 * Math.sin(cycle * Math.PI * 2);
    }

    /* ── Main draw loop ── */
    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        const t = performance.now() - START;

        ctx.clearRect(0, 0, W, H);

        /* Particles */
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(96, 130, 200, ${p.a})`;
            ctx.fill();
        });

        /* Sphere core params */
        const cx = W * SPHERE_CX_RATIO;
        const cy = H * SPHERE_CY_RATIO + sphereY;
        const r = H * SPHERE_R_RATIO * pulseScale(t);

        /* ① Ambient Indigo outer glow */
        ctx.save();
        ctx.shadowColor = 'rgba(99, 102, 241, 0.30)';
        ctx.shadowBlur = r * 0.75;
        ctx.shadowOffsetY = r * 0.24;
        drawBlob(cx, cy, r * 1.22, t);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.07)';
        ctx.fill();
        ctx.restore();

        /* ② Periwinkle secondary halo */
        ctx.save();
        ctx.shadowColor = 'rgba(165, 180, 252, 0.16)';
        ctx.shadowBlur = r * 0.50;
        drawBlob(cx, cy, r * 1.10, t);
        ctx.fillStyle = 'rgba(165, 180, 252, 0.05)';
        ctx.fill();
        ctx.restore();

        /* ③ Frost base — #D7ECFF pale icy fill */
        drawBlob(cx, cy, r, t);
        ctx.fillStyle = 'rgba(215, 236, 255, 0.52)';
        ctx.fill();

        /* ④ Animated chromatic gradient (cyan → purple → frost) */
        drawBlob(cx, cy, r, t);
        ctx.fillStyle = buildChromaticGradient(cx, cy, r, t);
        ctx.fill();

        /* ⑤ Glass specular shimmer — top-left white reflection */
        const shine = ctx.createRadialGradient(
            cx - r * 0.32, cy - r * 0.32, 0,
            cx - r * 0.32, cy - r * 0.32, r * 0.50
        );
        shine.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
        shine.addColorStop(0.4, 'rgba(255, 255, 255, 0.28)');
        shine.addColorStop(1, 'rgba(255, 255, 255, 0.00)');
        drawBlob(cx, cy, r, t);
        ctx.fillStyle = shine;
        ctx.fill();

        /* ⑥ Indigo inner glow (inset equivalent) */
        const inner = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
        inner.addColorStop(0, 'rgba(99, 102, 241, 0.00)');
        inner.addColorStop(0.7, 'rgba(99, 102, 241, 0.07)');
        inner.addColorStop(1, 'rgba(99, 102, 241, 0.15)');
        drawBlob(cx, cy, r, t);
        ctx.fillStyle = inner;
        ctx.fill();

        /* ⑦ Colour-shifting border ring (Indigo ↔ Periwinkle) */
        const cycle = (t % 12000) / 12000;
        const ringIndigo = Math.max(0, Math.sin(cycle * Math.PI * 2));
        const ringPeri = Math.max(0, Math.sin(cycle * Math.PI * 2 + Math.PI));
        ctx.save();
        const rR = Math.round(99 + ringPeri * 66);
        const rG = Math.round(102 + ringPeri * 78);
        const rB = Math.round(241 + ringPeri * 11);
        ctx.strokeStyle = `rgba(${rR}, ${rG}, ${rB}, 0.45)`;
        ctx.lineWidth = 1.5;
        drawBlob(cx, cy, r, t);
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(draw);
    }
    draw();

    /* ── GSAP: float the sphere via sphereY proxy ── */
    if (typeof gsap !== 'undefined') {
        const proxy = { y: 0 };
        gsap.to(proxy, {
            y: 22, duration: 4.2, repeat: -1, yoyo: true,
            ease: 'sine.inOut',
            onUpdate() { sphereY = proxy.y; }
        });

        /* ── Kinetic text reveal ── */
        const items = ['#aHeroEyebrow', '#aHeroTitle', '#aHeroSub'];
        items.forEach((sel, i) => {
            const el = document.querySelector(sel);
            if (!el) return;
            gsap.fromTo(el,
                { x: -40, opacity: 0 },
                { x: 0, opacity: 1, duration: 1.4, ease: 'power4.out', delay: 0.4 + i * 0.18 }
            );
        });
    }
})();



(function initAbout() {
    if (typeof gsap === 'undefined') return;

    /* ── Abstract rings pulse (Mission section) ── */
    const rings = document.querySelectorAll('.abstract-ring');
    rings.forEach((ring, i) => {
        gsap.fromTo(ring, { scale: 0.9, opacity: 0.3 }, {
            scale: 1.1, opacity: 0.9,
            duration: 2 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    });

    /* ── Value pills stagger ── */
    gsap.utils.toArray('.value-pill').forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, scale: 0.85, y: 20 },
            {
                opacity: 1, scale: 1, y: 0,
                duration: 0.6,
                ease: 'back.out(1.5)',
                delay: i * 0.1,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                }
            }
        );
    });

})();


/* ══════════════════════════════════════════════════════
   WIN AGENCY — CARDSWAP ENGINE
   GSAP Elastic.out physics · Auto-cycle 4500ms · pauseOnHover
   Desktop: 500x400px · Mobile: 320x280px
   Easing: elastic.out(1, 0.75) — "snap-back" feel
   ══════════════════════════════════════════════════════ */
(function initCardSwap() {
    'use strict';

    /* ── Config (hardcoded for WIN brand) ── */
    const CFG = {
        dropDuration:   0.8,    // front card exit down
        shiftDuration:  0.6,    // background cards shifting forward
        returnDuration: 1.2,    // front card returning to back of stack
        stagger:        0.1,    // wave stagger between background cards
        autoCycleMs:    4500,   // auto-advance interval
        easeElastic:    'elastic.out(1, 0.75)',
        easeShift:      'power3.out',
    };

    /* ── DOM ── */
    const stage   = document.getElementById('cardswapStage');
    const dotsBar = document.getElementById('journeyProgDots');
    const lblYear = document.getElementById('journeyActiveYear');
    const lblTitle= document.getElementById('journeyActiveTitle');
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll('.cs-card'));
    const N     = cards.length;
    if (!N) return;

    /* ── Accent colours per card index (for label border) ── */
    const ACCENT_COLORS = ['#6366f1','#0ea5e9','#8b5cf6','#14b8a6'];

    /* ── Stack order: index 0 = top card (front) ── */
    let order = cards.map((_, i) => i);  /* [0,1,2,3] */
    let isAnimating = false;
    let isPaused    = false;
    let autoCycleId = null;

    /* ════════════════════════════════════════════════════
       STACK POSITIONING — set initial DOM z-order & transforms
       ════════════════════════════════════════════════════ */

    /* Depth config for background cards in the stack */
    function getStackConfig(pos) {
        /* pos 0 = top / front card */
        switch (pos) {
            case 0: return { y: 0,   scl: 1.00,  z: N + 10, opc: 1    };
            case 1: return { y: 16,  scl: 0.95,  z: N + 9,  opc: 0.88 };
            case 2: return { y: 30,  scl: 0.90,  z: N + 8,  opc: 0.60 };
            case 3: return { y: 40,  scl: 0.85,  z: N + 7,  opc: 0.35 };
            default: return { y: 48, scl: 0.82,  z: N + 6,  opc: 0    };
        }
    }

    function applyStackPositions(instant) {
        order.forEach((cardIdx, pos) => {
            const card = cards[cardIdx];
            const cfg  = getStackConfig(pos);

            /* Update data-cs-pos for CSS pointer-events & hover rules */
            card.setAttribute('data-cs-pos', String(pos));

            if (instant) {
                gsap.set(card, { y: cfg.y, scale: cfg.scl, zIndex: cfg.z, opacity: cfg.opc });
            }
        });
    }

    /* ═══════════════════════════════════════════════════
       SYNC UI — progress dots + active milestone label
       ═══════════════════════════════════════════════════ */
    function syncUI() {
        const topCardIdx = order[0];
        const topCard    = cards[topCardIdx];
        const year       = topCard.dataset.csYear  || '';
        const title      = topCard.dataset.csTitle || '';
        const color      = ACCENT_COLORS[topCardIdx] || '#6366f1';

        /* Active label */
        if (lblYear)  { lblYear.textContent  = year;  lblYear.style.color = color; }
        if (lblTitle) { lblTitle.textContent = title; }

        /* Border-left accent on label box */
        const labelBox = document.getElementById('journeyActiveLabel');
        if (labelBox) labelBox.style.borderLeftColor = color;

        /* Progress dots */
        if (dotsBar) {
            dotsBar.querySelectorAll('.journey-prog-dot').forEach((dot, i) => {
                const isActive = i === topCardIdx;
                dot.classList.toggle('journey-prog-dot--active', isActive);
            });
        }
    }

    /* ═══════════════════════════════════════════════════
       CARD SWAP ANIMATION — the core GSAP sequence
       ═══════════════════════════════════════════════════ */
    function doSwap(targetIdx) {
        if (isAnimating) return;
        if (typeof gsap === 'undefined') return;

        /* If targetIdx is specified, rotate order until that card is second */
        if (targetIdx !== undefined && targetIdx !== null) {
            /* Bring targetIdx to position 1 (next to become top) */
            let rotations = 0;
            while (order[1] !== targetIdx && rotations < N) {
                /* Move top card to back */
                order.push(order.shift());
                rotations++;
            }
        }

        isAnimating = true;

        /* Cards currently at each position */
        const frontCard = cards[order[0]];
        const bgCards   = order.slice(1).map(i => cards[i]);

        /* ── Phase 1: Drop front card DOWN (exit) ── */
        gsap.to(frontCard, {
            y: '+=280',
            scale: 0.85,
            opacity: 0,
            duration: CFG.dropDuration,
            ease: 'power2.in',
            onComplete: () => {

                /* ── Phase 2: Move front card to BACK of stack instantly ── */
                order.push(order.shift());  /* rotate order array */
                const backCard   = cards[order[N - 1]];
                const backConfig = getStackConfig(N - 1);

                /* Teleport to back position off-screen (above) */
                gsap.set(backCard, {
                    y: backConfig.y - 200,  /* start from above */
                    scale: backConfig.scl,
                    opacity: 0,
                    zIndex: backConfig.z,
                });

                /* Update data-cs-pos for all cards */
                order.forEach((cardIdx, pos) => {
                    cards[cardIdx].setAttribute('data-cs-pos', String(pos));
                });

                /* Sync UI immediately when top card changes */
                syncUI();

                /* ── Phase 3a: Background cards shift forward (wave stagger) ── */
                const newBgCards = order.slice(1, N - 1).map(i => cards[i]);
                newBgCards.forEach((card, i) => {
                    const cfg = getStackConfig(i + 1);  /* they're now at pos 1..N-2 */
                    gsap.to(card, {
                        y:       cfg.y,
                        scale:   cfg.scl,
                        opacity: cfg.opc,
                        zIndex:  cfg.z,
                        duration: CFG.shiftDuration,
                        ease:     CFG.easeShift,
                        delay:    i * CFG.stagger,
                    });
                });

                /* ── Phase 3b: New top card snaps forward with elastic feel ── */
                const newTopCard   = cards[order[0]];
                const topCfg       = getStackConfig(0);
                gsap.to(newTopCard, {
                    y:       topCfg.y,
                    scale:   topCfg.scl,
                    opacity: topCfg.opc,
                    zIndex:  topCfg.z,
                    duration: CFG.shiftDuration,
                    ease:     CFG.easeElastic,
                });

                /* ── Phase 3c: Old-front returns to back with elastic ── */
                gsap.to(backCard, {
                    y:        backConfig.y,
                    opacity:  backConfig.opc,
                    duration: CFG.returnDuration,
                    ease:     CFG.easeElastic,
                    delay:    newBgCards.length * CFG.stagger + 0.05,
                    onComplete: () => {
                        isAnimating = false;
                    }
                });
            }
        });
    }

    /* ═══════════════════════════════════════════════════
       AUTO-CYCLE
       ═══════════════════════════════════════════════════ */
    function startCycle() {
        stopCycle();
        autoCycleId = setInterval(() => {
            if (!isPaused) doSwap(null);
        }, CFG.autoCycleMs);
    }

    function stopCycle() {
        if (autoCycleId) { clearInterval(autoCycleId); autoCycleId = null; }
    }

    /* ═══════════════════════════════════════════════════
       HOVER — pauseOnHover + subtle scale up (scale: 1.02)
       ═══════════════════════════════════════════════════ */
    stage.addEventListener('mouseenter', () => {
        isPaused = true;
        /* Scale the entire stage up slightly to signal interactivity */
        if (typeof gsap !== 'undefined') {
            gsap.to(stage, { scale: 1.02, duration: 0.35, ease: 'power2.out' });
        }
    });

    stage.addEventListener('mouseleave', () => {
        isPaused = false;
        if (typeof gsap !== 'undefined') {
            gsap.to(stage, { scale: 1, duration: 0.35, ease: 'power2.out' });
        }
    });

    /* ═══════════════════════════════════════════════════
       INTERACTIONS
       ═══════════════════════════════════════════════════ */

    /* Click on stage → advance */
    stage.addEventListener('click', () => {
        if (!isAnimating) {
            stopCycle();
            doSwap(null);
            startCycle();
        }
    });

    /* Progress dot clicks → jump to specific card */
    if (dotsBar) {
        dotsBar.addEventListener('click', e => {
            const dot = e.target.closest('.journey-prog-dot');
            if (!dot || isAnimating) return;
            const target = parseInt(dot.dataset.target, 10);
            if (isNaN(target)) return;
            stopCycle();
            doSwap(target);
            startCycle();
        });
    }

    /* Keyboard: Space / Enter / ArrowRight → advance */
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (!isAnimating) { stopCycle(); doSwap(null); startCycle(); }
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            /* Reverse: rotate backwards */
            if (!isAnimating) {
                stopCycle();
                order.unshift(order.pop());
                applyStackPositions(true);
                syncUI();
                startCycle();
            }
        }
    });

    /* ═══════════════════════════════════════════════════
       INITIALISE
       ═══════════════════════════════════════════════════ */
    function init() {
        if (typeof gsap === 'undefined') return;

        /* Set initial stack positions instantly */
        applyStackPositions(true);
        syncUI();

        /* GSAP ScrollTrigger entrance animation */
        if (typeof ScrollTrigger !== 'undefined') {
            const textCol  = document.getElementById('journeyTextCol');
            const rightCol = document.getElementById('journeyRightCol');

            if (textCol) {
                gsap.fromTo(textCol,
                    { opacity: 0, x: -56 },
                    { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
                      scrollTrigger: { trigger: '#journeySection', start: 'top 78%', once: true } }
                );
            }
            if (rightCol) {
                gsap.fromTo(rightCol,
                    { opacity: 0, y: 60 },
                    { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.2,
                      scrollTrigger: { trigger: '#journeySection', start: 'top 78%', once: true } }
                );
            }
        }

        /* Start auto-cycle */
        startCycle();
    }

    init();

})();























/* ══════════════════════════════════════════════════════
   NEURAL PROFILE STACK — Minds Behind WIN
   Staggered entrance + detail-item reveal + mobile tap
   ══════════════════════════════════════════════════════ */
(function initMinds() {
    const units = document.querySelectorAll('.mind-unit');
    if (!units.length) return;

    /* ── Staggered entrance via ScrollTrigger ── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        units.forEach((unit, i) => {
            gsap.fromTo(unit,
                { opacity: 0, x: -36 },
                {
                    opacity: 1, x: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    delay: i * 0.16,
                    scrollTrigger: {
                        trigger: '#meetTheMinds',
                        start: 'top 78%',
                        once: true,
                        onEnter: () => unit.classList.add('visible'),
                    }
                }
            );
        });
    } else {
        /* Fallback without GSAP */
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                units.forEach((u, i) => {
                    setTimeout(() => u.classList.add('visible'), i * 160);
                });
                obs.disconnect();
            });
        }, { threshold: 0.2 });
        const section = document.getElementById('meetTheMinds');
        if (section) obs.observe(section);
    }

    /* ── Detail-item staggered reveal on show ── */
    function revealItems(unit) {
        const items = unit.querySelectorAll('.mind-detail-item');
        items.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            item.style.transition = 'none';
            /* rAF to let browser register the reset before animating */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    item.style.transition = `opacity 0.4s ease ${100 + i * 110}ms,
                                             transform 0.4s ease ${100 + i * 110}ms`;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                });
            });
        });
    }

    function resetItems(unit) {
        unit.querySelectorAll('.mind-detail-item').forEach(item => {
            item.style.transition = 'none';
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
        });
    }

    units.forEach(unit => {
        /* Desktop hover */
        unit.addEventListener('mouseenter', () => revealItems(unit));
        unit.addEventListener('mouseleave', () => resetItems(unit));

        /* Mobile tap toggle */
        unit.addEventListener('click', () => {
            const isActive = unit.getAttribute('data-active') === 'true';

            /* Close all siblings first */
            units.forEach(u => {
                if (u !== unit) {
                    u.setAttribute('data-active', 'false');
                    resetItems(u);
                }
            });

            unit.setAttribute('data-active', String(!isActive));
            if (!isActive) revealItems(unit);
            else resetItems(unit);
        });
    });
})();

