/* =====================================================
   WIN AGENCY — HOME.JS
   Three.js Orb + GLSL Liquid Canvas + WebGL Hero
   ===================================================== */
'use strict';

// ── THREE.JS FLOATING ORB ────────────────────────────
(function initThreeOrb() {
  if (typeof THREE === 'undefined') return;

  const container = document.getElementById('heroOrb');
  if (!container) return;

  // Use offsetWidth/offsetHeight as fallback for mobile where clientWidth may be 0
  // (previously the orb was hidden on mobile, so clientWidth returned 0)
  const isMobile = window.innerWidth <= 900;
  const W = container.clientWidth || container.offsetWidth || (isMobile ? Math.round(window.innerWidth * 0.8) : 440);
  const H = container.clientHeight || container.offsetHeight || (isMobile ? Math.round(window.innerWidth * 0.8) : 440);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 3.5;

  // Geometry — icosahedron for gem-like look
  const geo = new THREE.IcosahedronGeometry(1.2, 6);

  // Custom shader material — iridescent glass
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(W, H) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vPosition;

      void main(){
        vNormal   = normalize(normalMatrix * normal);
        vec4 mv   = modelViewMatrix * vec4(position, 1.0);
        vViewDir  = normalize(-mv.xyz);
        vPosition = position;

        // Vertex wave deformation
        float disp = sin(position.x * 3.0 + uTime) * 0.04
                   + sin(position.y * 4.0 + uTime * 1.3) * 0.03;
        vec3 newPos = position + normal * disp;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vPosition;

      vec3 palette(float t){
        // Iridescent blue-violet-white
        vec3 a = vec3(0.60, 0.70, 1.00);
        vec3 b = vec3(0.35, 0.30, 0.50);
        vec3 c = vec3(1.00, 1.00, 1.00);
        vec3 d = vec3(0.10, 0.20, 0.45);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main(){
        float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
        float t = dot(vNormal, vec3(0.577)) * 0.5 + 0.5;
        t += uTime * 0.12;
        vec3 col = palette(t);

        // Frosted-glass white sheen
        vec3 result = mix(col, vec3(1.0), fresnel * 0.65);

        // Add soft caustic shimmer
        float shimmer = sin(vPosition.x * 8.0 + uTime) * sin(vPosition.y * 6.0 + uTime * 0.8) * 0.08;
        result += shimmer;

        gl_FragColor = vec4(result, 0.72 + fresnel * 0.25);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Ambient light for environment sheen
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0x8B9FFF, 1.2);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;
    mesh.rotation.x = mouseY * 0.3 + Math.sin(t * 0.4) * 0.15;
    mesh.rotation.y = mouseX * 0.3 + t * 0.2;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    const W2 = container.clientWidth;
    const H2 = container.clientHeight;
    renderer.setSize(W2, H2);
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    mat.uniforms.uResolution.value.set(W2, H2);
  });
})();

// ── GLSL LIQUID / WATER DROPLET CANVAS ───────────────
(function initLiquidCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Full-screen quad
  const vs = `
    attribute vec2 a_position;
    void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const fs = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_resolution;
    uniform vec2  u_mouse;

    float circle(vec2 uv, vec2 center, float r, float soft){
      return 1.0 - smoothstep(r - soft, r + soft, length(uv - center));
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution;
      uv.y = 1.0 - uv.y;

      // Soft gradient background blobs
      float blob1 = circle(uv, vec2(0.15, 0.2), 0.28, 0.15);
      float blob2 = circle(uv, vec2(0.85, 0.75), 0.22, 0.12);
      float blob3 = circle(uv, vec2(0.5, 0.5), 0.18, 0.1);

      vec3 c1 = vec3(0.80, 0.83, 1.0);  // soft ice blue
      vec3 c2 = vec3(0.91, 0.88, 1.0);  // lavender
      vec3 base = vec3(1.0);

      vec3 col = mix(base, c1, blob1 * 0.35);
      col      = mix(col,  c2, blob2 * 0.28);
      col      = mix(col,  c1, blob3 * 0.2);

      // Animated cursor glow — water droplet refraction
      vec2 mouse = u_mouse / u_resolution;
      mouse.y = 1.0 - mouse.y;
      float dist = length(uv - mouse);
      float dropRipple = sin(dist * 60.0 - u_time * 5.0) * exp(-dist * 8.0) * 0.03;
      float dropGlow   = circle(uv, mouse, 0.06, 0.04) * 0.15;
      col += dropRipple;
      col += vec3(0.7, 0.75, 1.0) * dropGlow;

      // Subtle animated noise
      float n = sin(uv.x * 40.0 + u_time) * sin(uv.y * 35.0 + u_time * 0.7) * 0.008;
      col += n;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const start = performance.now();
  (function loop() {
    requestAnimationFrame(loop);
    const t = (performance.now() - start) / 1000;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  })();
})();

// ── HORIZONTAL SCROLL PROCESS — GSAP Pin + Scrub ──────
(function initProcessHorizontal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById('processSection');
  const track = document.getElementById('processTrack');
  if (!section || !track) return;

  const progressFill = document.getElementById('processProgressFill');
  const stepDots = document.querySelectorAll('.step-dot');
  const dragHint = document.getElementById('processDragHint');
  let hintFaded = false;

  /* ── Compute how far the track must slide left ──────────────────
     trackWidth = total scrollWidth of the track
     We subtract one viewport width so the last card ends at the right edge,
     then also subtract the track's left padding so card-1 starts correctly. */
  function getScrollAmount() {
    const trackW = track.scrollWidth;
    const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    /* Negative = move left */
    return -(trackW - window.innerWidth + padLeft);
  }

  /* ── Update progress bar + active step dot ── */
  function onProgress(self) {
    const p = self.progress; // 0 → 1

    /* Progress bar */
    if (progressFill) {
      progressFill.style.width = (p * 100).toFixed(2) + '%';
    }

    /* Step dots — which quarter of the scroll are we in? */
    const cards = track.querySelectorAll('.process-card');
    const total = cards.length;
    const activeI = Math.min(Math.floor(p * total), total - 1);

    stepDots.forEach((dot, i) => {
      dot.classList.toggle('step-dot--active', i === activeI);
    });

    /* Fade out drag hint on first movement */
    if (!hintFaded && p > 0.02 && dragHint) {
      dragHint.classList.add('hidden');
      hintFaded = true;
    }
  }

  /* ── Build the tween ── */
  const tween = gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
  });

  /* ── ScrollTrigger: pin section and scrub tween to scroll ── */
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    /* end = total horizontal distance to cover, expressed as extra vertical scroll */
    end: () => `+=${Math.abs(getScrollAmount())}`,
    pin: true,
    pinSpacing: true,   /* reserves extra page height for the horizontal travel */
    animation: tween,
    scrub: 1,      /* 1-second lag = cinematic smoothness */
    invalidateOnRefresh: true,  /* recalculate on resize / orientation change */
    onUpdate: onProgress,
  });

  /* ── Header section entrance — fade-up before pin activates ── */
  const header = document.querySelector('.process-header-wrap');
  if (header) {
    gsap.fromTo(header,
      { y: 36, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      }
    );
  }

  /* ── Cards entrance: each glides in from the right as the track moves ── */
  const cards = gsap.utils.toArray('.process-card');
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, x: 60 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      }
    );
  });
})();



