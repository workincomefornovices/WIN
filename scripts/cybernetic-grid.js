/* =====================================================
   WIN AGENCY — CYBERNETIC GRID SHADER
   WebGL interactive background for the Contact Hero.
   Runs on Three.js (r134) which is already loaded globally.

   Architecture:
     • OrthographicCamera + full-screen PlaneGeometry
     • Custom GLSL fragment shader: warping grid + cursor glow
     • Mouse & touch events update iMouse uniform in real time
     • Resize observer keeps the canvas pixel-perfect
   ===================================================== */

(function initCyberneticGrid() {
    'use strict';

    /* ── 1. Guard: wait for THREE to be available ── */
    if (typeof THREE === 'undefined') {
        console.warn('[CyberneticGrid] THREE.js not found – skipping WebGL grid.');
        return;
    }

    const container = document.getElementById('cyberneticGridMount');
    if (!container) return;

    /* ── 2. Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    container.appendChild(renderer.domElement);

    /* ── 3. Scene / Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock  = new THREE.Clock();

    /* ── 4. GLSL Shaders ── */
    const vertexShader = /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = /* glsl */`
        precision highp float;

        uniform vec2  iResolution;
        uniform float iTime;
        uniform vec2  iMouse;

        void main() {
            /* Normalised, aspect-corrected UV — origin at canvas centre */
            vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
            vec2 mouse = (iMouse          - 0.5 * iResolution.xy) / iResolution.y;

            float t = iTime * 0.18;
            float mouseDist = length(uv - mouse);

            /* ── WARP: sinusoidal ripple driven by cursor proximity ── */
            float warpMag = sin(mouseDist * 20.0 - t * 5.0) * 0.07;
            warpMag *= smoothstep(0.55, 0.0, mouseDist);   /* fade warp at edges */
            uv += (uv - mouse) * warpMag;                  /* radial push/pull   */

            /* ── GRID: classic sharp-line technique ── */
            float gridScale = 11.0;
            vec2 gUv = fract(uv * gridScale) - 0.5;        /* -0.5..0.5 per cell */
            float lineX = pow(1.0 - abs(gUv.x), 50.0);
            float lineY = pow(1.0 - abs(gUv.y), 50.0);
            float line  = max(lineX, lineY);

            /* Subtle breathing so the grid feels alive without the cursor */
            float breathe = 0.82 + sin(t * 2.8) * 0.09;

            /* ── COLORS ── */
            vec3 bgColor   = vec3(0.961, 0.973, 1.000);    /* #f5f8ff off-white   */
            vec3 gridColor = vec3(0.878, 0.906, 1.000);    /* light indigo-100    */
            vec3 accentA   = vec3(0.000, 0.420, 0.920);    /* deep interactive blue */
            vec3 accentB   = vec3(0.500, 0.380, 0.960);    /* indigo pulse        */

            /* Base: background + grid lines */
            vec3 color = mix(bgColor, gridColor, line * breathe);

            /* ── CURSOR GLOW ── */
            float glow = smoothstep(0.28, 0.0, mouseDist);
            /* Soft white shimmer */
            color += vec3(1.0) * glow * 0.22;
            /* Blue tint at cursor */
            color  = mix(color, accentA, glow * 0.18);
            /* Indigo halo just outside the cursor */
            float halo = smoothstep(0.32, 0.10, mouseDist) * (1.0 - smoothstep(0.10, 0.0, mouseDist));
            color  = mix(color, accentB, halo * 0.10);

            /* ── VIGNETTE: very subtle dark edges to draw eye inward ── */
            float vig = 1.0 - smoothstep(0.5, 1.2, length(uv));
            color = mix(color * 0.88, color, vig);

            gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        }
    `;

    /* ── 5. Uniforms ── */
    const uniforms = {
        iTime:       { value: 0.0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        iMouse:      { value: new THREE.Vector2(-9999, -9999) }   /* offscreen default */
    };

    /* ── 6. Mesh ── */
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    /* ── 7. Resize handler ── */
    function onResize() {
        const w = container.offsetWidth  || window.innerWidth;
        const h = container.offsetHeight || window.innerHeight;
        renderer.setSize(w, h);
        uniforms.iResolution.value.set(w, h);
    }

    /* ── 8. Mouse / Touch handlers ── */
    function setMouse(clientX, clientY) {
        const rect = container.getBoundingClientRect();
        /* Three.js convention: Y=0 at bottom */
        uniforms.iMouse.value.set(
            clientX - rect.left,
            rect.height - (clientY - rect.top)
        );
    }

    function onMouseMove(e)  { setMouse(e.clientX, e.clientY); }
    function onTouchMove(e)  {
        if (e.touches.length > 0) {
            setMouse(e.touches[0].clientX, e.touches[0].clientY);
        }
    }
    /* Reset to offscreen when cursor leaves the hero */
    function onMouseLeave() {
        uniforms.iMouse.value.set(-9999, -9999);
    }

    /* ── 9. Attach events ── */
    window.addEventListener('resize', onResize, { passive: true });

    /* Listen on the section (contact-hero) for better coverage */
    const heroSection = container.closest('.contact-hero') || document.documentElement;
    heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
    heroSection.addEventListener('touchmove', onTouchMove, { passive: true });
    heroSection.addEventListener('mouseleave', onMouseLeave, { passive: true });

    /* Initial size */
    onResize();

    /* ── 10. Animation loop ── */
    renderer.setAnimationLoop(function () {
        uniforms.iTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    });

    /* ── 11. Cleanup on page unload (good practice) ── */
    window.addEventListener('pagehide', function cleanup() {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        material.dispose();
        geometry.dispose();
    }, { once: true });

})();
