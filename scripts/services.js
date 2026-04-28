/* =====================================================
   WIN AGENCY — SERVICES.JS
   Company Brain Hero: Particles · Orbital Nodes · Connectors · GSAP Reveals
   ===================================================== */
'use strict';

/* ══════════════════════════════════════════════════════
   0. CTA PAGE-GUARD — Hides .service-cta-section on any
      page whose URL does NOT contain ‘services’.
      Belt-and-suspenders: the section is only hardcoded
      into services.html, but this guard ensures isolation
      if the markup ever gets shared via templates/includes.
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('services')) {
        /* Hide both the new Gravity Core CTA and any legacy CTA selector */
        document.querySelectorAll('.gc-section, .service-cta-section')
            .forEach(function (el) { el.style.display = 'none'; });
    }
});

/* ═══════════════════════════════════════════════════════════════════
   1. PLEXUS PARTICLE ENGINE
   ───────────────────────────────────────────────────────────────────
   • Pure Canvas 2D — no ES-module import needed
   • Particles drift autonomously; nearest pairs are linked by lines
     whose opacity fades with distance (classic neural-net look)
   • Desktop: mouse proximity triggers a smooth magnetic push/pull
   • Mobile:  animation plays autonomously — NO touch reaction.
              canvas is pointer-events:none so scroll is unblocked.
   • Particle count halved on mobile for solid 60 fps
   ═══════════════════════════════════════════════════════════════════ */
