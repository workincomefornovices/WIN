/**
 * footer-loader.js — WIN "Masterpiece" Footer Injector (v3)
 * ──────────────────────────────────────────────────────────
 * • Removes old footer and injects the redesigned white-theme footer
 * • Cityscape: 3 independent parallax SVG layers (BG → Mid → FG)
 *   – Each layer duplicated for seamless infinite loop
 *   – Animation: LEFT → RIGHT (translateX 0 → -50%)
 *   – Heights scaled down to 80–110px max
 * • All original text content preserved
 * • Pure CSS animations — no JS animation loops
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ── CITYSCAPE SVG HELPERS ─────────────────────────────────
     Each function returns an SVG string representing one "panel"
     of buildings for a given layer. Panels are duplicated to form
     a seamless left→right scroll loop.
  ───────────────────────────────────────────────────────────── */

  /** Background layer — tallest silhouettes, lightest tone, viewBox 100px tall */
  function svgBg() {
    return `<svg class="city-panel" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 100" width="1600" height="100"
      preserveAspectRatio="xMinYMax meet">
      <!-- BG skyline: sparse tall towers -->
      <rect x="0"    y="30"  width="55"  height="70"  fill="#d8dbe8"/>
      <rect x="10"   y="10"  width="12"  height="20"  fill="#cdd0e0"/>
      <rect x="60"   y="42"  width="80"  height="58"  fill="#dce0ed"/>
      <rect x="90"   y="18"  width="22"  height="24"  fill="#c8ccdc"/>
      <rect x="92"   y="10"  width="6"   height="9"   fill="#b8bcd0"/>
      <rect x="145"  y="35"  width="60"  height="65"  fill="#d4d8e8"/>
      <rect x="210"  y="20"  width="45"  height="80"  fill="#ccd0e2"/>
      <rect x="215"  y="5"   width="14"  height="15"  fill="#c0c4d6"/>
      <rect x="260"  y="48"  width="55"  height="52"  fill="#dde1ee"/>
      <rect x="320"  y="30"  width="38"  height="70"  fill="#d2d6e6"/>
      <rect x="365"  y="52"  width="65"  height="48"  fill="#dce0ec"/>
      <rect x="435"  y="25"  width="48"  height="75"  fill="#c9cde0"/>
      <rect x="440"  y="8"   width="10"  height="18"  fill="#bfc3d4"/>
      <rect x="488"  y="40"  width="70"  height="60"  fill="#d6daeb"/>
      <rect x="563"  y="22"  width="52"  height="78"  fill="#cdd1e3"/>
      <rect x="620"  y="50"  width="58"  height="50"  fill="#dde0ed"/>
      <rect x="683"  y="28"  width="42"  height="72"  fill="#d0d4e5"/>
      <rect x="730"  y="15"  width="60"  height="85"  fill="#c8ccde"/>
      <rect x="734"  y="2"   width="12"  height="14"  fill="#b8bcd0"/>
      <rect x="795"  y="45"  width="55"  height="55"  fill="#dce0ec"/>
      <rect x="855"  y="32"  width="44"  height="68"  fill="#d4d8ea"/>
      <rect x="904"  y="48"  width="68"  height="52"  fill="#dde1ee"/>
      <rect x="977"  y="20"  width="50"  height="80"  fill="#ccd0e2"/>
      <rect x="982"  y="5"   width="12"  height="15"  fill="#c0c4d5"/>
      <rect x="1032" y="42"  width="62"  height="58"  fill="#d6daea"/>
      <rect x="1099" y="28"  width="46"  height="72"  fill="#cfd3e4"/>
      <rect x="1150" y="52"  width="58"  height="48"  fill="#dde0ed"/>
      <rect x="1213" y="18"  width="55"  height="82"  fill="#cacee0"/>
      <rect x="1218" y="4"   width="14"  height="15"  fill="#bdc1d3"/>
      <rect x="1273" y="40"  width="65"  height="60"  fill="#d5d9ea"/>
      <rect x="1343" y="30"  width="42"  height="70"  fill="#d0d4e5"/>
      <rect x="1390" y="50"  width="58"  height="50"  fill="#dce0ec"/>
      <rect x="1453" y="22"  width="50"  height="78"  fill="#c8ccde"/>
      <rect x="1508" y="38"  width="58"  height="62"  fill="#d4d8ea"/>
      <rect x="1570" y="12"  width="30"  height="88"  fill="#ccd0e2"/>
    </svg>`;
  }

  /** Mid layer — medium height buildings, mid tone */
  function svgMid() {
    return `<svg class="city-panel" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 100" width="1600" height="100"
      preserveAspectRatio="xMinYMax meet">
      <!-- MID skyline -->
      <rect x="0"    y="48"  width="70"  height="52"  fill="#caccdc"/>
      <rect x="8"    y="30"  width="28"  height="18"  fill="#c0c4d5"/>
      <rect x="75"   y="38"  width="52"  height="62"  fill="#c8cce0"/>
      <rect x="132"  y="55"  width="62"  height="45"  fill="#d0d3e5"/>
      <rect x="199"  y="32"  width="44"  height="68"  fill="#c4c8dc"/>
      <rect x="204"  y="15"  width="16"  height="18"  fill="#b8bcce"/>
      <rect x="248"  y="50"  width="55"  height="50"  fill="#cdd1e3"/>
      <rect x="308"  y="28"  width="70"  height="72"  fill="#c5c9da"/>
      <rect x="340"  y="10"  width="16"  height="18"  fill="#b5b9cb"/>
      <rect x="343"  y="3"   width="6"   height="8"   fill="#a8adbe"/>
      <rect x="383"  y="52"  width="50"  height="48"  fill="#cdd0e2"/>
      <rect x="438"  y="36"  width="48"  height="64"  fill="#c2c6d8"/>
      <rect x="491"  y="54"  width="58"  height="46"  fill="#cfd2e4"/>
      <rect x="554"  y="22"  width="55"  height="78"  fill="#c0c4d5"/>
      <rect x="558"  y="6"   width="14"  height="17"  fill="#b4b8ca"/>
      <rect x="614"  y="44"  width="65"  height="56"  fill="#caced0"/>
      <rect x="684"  y="30"  width="46"  height="70"  fill="#c4c8da"/>
      <rect x="735"  y="52"  width="56"  height="48"  fill="#cdd0e1"/>
      <rect x="796"  y="18"  width="60"  height="82"  fill="#bcc0d2"/>
      <rect x="800"  y="3"   width="16"  height="16"  fill="#b0b4c6"/>
      <rect x="861"  y="48"  width="52"  height="52"  fill="#cacde0"/>
      <rect x="918"  y="28"  width="45"  height="72"  fill="#c2c6d8"/>
      <rect x="968"  y="50"  width="62"  height="50"  fill="#cdd0e2"/>
      <rect x="1035" y="20"  width="55"  height="80"  fill="#c0c4d5"/>
      <rect x="1040" y="5"   width="14"  height="15"  fill="#b3b7c9"/>
      <rect x="1095" y="44"  width="64"  height="56"  fill="#c8cce0"/>
      <rect x="1164" y="32"  width="48"  height="68"  fill="#c3c7da"/>
      <rect x="1217" y="50"  width="56"  height="50"  fill="#ccd0e3"/>
      <rect x="1278" y="16"  width="58"  height="84"  fill="#bcc0d3"/>
      <rect x="1282" y="2"   width="14"  height="14"  fill="#b0b4c5"/>
      <rect x="1341" y="46"  width="54"  height="54"  fill="#c9cde0"/>
      <rect x="1400" y="28"  width="46"  height="72"  fill="#c2c6d8"/>
      <rect x="1451" y="52"  width="60"  height="48"  fill="#cdd1e3"/>
      <rect x="1516" y="20"  width="50"  height="80"  fill="#bfc3d5"/>
      <rect x="1570" y="40"  width="30"  height="60"  fill="#c8cce0"/>
    </svg>`;
  }

  /** Foreground layer — shortest, densest, darkest tone */
  function svgFg() {
    return `<svg class="city-panel" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 100" width="1600" height="100"
      preserveAspectRatio="xMinYMax meet">
      <!-- FG skyline: low dense buildings -->
      <rect x="0"    y="65"  width="52"  height="35"  fill="#b8bccf"/>
      <rect x="4"    y="52"  width="22"  height="13"  fill="#b0b4c6"/>
      <rect x="56"   y="60"  width="68"  height="40"  fill="#bdc1d3"/>
      <rect x="80"   y="48"  width="20"  height="12"  fill="#b5b9cb"/>
      <rect x="128"  y="70"  width="44"  height="30"  fill="#c2c6d8"/>
      <rect x="177"  y="55"  width="56"  height="45"  fill="#b8bcd0"/>
      <rect x="182"  y="42"  width="18"  height="13"  fill="#adb1c3"/>
      <rect x="237"  y="68"  width="50"  height="32"  fill="#bfc3d5"/>
      <rect x="292"  y="52"  width="64"  height="48"  fill="#b5b9cb"/>
      <rect x="310"  y="40"  width="16"  height="12"  fill="#a9adbf"/>
      <rect x="312"  y="33"  width="6"   height="8"   fill="#9fa3b5"/>
      <rect x="360"  y="66"  width="44"  height="34"  fill="#bfc3d5"/>
      <rect x="409"  y="54"  width="58"  height="46"  fill="#b8bccf"/>
      <rect x="472"  y="70"  width="48"  height="30"  fill="#c0c4d6"/>
      <rect x="525"  y="55"  width="62"  height="45"  fill="#b4b8ca"/>
      <rect x="530"  y="42"  width="16"  height="14"  fill="#a8acbe"/>
      <rect x="592"  y="65"  width="50"  height="35"  fill="#bdc1d3"/>
      <rect x="647"  y="52"  width="48"  height="48"  fill="#b5b9cb"/>
      <rect x="700"  y="68"  width="56"  height="32"  fill="#bfc3d5"/>
      <rect x="761"  y="50"  width="60"  height="50"  fill="#b0b4c6"/>
      <rect x="765"  y="36"  width="16"  height="14"  fill="#a4a8bc"/>
      <rect x="767"  y="28"  width="6"   height="9"   fill="#9a9eb0"/>
      <rect x="826"  y="66"  width="48"  height="34"  fill="#bcc0d2"/>
      <rect x="879"  y="54"  width="55"  height="46"  fill="#b5b9cc"/>
      <rect x="939"  y="68"  width="50"  height="32"  fill="#bfc3d5"/>
      <rect x="994"  y="52"  width="58"  height="48"  fill="#b0b4c6"/>
      <rect x="998"  y="38"  width="14"  height="14"  fill="#a5a9bb"/>
      <rect x="1057" y="64"  width="46"  height="36"  fill="#bcc0d3"/>
      <rect x="1108" y="54"  width="54"  height="46"  fill="#b5b9cc"/>
      <rect x="1167" y="68"  width="52"  height="32"  fill="#bfc3d6"/>
      <rect x="1224" y="50"  width="60"  height="50"  fill="#b0b4c7"/>
      <rect x="1228" y="35"  width="16"  height="15"  fill="#a5a9bb"/>
      <rect x="1289" y="64"  width="48"  height="36"  fill="#bcbfd2"/>
      <rect x="1342" y="52"  width="56"  height="48"  fill="#b4b8ca"/>
      <rect x="1403" y="68"  width="50"  height="32"  fill="#bfc3d5"/>
      <rect x="1458" y="54"  width="58"  height="46"  fill="#b0b4c6"/>
      <rect x="1521" y="64"  width="44"  height="36"  fill="#bcc0d3"/>
      <rect x="1570" y="55"  width="30"  height="45"  fill="#b5b9cc"/>
    </svg>`;
  }

  /* ── FOOTER HTML ───────────────────────────────────────────── */
  const footerHTML = `
<footer class="masterpiece-footer" id="masterpieceFooter" role="contentinfo">

  <!-- ░ CITYSCAPE BACKGROUND ANIMATION — 3 Parallax Layers ░ -->
  <div class="cityscape-container" aria-hidden="true">

    <!-- Layer 1: Background (slowest, lightest) -->
    <div class="city-layer city-layer--bg">
      ${svgBg()}${svgBg()}
    </div>

    <!-- Layer 2: Mid (medium speed) -->
    <div class="city-layer city-layer--mid">
      ${svgMid()}${svgMid()}
    </div>

    <!-- Layer 3: Foreground (fastest, densest) -->
    <div class="city-layer city-layer--fg">
      ${svgFg()}${svgFg()}
    </div>

  </div>

  <!-- ░ FOOTER CONTENT ░ -->
  <div class="mf-content">

    <!-- ── MAIN FOOTER GRID ── -->
    <div class="mf-grid">

      <!-- ── Brand Column ── -->
      <div class="mf-col mf-col--brand">
        <a href="../home/" class="mf-logo" aria-label="WIN — Work Income for Novices" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
          <img src="../src-images/common-images/win-logo.png" alt="WIN Logo" style="height: 48px; width: auto;">
          <img src="../src-images/common-images/win-name.png" alt="WIN Wordmark" style="height: 22px; width: auto;">
        </a>
        <p class="mf-brand__tagline">Work Income for Novices —<br>Your partner in digital growth.</p>
        <div class="mf-social-row" aria-label="Social media links">
          <!-- LinkedIn -->
          <a href="#" class="mf-social" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <!-- Instagram -->
          <a href="#" class="mf-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <!-- X / Twitter -->
          <a href="#" class="mf-social" aria-label="Twitter / X">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <!-- Facebook -->
          <a href="#" class="mf-social" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- ── Navigation Column ── -->
      <div class="mf-col">
        <h4 class="mf-col__heading">Navigation</h4>
        <ul class="mf-nav-list" role="list">
          <li><a href="../home/"        class="mf-nav-link">Home</a></li>
          <li><a href="../about/"        class="mf-nav-link">About Us</a></li>
          <li><a href="../services/"     class="mf-nav-link">Services</a></li>
          <li><a href="../testimonials/" class="mf-nav-link">Testimonials</a></li>
          <li><a href="../contact/"      class="mf-nav-link">Contact</a></li>
        </ul>
      </div>

      <!-- ── Services Column ── -->
      <div class="mf-col">
        <h4 class="mf-col__heading">Services</h4>
        <ul class="mf-nav-list" role="list">
          <li><a href="../services/#webDev"         class="mf-nav-link">Web Development</a></li>
          <li><a href="../services/#marketing"      class="mf-nav-link">Digital Marketing</a></li>
          <li><a href="../services/#graphicDesign"  class="mf-nav-link">Graphic Design</a></li>
          <li><a href="../services/"                class="mf-nav-link">Brand Identity</a></li>
          <li><a href="../services/"                class="mf-nav-link">SEO Strategy</a></li>
        </ul>
      </div>

      <!-- ── Contact Column ── -->
      <div class="mf-col">
        <h4 class="mf-col__heading">Contact</h4>
        <address class="mf-contact-list">
          <!-- Phone -->
          <a href="tel:+917032234827" class="mf-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 10.72 19.79 19.79 0 01.46 4.1 2 2 0 012.44 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.08 6.08l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            +91 70322 34827
          </a>
          <!-- Email -->
          <a href="mailto:contact@workincomefornovices.com" class="mf-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            contact@workincomefornovices.com
          </a>
          <!-- Location -->
          <span class="mf-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            NTR Nagar, Hyderabad, Telangana
          </span>
        </address>
        <a href="../contact/" class="mf-cta-btn" id="mfCtaBtn">Start a Project →</a>
      </div>

    </div><!-- /mf-grid -->

    <!-- ── BOTTOM BAR ── -->
    <div class="mf-bottom-bar">
      <p class="mf-copyright">© 2026 WIN Agency. All rights reserved.</p>
      <p class="mf-legal">
        <a href="../privacy-policy/" class="mf-legal-link">Privacy Policy</a>
        <span aria-hidden="true">·</span>
        <a href="../terms-and-conditions/" class="mf-legal-link">Terms and Conditions</a>
        <span aria-hidden="true">·</span>
        <a href="../refund-policy/" class="mf-legal-link">Refund Policy</a>
      </p>
    </div>

  </div><!-- /mf-content -->

</footer>`;

  /* ── REMOVE OLD FOOTER, INJECT NEW ─────────────────────────── */
  document.querySelectorAll('body > footer, body > main > footer').forEach(el => el.remove());
  document.querySelectorAll('.footer').forEach(function (el) {
    if (el.querySelector('.footer-grid')) el.remove();
  });

  document.body.insertAdjacentHTML('beforeend', footerHTML);

}); // END DOMContentLoaded
