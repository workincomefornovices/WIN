/* =====================================================
   WIN AGENCY — WIN-LOGO.JS  (v4 — GLB Auto-Rotate)
   ─────────────────────────────────────────────────────
   • Loads  logo.glb  via THREE.GLTFLoader
   • Resilient path resolution: tries root, assets/,
     and "New folder/" automatically
   • Clean continuous auto-rotate animation
   • Lighting tuned for BLACK HIGH-GLOSS geometry on
     a white/light background (premium lacquer look)
   ===================================================== */
'use strict';

(function initWINLogo() {

    /* ── Wait until THREE is available ── */
    if (typeof THREE === 'undefined') {
        setTimeout(initWINLogo, 80);
        return;
    }

    /* ── Find all logo mount points ── */
    const mounts = document.querySelectorAll('.win-logo-mount');
    if (!mounts.length) return;

    /* ── Resolve the project root from the script tag ── */
    const ROOT = (function () {
        try {
            const tags = document.querySelectorAll('script[src*="win-logo"]');
            if (tags.length) {
                return tags[tags.length - 1].src.replace(/\/js\/win-logo\.js.*$/, '');
            }
        } catch (_) { /* ignore */ }
        return '';
    })();

    /* ── Candidate paths to try in order ──────────────────────────
       1. /assets/logo.glb    (canonical — matches project spec)
       2. /logo.glb           (project root fallback)
       3. /New folder/logo.glb (original upload location)
    ────────────────────────────────────────────────────────────── */
    const GLB_CANDIDATES = [
        ROOT + '/assets/logo.glb',
        ROOT + '/logo.glb',
        ROOT + '/New%20folder/logo.glb',
        ROOT + '/New folder/logo.glb'
    ];

    /* ── Singleton GLTFLoader (shared across all mounts) ── */
    let _loader = null;
    function getLoader() {
        if (_loader) return _loader;
        if (typeof THREE.GLTFLoader !== 'undefined') {
            _loader = new THREE.GLTFLoader();
            return _loader;
        }
        console.warn(
            '[WIN Logo] THREE.GLTFLoader not found.\n' +
            'Add the following BEFORE win-logo.js:\n' +
            '<script src="https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js"></script>'
        );
        return null;
    }

    /* ─────────────────────────────────────────────────────
       BUILD — one independent Three.js scene per mount
    ───────────────────────────────────────────────────── */
    mounts.forEach(buildLogo);

    function buildLogo(mount) {

        /* Physical size of the mount element (CSS-driven) */
        const W = mount.clientWidth || mount.offsetWidth || 120;
        const H = mount.clientHeight || mount.offsetHeight || 48;

        /* ── WebGL Renderer ─────────────────────────────── */
        const renderer = new THREE.WebGLRenderer({
            alpha: true,   // transparent background
            antialias: true,
        });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);          // fully transparent bg
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;           // boost for dark material
        renderer.shadowMap.enabled = false;
        mount.appendChild(renderer.domElement);

        /* ── Scene ─────────────────────────────────────── */
        const scene = new THREE.Scene();

        /* ── Camera ─────────────────────────────────────
           Narrow FOV (32°) gives a flatter, more logo-like
           perspective. Adjusted Z is computed after load.  */
        const cam = new THREE.PerspectiveCamera(32, W / H, 0.01, 200);
        cam.position.set(0, 0, 5);

        /* ══════════════════════════════════════════════════
           LIGHTING RIG — tuned for BLACK HIGH-GLOSS plastic
           ══════════════════════════════════════════════════
           A dark glossy surface shows colour only through
           specular highlights and reflections.
           Strategy:
             •  Strong WHITE key from top-front  → crisp bright highlight
             •  Softer fill from bottom-left     → secondary specular
             •  Cool backlight from behind-right → halo rim separation
             •  Warm accent from top-left        → face warmth
             •  Low ambient                      → keep blacks deep
        ══════════════════════════════════════════════════ */

        // KEY — dominant bright, slightly top-right-front
        // Makes the flat front faces of each letter gleam white
        const keyLight = new THREE.DirectionalLight(0xFFFFFF, 4.5);
        keyLight.position.set(2, 4, 6);
        scene.add(keyLight);

        // FILL — softer, from lower-left — secondary specular on bevel
        const fillLight = new THREE.DirectionalLight(0xEEF0FF, 1.8);
        fillLight.position.set(-4, -1, 4);
        scene.add(fillLight);

        // RIM — blue-cool from back-right — separates logo from bg
        const rimLight = new THREE.DirectionalLight(0xAABBDD, 2.2);
        rimLight.position.set(3, 1, -6);
        scene.add(rimLight);

        // KICKER — warm from top-left — subtle warmth on W's left face
        const kickerLight = new THREE.DirectionalLight(0xFFF4E0, 1.2);
        kickerLight.position.set(-3, 5, 2);
        scene.add(kickerLight);

        // AMBIENT — kept very low so the blacks stay rich and deep
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.25);
        scene.add(ambient);

        /* ── Environment map — PMREM RoomEnvironment
           Provides the mirror-like reflections on the gloss surface.
           If RoomEnvironment isn't in the r134 build it silently skips. */
        try {
            const pmrem = new THREE.PMREMGenerator(renderer);
            pmrem.compileEquirectangularShader();
            const roomEnv = new THREE.RoomEnvironment();
            const envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
            scene.environment = envTexture;           // metalness reflections
            roomEnv.dispose();
            pmrem.dispose();
        } catch (_) { /* gracefully ignore */ }

        /* ── Animation state ─────────────────────────── */
        const clock = new THREE.Clock();
        let wordmark = null;   // populated by GLTFLoader callback
        let animId = null;
        let isVisible = !document.hidden;

        /* ── Render / animation loop ─────────────────── */
        function animate() {
            animId = requestAnimationFrame(animate);
            if (!isVisible) return;

            const t = clock.getElapsedTime();

            if (wordmark) {
                /* ── Continuous auto-rotate (slow Y-axis spin) ── */
                wordmark.rotation.y = t * 0.5;           // full 360° every ~12.6 s

                /* Subtle gentle tilt on X adds depth without distraction */
                wordmark.rotation.x = Math.sin(t * 0.3) * 0.08;  // ± ~4.6° tilt

                /* Gentle vertical float keeps it feeling alive */
                wordmark.position.y = Math.sin(t * 0.85) * 0.035;
            }

            renderer.render(scene, cam);
        }
        animate();

        /* ── Load logo.glb — tries multiple candidate paths ──── */
        const loader = getLoader();
        if (!loader) {
            renderTextFallback(renderer, scene, cam);
            return;
        }

        /* Attempt the candidates array in order; if one 404s, try the next */
        let candidateIndex = 0;

        function tryLoadGLB() {
            if (candidateIndex >= GLB_CANDIDATES.length) {
                console.error('[WIN Logo] All logo.glb paths failed. Paths tried:', GLB_CANDIDATES);
                renderTextFallback(renderer, scene, cam);
                return;
            }
            const path = GLB_CANDIDATES[candidateIndex++];

            loader.load(
                path,

                /* ── onLoad ── */
                function (gltf) {
                    console.log('[WIN Logo] Loaded from:', path);
                    wordmark = gltf.scene;

                    /* Auto-centre: move model so bounding-box centre = world origin */
                    const box = new THREE.Box3().setFromObject(wordmark);
                    const size = new THREE.Vector3();
                    const centre = new THREE.Vector3();
                    box.getSize(size);
                    box.getCenter(centre);
                    wordmark.position.sub(centre);   // centre on origin

                    /* Scale to fit: target the wider axis (X for "WIN" wordmark)
                       to ~2.0 world units. Adjust targetSize if logo clips or tiny. */
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const targetSize = 2.0;                    // world-unit width target
                    const scaleFac = targetSize / maxDim;
                    wordmark.scale.setScalar(scaleFac);

                    /* ── Override / enhance GLB materials ──────────────────────────
                       • Keep the original colour from the GLB
                       • Force metalness + roughness to maximise gloss reflections
                       • Boost envMapIntensity so the RoomEnvironment shows
                       ─────────────────────────────────────────────────────────── */
                    wordmark.traverse(function (node) {
                        if (!node.isMesh) return;
                        node.castShadow = false;
                        node.receiveShadow = false;

                        const mat = node.material;
                        if (!mat) return;

                        if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                            mat.metalness = 0.60;
                            mat.roughness = 0.05;
                            mat.envMapIntensity = 2.5;
                            if (mat.isMeshPhysicalMaterial) {
                                mat.clearcoat = 1.0;
                                mat.clearcoatRoughness = 0.04;
                                mat.reflectivity = 1.0;
                            }
                            mat.needsUpdate = true;

                        } else if (mat.isMeshBasicMaterial) {
                            const oldColor = mat.color ? mat.color.clone() : new THREE.Color(0x0d0d0d);
                            node.material = new THREE.MeshStandardMaterial({
                                color: oldColor,
                                metalness: 0.60,
                                roughness: 0.05,
                                envMapIntensity: 2.5,
                            });
                            node.material.needsUpdate = true;
                        }
                    });

                    scene.add(wordmark);

                    /* ── Set camera Z for tight, unclipped framing ──────────────── */
                    const scaledH = size.y * scaleFac;
                    const fovRad = (cam.fov * Math.PI) / 180;
                    const fitDist = (scaledH / 2) / Math.tan(fovRad / 2);
                    cam.position.z = fitDist * 1.30;   // 30% breathing room
                    cam.updateProjectionMatrix();
                },

                /* onProgress — intentionally unused */
                undefined,

                /* ── onError — try next candidate ── */
                function (err) {
                    console.warn('[WIN Logo] Could not load from:', path, '— trying next...');
                    tryLoadGLB(); // recurse to next candidate
                }
            );
        }

        tryLoadGLB();

        /* ── Resize handler ─────────────────────────── */
        function onResize() {
            const nW = mount.clientWidth || 120;
            const nH = mount.clientHeight || 48;
            renderer.setSize(nW, nH);
            cam.aspect = nW / nH;
            cam.updateProjectionMatrix();
        }
        window.addEventListener('resize', onResize);

        /* ── Pause when tab is not visible (battery / perf) ── */
        function onVisibility() {
            isVisible = !document.hidden;
            if (isVisible) clock.getDelta(); // discard accumulated delta
        }
        document.addEventListener('visibilitychange', onVisibility);

        /* ── Cleanup (SPA hot-unload support) ─────── */
        mount._winLogoCleanup = function () {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibility);
            renderer.dispose();
        };
    }

    /* ─────────────────────────────────────────────────────
       FALLBACK — canvas "WIN" text rendered as a mesh
       Displayed only if logo.glb fails to load.
    ───────────────────────────────────────────────────── */
    function renderTextFallback(renderer, scene, cam) {
        const W = renderer.domElement.width;
        const H = renderer.domElement.height;

        const c = document.createElement('canvas');
        c.width = W * 2;
        c.height = H * 2;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#0d0d0d';
        ctx.font = `900 ${Math.round(H * 1.3)}px "Inter","Montserrat",sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WIN', c.width / 2, c.height / 2);

        const tex = new THREE.CanvasTexture(c);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const ratio = c.width / c.height;
        const geo = new THREE.PlaneGeometry(ratio * 1.8, 1.8);
        scene.add(new THREE.Mesh(geo, mat));
    }

})();