(function initPlexus() {
    'use strict';

    const canvas = document.getElementById('plexusCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* ── Device + quality settings ── */
    const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || window.innerWidth < 768;
    const COUNT = IS_MOBILE ? 80 : 160;   // particle count
    const LINK_DIST = IS_MOBILE ? 110 : 155;   // max px between linked dots
    const CURSOR_RADIUS = IS_MOBILE ? 110 : 155;   // magnetic influence radius
    const CURSOR_FORCE = 0.038;                   // spring constant
    const MAX_SPEED = IS_MOBILE ? 0.8 : 1.1;   // px per frame cap
    const DOT_RADIUS = IS_MOBILE ? 1.8 : 2.2;
    const LINE_WIDTH = 0.75;

    /* Indigo + violet palette — cycles across dots for depth */
    const DOT_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#6366f1', '#8b5cf6'];

    /* ── Resize canvas to fill parent ── */
    function resize() {
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); }, { passive: true });

    /* ── Particle factory ── */
    function makeParticle(i) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.35 + 0.15) * MAX_SPEED;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            ox: 0,                          // velocity x
            oy: 0,                          // velocity y
            dvx: Math.cos(angle) * speed,    // drift velocity x
            dvy: Math.sin(angle) * speed,    // drift velocity y
            r: DOT_RADIUS * (Math.random() * 0.5 + 0.75),
            col: DOT_COLORS[i % DOT_COLORS.length],
        };
    }

    const particles = Array.from({ length: COUNT }, (_, i) => makeParticle(i));

    /* ── Cursor state (canvas-local px) ── */
    /* Starts permanently off-screen so particles drift freely until mouse enters */
    const cursor = { x: -9999, y: -9999, active: false };

    /* Convert client coords to canvas-local coords */
    function toCursorLocal(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        cursor.x = clientX - rect.left;
        cursor.y = clientY - rect.top;
        cursor.active = true;
    }

    /* ─────────────────────────────────────────────────────────────
       DESKTOP-ONLY: magnetic mouse cursor interactions.
       On mobile we NEVER register touch handlers so that:
         1. Particles run in pure autonomous-drift mode — no jitter
         2. All touch events pass through the canvas to the page body
            so vertical scroll is never interrupted by the canvas.
    ───────────────────────────────────────────────────────────── */
    if (!IS_MOBILE) {
        /* Track mouse movement over canvas */
        canvas.addEventListener('mousemove', (e) => {
            toCursorLocal(e.clientX, e.clientY);
        }, { passive: true });

        /* Mouse leaves canvas area: reset cursor to off-screen */
        canvas.addEventListener('mouseleave', () => {
            cursor.active = false;
            cursor.x = -9999;
            cursor.y = -9999;
        });

        /* Mouse exits the entire viewport: same reset */
        document.addEventListener('mouseleave', () => {
            cursor.active = false;
            cursor.x = -9999;
            cursor.y = -9999;
        }, { passive: true });

    } else {
        /* ── MOBILE ISOLATION ──────────────────────────────────────
           pointer-events: none lets all finger gestures (swipe-to-scroll,
           tap) pass through the canvas element to the document body.
           cursor.active stays false permanently — the magnetic push
           block inside the loop is never reached, so particles move
           only by their autonomous drift velocity. No jitter.
        ────────────────────────────────────────────────────────── */
        canvas.style.pointerEvents = 'none';
        /* cursor.active === false always on mobile — no listeners needed */
    }

    /* ── Main animation loop ── */
    (function loop() {
        requestAnimationFrame(loop);
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        /* Phase 1 — update each particle */
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];

            /* Drift restore: gradually blend back to autonomous velocity */
            p.ox += (p.dvx - p.ox) * 0.04;
            p.oy += (p.dvy - p.oy) * 0.04;

            /* Magnetic cursor push */
            if (cursor.active) {
                const dx = p.x - cursor.x;
                const dy = p.y - cursor.y;
                const dist2 = dx * dx + dy * dy;
                const r2 = CURSOR_RADIUS * CURSOR_RADIUS;
                if (dist2 < r2 && dist2 > 0.01) {
                    const dist = Math.sqrt(dist2);
                    /* Repulsion force: stronger closer to cursor */
                    const strength = CURSOR_FORCE * (1 - dist / CURSOR_RADIUS);
                    /* Normalised direction away from cursor */
                    p.ox += (dx / dist) * strength * 18;
                    p.oy += (dy / dist) * strength * 18;
                }
            }

            /* Clamp speed */
            const spd = Math.sqrt(p.ox * p.ox + p.oy * p.oy);
            if (spd > MAX_SPEED * 3.5) {
                const sc = (MAX_SPEED * 3.5) / spd;
                p.ox *= sc; p.oy *= sc;
            }

            p.x += p.ox;
            p.y += p.oy;

            /* Wrap at edges */
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20;
            if (p.y > H + 20) p.y = -20;
        }

        /* Phase 2 — draw connection lines (O(n²) but capped by COUNT) */
        for (let i = 0; i < COUNT; i++) {
            const a = particles[i];
            for (let j = i + 1; j < COUNT; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.22;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = '#6366f1';
                    ctx.lineWidth = LINE_WIDTH;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        /* Phase 3 — draw dots */
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            ctx.save();
            ctx.globalAlpha = 0.82;
            ctx.fillStyle = p.col;
            ctx.shadowColor = p.col;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        /* Phase 4 — cursor glow ring (desktop only) */
        if (cursor.active && !IS_MOBILE) {
            ctx.save();
            const grad = ctx.createRadialGradient(
                cursor.x, cursor.y, 0,
                cursor.x, cursor.y, CURSOR_RADIUS
            );
            grad.addColorStop(0, 'rgba(99,102,241,0.12)');
            grad.addColorStop(0.5, 'rgba(99,102,241,0.05)');
            grad.addColorStop(1, 'rgba(99,102,241,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cursor.x, cursor.y, CURSOR_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    })();
})();

/* ══════════════════════════════════════════════════════
   2. GROWTH CHART BAR ANIMATION — GSAP Scroll-Triggered Rise
      Uses ScrollTrigger to watch #marketing. When 40% of the
      section enters the viewport, each .bar-fill rises from
      height:0 to its data-h% of the chart container height.
      Fires once; badge fades in via .animated class.
   ══════════════════════════════════════════════════════ */
(function initGrowthChart() {
    const chartBars = document.getElementById('marketingChartBars');
    const chartVisual = document.getElementById('marketingChartVisual');
    const statBadge = document.getElementById('chartStatBadge');
    if (!chartBars) return;

    const bars = chartBars.querySelectorAll('.chart-bar');

    /* ── Animation function ── */
    function runBarAnimation() {
        const containerH = chartBars.clientHeight || 130;

        bars.forEach((bar, i) => {
            const pct = parseFloat(bar.dataset.h) || 50;
            const fillEl = bar.querySelector('.bar-fill');
            if (!fillEl) return;

            const targetH = (pct / 100) * containerH;

            if (typeof gsap !== 'undefined') {
                /* GSAP path: springy bounce-up with stagger delay */
                gsap.fromTo(fillEl,
                    { height: 0 },
                    {
                        height: targetH,
                        duration: 1.1,
                        delay: i * 0.10,
                        ease: 'back.out(1.4)',
                    }
                );
            } else {
                /* CSS fallback path */
                fillEl.style.transition = `height 1s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`;
                requestAnimationFrame(() => { fillEl.style.height = targetH + 'px'; });
            }
        });

        /* Reveal the badge after bars have risen */
        setTimeout(() => {
            if (chartVisual) chartVisual.classList.add('animated');
        }, 900);
    }

    /* ── Trigger: observe the #marketing block ── */
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#marketing',
            start: 'top 65%',
            once: true,
            onEnter: runBarAnimation,
        });
    } else {
        /* Fallback: IntersectionObserver */
        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    runBarAnimation();
                    io.disconnect();
                }
            },
            { threshold: 0.35 }
        );
        io.observe(document.getElementById('marketing') || chartBars);
    }
})();

/* ══════════════════════════════════════════════════════
   5. GRAVITY CORE CTA CONTROLLER
   ──────────────────────────────────────────────────────
   A. Entrance reveal — IntersectionObserver adds .gc-visible
      to .gc-wrapper when 20% enters the viewport (fade + slide-up
      driven by CSS transition; 0.8s Power2.out).
   B. Magnetic pull (desktop only, innerWidth > 768)
      • Listens to mousemove on the whole section
      • Within 150px of button centre: btn translates toward cursor
        at 0.4× offset — snappy 0.3s spring feeling
      • Beyond 150px: button eases back to 0,0
      • RAF-throttled; no GSAP dependency
   C. Mobile pulse — handled entirely in CSS (@keyframes gcMobilePulse);
      this JS block does NOT add any mobile animation so the
      breathing effect is zero-JS-cost.
   D. In-button ripple — CSS .gc-ripple-circle appended on click
      for satisfying tactile feedback.
   E. Screen-fill circle — .gc-screen-ripple.gc-screen-active
      expands a purple disc to cover the viewport (0.65s), then
      redirects to contact.html after 650ms.
   ══════════════════════════════════════════════════════ */
(function initGravityCore() {
    'use strict';

    const section = document.getElementById('final-cta');
    const wrapper = section && section.querySelector('.gc-wrapper');
    const btn = document.getElementById('gc-btn');
    const rippleArea = document.getElementById('gc-ripple-overlay');
    const screenRipple = document.getElementById('gc-screen-ripple');

    if (!section || !btn) return;

    /* ──────────────────────────────────────────
       A. Entrance reveal via IntersectionObserver
    ────────────────────────────────────────── */
    if (wrapper) {
        const revealIO = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    wrapper.classList.add('gc-visible');
                    revealIO.disconnect();
                }
            },
            { threshold: 0.20 }
        );
        revealIO.observe(section);
    }

    /* ──────────────────────────────────────────
       B. Magnetic pull — desktop only
    ────────────────────────────────────────── */
    const IS_TOUCH = ('ontouchstart' in window) || window.innerWidth <= 768;

    if (!IS_TOUCH) {
        const RADIUS = 150;   // px — gravity field radius
        const PULL_FACTOR = 0.40;  // 0–1; higher = stronger pull

        let rafId = null;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        /* RAF loop for silky lerp toward target */
        function magneticLoop() {
            /* Lerp factor: 0.18 gives the snappy 0.3s feel without jank */
            currentX += (targetX - currentX) * 0.18;
            currentY += (targetY - currentY) * 0.18;

            /* Skip re-paint when essentially at rest */
            if (Math.abs(currentX - targetX) < 0.01 &&
                Math.abs(currentY - targetY) < 0.01) {
                currentX = targetX;
                currentY = targetY;
                rafId = null;
            }

            btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (rafId !== null) rafId = requestAnimationFrame(magneticLoop);
        }

        function startRAF() {
            if (!rafId) {
                rafId = requestAnimationFrame(magneticLoop);
            }
        }

        document.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnCX = rect.left + rect.width / 2;
            const btnCY = rect.top + rect.height / 2;

            const dx = e.clientX - btnCX;
            const dy = e.clientY - btnCY;
            const dist = Math.hypot(dx, dy);

            if (dist < RADIUS) {
                targetX = dx * PULL_FACTOR;
                targetY = dy * PULL_FACTOR;
            } else {
                targetX = 0;
                targetY = 0;
            }

            startRAF();
        }, { passive: true });

        /* Reset on mouse leave from viewport */
        document.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            startRAF();
        });
    }

    /* ──────────────────────────────────────────
       D. In-button ripple click effect
    ────────────────────────────────────────── */
    btn.addEventListener('pointerdown', (e) => {
        if (!rippleArea) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const circle = document.createElement('span');
        circle.classList.add('gc-ripple-circle');
        circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
        rippleArea.appendChild(circle);

        /* Clean up after animation */
        circle.addEventListener('animationend', () => circle.remove(), { once: true });
    });

})();

/* ══════════════════════════════════════════════════════
   E. gcNavigateToContact — Screen-fill ripple transition
      Called by onclick="gcNavigateToContact(event)" in the HTML.
      1. Injects .gc-screen-active to grow the purple disc
      2. Waits 650ms for animation to cover the screen
      3. Redirects to contact.html
   ══════════════════════════════════════════════════════ */
function gcNavigateToContact(e) {
    /* Prevent double-fire */
    if (gcNavigateToContact._fired) return;
    gcNavigateToContact._fired = true;

    /* Position the ripple centre at the click/tap point */
    const screenRipple = document.getElementById('gc-screen-ripple');
    if (screenRipple) {
        if (e) {
            screenRipple.style.top = e.clientY + 'px';
            screenRipple.style.left = e.clientX + 'px';
        }
        screenRipple.classList.add('gc-screen-active');
    }

    /* Scale-down tactile feedback on the button */
    const btn = document.getElementById('gc-btn');
    if (btn) {
        btn.style.transition = 'transform 0.12s ease';
        btn.style.transform = 'scale(0.94)';
    }

    /* Redirect after the disc has covered the screen */
    setTimeout(() => {
        window.location.href = '../contact/index.html';
    }, 650);
}

/* ══════════════════════════════════════════════════════
   3. CODE WINDOW — Typing Animation
   ══════════════════════════════════════════════════════
   • Fires once when #codeWindowWebDev enters the viewport
   • Types character-by-character through pre-tokenised HTML
   • getVisibleLength() counts only visible chars (ignores span tags)
   • Blinking cursor is a CSS-only .typing-cursor span
   ══════════════════════════════════════════════════════ */
(function initCodeTyping() {
    'use strict';

    const codeWindow = document.getElementById('codeWindowWebDev');
    const container = document.getElementById('typing-container');
    if (!codeWindow || !container) return;

    /* ── Pre-tokenised lines (HTML ready to inject) ── */
    const LINES = [
        '<span class="syntax-kw">const</span> <span class="syntax-fn">WINApp</span> = () => {',
        '  <span class="syntax-kw">const</span> [revenue, setRevenue] = <span class="syntax-fn">useState</span>(<span class="syntax-str">0</span>);',
        '',
        '  <span class="syntax-cm">// Magic happens here \uD83D\uDE80</span>',
        '  <span class="syntax-kw">return</span> (',
        '    <span class="syntax-tag">&lt;div</span> <span class="syntax-at">className</span>=<span class="syntax-str">"win"</span><span class="syntax-tag">&gt;</span>',
        '      <span class="syntax-tag">&lt;h1&gt;</span>Your Digital Future<span class="syntax-tag">&lt;/h1&gt;</span>',
        '      <span class="syntax-tag">&lt;Revenue</span> <span class="syntax-at">value</span>={revenue} <span class="syntax-tag">/&gt;</span>',
        '    <span class="syntax-tag">&lt;/div&gt;</span>',
        '  );',
        '};',
    ];

    /* ── Timing constants (ms) ── */
    const CHAR_DELAY = 18;   /* per visible character           */
    const LINE_PAUSE = 120;  /* pause between lines             */
    const BLANK_PAUSE = 60;   /* shorter pause for blank lines   */
    const INITIAL_DELAY = 300;  /* let page settle before starting */

    /* Strip HTML tags → measure only visible text length */
    function getVisibleLength(html) {
        return html.replace(/<[^>]*>/g, '').length;
    }

    /* Decode HTML entities (e.g. &lt;) to their visible character */
    function entityLength(raw) {
        /* Each HTML entity (&lt; &gt; &amp;) counts as 1 visible char */
        return raw.replace(/&[a-z]+;/gi, 'X').length;
    }

    /* ── Core typing loop ──
       lineIdx : which LINES[] entry we're on
       charIdx : how many *visible* chars of that line have been revealed
    */
    function buildDisplay(lineIdx, charCount) {
        /* All completed lines — inject full HTML */
        const done = LINES.slice(0, lineIdx).join('\n');

        /* Current line — need to reveal `charCount` visible chars
           while keeping span tags intact */
        const currentRaw = LINES[lineIdx];
        let revealed = '';
        let visibleSeen = 0;
        let i = 0;

        while (i < currentRaw.length && visibleSeen < charCount) {
            if (currentRaw[i] === '<') {
                /* Gobble up the full tag — contributes 0 visible chars */
                const tagEnd = currentRaw.indexOf('>', i);
                if (tagEnd !== -1) {
                    revealed += currentRaw.slice(i, tagEnd + 1);
                    i = tagEnd + 1;
                } else {
                    revealed += currentRaw[i++];
                }
            } else if (currentRaw[i] === '&') {
                /* HTML entity — counts as 1 visible char */
                const semi = currentRaw.indexOf(';', i);
                if (semi !== -1) {
                    revealed += currentRaw.slice(i, semi + 1);
                    i = semi + 1;
                } else {
                    revealed += currentRaw[i++];
                }
                visibleSeen++;
            } else {
                revealed += currentRaw[i++];
                visibleSeen++;
            }
        }

        /* Close any unclosed spans so the browser doesn't inherit colour */
        const openSpans = (revealed.match(/<span[^>]*>/g) || []).length;
        const closeSpans = (revealed.match(/<\/span>/g) || []).length;
        const closeExtra = '</span>'.repeat(Math.max(0, openSpans - closeSpans));

        return (done ? done + '\n' : '') +
            revealed + closeExtra +
            '<span class="typing-cursor"> </span>';
    }

    /* ── Animation runner ── */
    function type(lineIdx, charIdx) {
        if (lineIdx >= LINES.length) {
            /* Finished — show completed code, remove cursor */
            container.innerHTML = LINES.join('\n');
            return;
        }

        const line = LINES[lineIdx];
        const visibleTotal = getVisibleLength(line);

        container.innerHTML = buildDisplay(lineIdx, charIdx);

        if (charIdx < visibleTotal) {
            /* Still typing current line */
            setTimeout(() => type(lineIdx, charIdx + 1), CHAR_DELAY);
        } else {
            /* Line complete — move to next */
            const pause = (line === '') ? BLANK_PAUSE : LINE_PAUSE;
            setTimeout(() => type(lineIdx + 1, 0), pause);
        }
    }

    /* ── IntersectionObserver — fires once at 35% viewport entry ── */
    const io = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                io.unobserve(codeWindow);
                setTimeout(() => type(0, 0), INITIAL_DELAY);
            }
        },
        { threshold: 0.35 }
    );

    io.observe(codeWindow);
})();

/* ══════════════════════════════════════════════════════
   4. SEO STRATEGY DASHBOARD — Animation Controller
   ══════════════════════════════════════════════════════ */
(function initSeoAnimation() {
    'use strict';

    const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

    const seoSection = document.getElementById('seoStrategy');
    if (!seoSection) return;

    function runAllAnimations() {
        const dashboard = document.getElementById('seoDashboard');
        if (!dashboard) return;

        // 1. Overall Traffic Graph
        dashboard.classList.add('seo-traffic-drawn');

        // 2. Ranking Score
        dashboard.classList.add('seo-gauge-drawn');
        
        // Gauge Arc and Needle
        const gaugeArc = document.getElementById('seoGaugeArc');
        if (gaugeArc) {
            gaugeArc.style.strokeDashoffset = (126 - (126 * 0.88)) + 'px'; // 88%
        }
        const gaugeNeedle = document.getElementById('seoGaugeNeedle');
        if (gaugeNeedle) {
            const rot = -90 + (180 * 0.88);
            gaugeNeedle.style.transform = `rotate(${rot}deg)`;
            if (IS_MOBILE) gaugeNeedle.style.transitionDuration = '1.2s';
        }

        // Odometer for Score
        const scoreEl = document.getElementById('seoGaugeScore');
        if (scoreEl) {
            let start = null;
            const target = 88;
            const duration = IS_MOBILE ? 1200 : 1800; // faster on mobile
            const startVal = 0;
            
            function tick(now) {
                if (!start) start = now;
                const progress = Math.min((now - start) / duration, 1);
                // Exponential ease out
                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const current = startVal + (target - startVal) * ease;
                
                scoreEl.textContent = Math.round(current);
                
                if (progress < 1) requestAnimationFrame(tick);
                else scoreEl.textContent = target;
            }
            requestAnimationFrame(tick);
        }

        // 3. Sitemap Coverage
        dashboard.classList.add('seo-sitemap-drawn');

        // Text reveal (existing logic preserved)
        const textRoot = document.getElementById('seoText');
        if (textRoot) {
            const items = [];
            const serviceNum = textRoot.querySelector('.service-num');
            const heading    = textRoot.querySelector('.seo-heading');
            const para       = textRoot.querySelector('p');
            const listItems  = textRoot.querySelectorAll('.service-features li');
            const cta        = textRoot.querySelector('.seo-cta');

            if (serviceNum) items.push(serviceNum);
            if (heading)    items.push(heading);
            if (para)       items.push(para);
            listItems.forEach(function (li) { items.push(li); });
            if (cta)        items.push(cta);

            items.forEach(function (el, i) {
                el.style.transitionDelay = (i * 0.10) + 's';
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        el.classList.add('seo-text-visible');
                    });
                });
            });
        }
    }

    // Use the dashboard specifically as the trigger on mobile since it's now lower in the DOM
    const triggerEl = IS_MOBILE ? document.getElementById('seoDashboard') : seoSection;
    const triggerStart = IS_MOBILE ? 'center 50%' : 'top 62%';

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: triggerEl,
            start: triggerStart,
            once: true,
            onEnter: runAllAnimations,
        });
    } else {
        const io = new IntersectionObserver(
            function (entries) {
                if (entries[0].intersectionRatio > 0) {
                    runAllAnimations();
                    io.disconnect();
                }
            },
            { threshold: IS_MOBILE ? 0.50 : 0.30 }
        );
        io.observe(triggerEl);
    }
})();

/* ══════════════════════════════════════════════════════
   5. PRODUCT PHOTOGRAPHY — Camera Viewfinder Controller
   ──────────────────────────────────────────────────────
   A. Autofocus sweep  (blur 10px → 0px on scroll entry)
   B. AF focus-box     (locks green after focus clears)
   C. Glitch-in badges (staggered, clip-path jitter)
   D. Live bars        (ping-pong CSS animations via class)
   E. Text waterfall   (slide-from-left, 0.1s stagger)
   F. Shutter interval (every 3-5s: flash + bump + swap)
   G. Manual shutter   (click / tap on viewfinder card)
   ══════════════════════════════════════════════════════ */
(function initPhotoAnimation() {
    'use strict';

    const section    = document.getElementById('productPhotography');
    const viewfinder = document.getElementById('photoViewfinder');
    if (!section || !viewfinder) return;

    /* ── DOM refs ── */
    const lens         = document.getElementById('vfLens');
    const focusBox     = document.getElementById('vfFocusBox');
    const subjectA     = document.getElementById('vfSubjectA');
    const subjectB     = document.getElementById('vfSubjectB');
    const flash        = document.getElementById('vfFlash');
    const barsPanel    = document.getElementById('vfBarsPanel');
    const barFocus     = document.getElementById('vfBarFocus');
    const barExposure  = document.getElementById('vfBarExposure');
    const barColor     = document.getElementById('vfBarColor');
    const shutterCount = document.getElementById('vfShutterCount');
    const badges       = [
        document.getElementById('vfBadgeShutter'),
        document.getElementById('vfBadgeAperture'),
        document.getElementById('vfBadgeIso'),
    ];

    /* ── State ── */
    let shutterNum   = 1;      /* running shutter count     */
    let subjectAVisible = true; /* which subject is showing  */
    let shutterTimer = null;
    let animationFired = false;

    /* ────────────────────────────────────────────
       Helper: zero-pad shutter count to 4 digits
    ──────────────────────────────────────────────*/
    function padCount(n) {
        return String(n).padStart(4, '0');
    }

    /* ────────────────────────────────────────────
       A. Autofocus Sweep
       lens starts with filter:blur(10px) in CSS.
       Adding .vf-focused triggers CSS transition
       to blur(0px) over 0.8s.
    ──────────────────────────────────────────────*/
    function runAutofocus() {
        if (!lens) return;
        /* tiny delay so user sees the blur state before sweep */
        setTimeout(function () {
            lens.classList.add('vf-focused');

            /* B. AF focus-box: lock green after focus clears */
            setTimeout(function () {
                if (focusBox) focusBox.classList.add('vf-focus-locked');
            }, 900);
        }, 220);
    }

    /* ────────────────────────────────────────────
       C. Glitch-in stat badges (staggered)
    ──────────────────────────────────────────────*/
    function revealBadges() {
        badges.forEach(function (badge, i) {
            if (!badge) return;
            setTimeout(function () {
                badge.classList.add('vf-badge-visible');
            }, 600 + i * 280);
        });
    }

    /* ────────────────────────────────────────────
       D. Bars panel: reveal + ping-pong
    ──────────────────────────────────────────────*/
    function startBars() {
        if (!barsPanel) return;

        /* Fade-in the panel (CSS transition with delay handles timing) */
        barsPanel.classList.add('vf-bars-visible');

        /* Kick off the ping-pong CSS animations on each bar */
        setTimeout(function () {
            if (barFocus)    barFocus.classList.add('vf-bar-animate');
            if (barExposure) barExposure.classList.add('vf-bar-animate');
            if (barColor)    barColor.classList.add('vf-bar-animate');
        }, 1400);
    }

    /* ────────────────────────────────────────────
       E. Text waterfall — slide from left
    ──────────────────────────────────────────────*/
    function revealText() {
        const textRoot = document.getElementById('photoText');
        if (!textRoot) return;

        var items = [];
        var numEl  = textRoot.querySelector('.service-num');
        var h2El   = textRoot.querySelector('h2');
        var pEl    = textRoot.querySelector('p');
        var liEls  = textRoot.querySelectorAll('.service-features li');
        var ctaEl  = textRoot.querySelector('.photo-cta');

        if (numEl) items.push(numEl);
        if (h2El)  items.push(h2El);
        if (pEl)   items.push(pEl);
        liEls.forEach(function (li) { items.push(li); });
        if (ctaEl) items.push(ctaEl);

        items.forEach(function (el, i) {
            el.style.transitionDelay = (i * 0.10) + 's';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    el.classList.add('photo-text-visible');
                });
            });
        });
    }

    /* ────────────────────────────────────────────
       F. Shutter cycle — flash + bump + swap
    ──────────────────────────────────────────────*/
    function triggerShutter() {
        if (!lens || !flash) return;

        /* 1. White flash over the entire section */
        flash.classList.remove('vf-flash-active');
        /* Force reflow so animation restarts cleanly */
        void flash.offsetWidth;
        flash.classList.add('vf-flash-active');
        flash.addEventListener('animationend', function () {
            flash.classList.remove('vf-flash-active');
        }, { once: true });

        /* 2. Scale bump on the lens */
        lens.classList.add('vf-shutter-bump');
        setTimeout(function () {
            lens.classList.remove('vf-shutter-bump');
        }, 180);

        /* 3. Swap product angle */
        if (subjectAVisible) {
            if (subjectA) subjectA.classList.add('vf-subject--hidden');
            if (subjectB) subjectB.classList.remove('vf-subject--hidden');
        } else {
            if (subjectB) subjectB.classList.add('vf-subject--hidden');
            if (subjectA) subjectA.classList.remove('vf-subject--hidden');
        }
        subjectAVisible = !subjectAVisible;

        /* 4. Increment shutter counter */
        shutterNum++;
        if (shutterCount) shutterCount.textContent = padCount(shutterNum);

        /* 5. Schedule next shutter at random interval (3–5 s) */
        scheduleNextShutter();
    }

    function scheduleNextShutter() {
        var delay = 3000 + Math.random() * 2000;   /* 3–5 s */
        clearTimeout(shutterTimer);
        shutterTimer = setTimeout(triggerShutter, delay);
    }

    /* ────────────────────────────────────────────
       G. Manual shutter on click / tap
    ──────────────────────────────────────────────*/
    viewfinder.addEventListener('click', function () {
        /* Only after entry animations have fired */
        if (animationFired) {
            clearTimeout(shutterTimer);
            triggerShutter();
        }
    });

    /* ────────────────────────────────────────────
       Master trigger: entry via IntersectionObserver
       or GSAP ScrollTrigger if available
    ──────────────────────────────────────────────*/
    function runAllAnimations() {
        if (animationFired) return;
        animationFired = true;

        runAutofocus();
        revealBadges();
        startBars();
        revealText();

        /* First automatic shutter fires ~2.5 s after entry
           (gives autofocus time to complete first) */
        shutterTimer = setTimeout(triggerShutter, 2500);
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 62%',
            once: true,
            onEnter: runAllAnimations,
        });
    } else {
        var io = new IntersectionObserver(
            function (entries) {
                if (entries[0].isIntersecting) {
                    runAllAnimations();
                    io.disconnect();
                }
            },
            { threshold: 0.28 }
        );
        io.observe(section);
    }
})();
