/* =====================================================
   WIN AGENCY — CONTACT.JS
   Hero animations + FAQ accordion + Form validation + Micro-animations
   ===================================================== */
'use strict';

// ── HERO ANIMATIONS (GSAP) ───────────────────────────
(function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    // Kinetic entry: left content children stagger in from the left
    gsap.from('.hero-content-left > *', {
        x: -55,
        opacity: 0,
        duration: 1.2,
        stagger: 0.18,
        ease: 'power4.out',
        clearProps: 'transform,opacity'
    });

    // Orb entrance: scale + fade in from right
    gsap.from('.hero-visual-right', {
        x: 60,
        opacity: 0,
        duration: 1.4,
        delay: 0.3,
        ease: 'power4.out',
        clearProps: 'transform,opacity'
    });

    // Continuous orb float
    gsap.to('.main-glass-orb', {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // Concentric rings subtle pulse
    gsap.to('.orb-ring-outer', {
        scale: 1.04,
        opacity: 0.6,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
    gsap.to('.orb-ring-mid', {
        scale: 1.06,
        opacity: 0.5,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4
    });

    // Floating labels drift up/down with stagger
    gsap.to('.floating-label', {
        y: -10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        stagger: 0.35,
        ease: 'sine.inOut'
    });

    // Particles drift
    gsap.to('.orb-particle', {
        y: -14,
        x: 6,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: 'sine.inOut'
    });
})();

// ── FAQ ACCORDION ────────────────────────────────────
(function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const answerId = btn.getAttribute('aria-controls');
            const answer = document.getElementById(answerId);
            if (!answer) return;

            // Collapse all others
            document.querySelectorAll('.faq-question').forEach(other => {
                if (other === btn) return;
                other.setAttribute('aria-expanded', 'false');
                const otherId = other.getAttribute('aria-controls');
                const otherAns = document.getElementById(otherId);
                if (otherAns) {
                    otherAns.style.maxHeight = '0';
                    otherAns.addEventListener('transitionend', () => {
                        if (!otherAns.closest('.faq-item .faq-question[aria-expanded="true"]')) {
                            otherAns.hidden = true;
                        }
                    }, { once: true });
                }
            });

            if (expanded) {
                btn.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = '0';
                answer.addEventListener('transitionend', () => { answer.hidden = true; }, { once: true });
            } else {
                btn.setAttribute('aria-expanded', 'true');
                answer.hidden = false;
                answer.style.maxHeight = '0';
                answer.style.overflow = 'hidden';
                answer.style.transition = 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
                requestAnimationFrame(() => {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                });
            }
        });
    });
})();

// ── FORM VALIDATION ──────────────────────────────────
(function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const success = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('formSubmitBtn');

    function validate(field, errId, msg) {
        const errEl = document.getElementById(errId);
        if (!field.value.trim()) {
            if (errEl) errEl.textContent = msg;
            field.classList.add('error');
            return false;
        }
        if (errEl) errEl.textContent = '';
        field.classList.remove('error');
        return true;
    }

    function validateEmail(field, errId) {
        const errEl = document.getElementById(errId);
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(field.value.trim())) {
            if (errEl) errEl.textContent = 'Please enter a valid email address.';
            field.classList.add('error');
            return false;
        }
        if (errEl) errEl.textContent = '';
        field.classList.remove('error');
        return true;
    }

    // Live validation
    form.querySelectorAll('.neo-input').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.required && !input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('error') && input.value.trim()) {
                input.classList.remove('error');
                const errId = input.id + 'Err';
                const errEl = document.getElementById(errId);
                if (errEl) errEl.textContent = '';
            }
        });
    });

    // Add error styles
    const style = document.createElement('style');
    style.textContent = `.neo-input.error { border-color: rgba(239,68,68,0.5) !important; box-shadow: var(--neo-shadow-in), 0 0 0 2px rgba(239,68,68,0.2) !important; }`;
    document.head.appendChild(style);

    form.addEventListener('submit', e => {
        e.preventDefault();

        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const service = document.getElementById('service');
        const message = document.getElementById('message');

        let valid = true;
        if (!validate(firstName, 'firstNameErr', 'First name is required.')) valid = false;
        if (!validate(lastName, 'lastNameErr', 'Last name is required.')) valid = false;
        if (!validateEmail(email, 'emailErr')) valid = false;
        if (!validate(service, 'serviceErr', 'Please select a service.')) valid = false;
        if (!validate(message, 'messageErr', 'Please describe your project.')) valid = false;

        if (!valid) return;

        // Simulate send
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-label').textContent = 'Sending...';

        setTimeout(() => {
            submitBtn.style.display = 'none';
            if (success) {
                success.classList.add('show');
                success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            form.reset();
        }, 1500);
    });
})();

// ── CONTACT ITEM ANIMATIONS ──────────────────────────
(function initContactAnim() {
    if (typeof gsap === 'undefined') return;

    // CRITICAL: register ScrollTrigger before any scrollTrigger property is used
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    gsap.utils.toArray('.contact-detail-item').forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, x: -30 },
            {
                opacity: 1, x: 0,
                duration: 0.7,
                ease: 'power3.out',
                delay: i * 0.12,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true
                }
            }
        );
    });

    // Form entrance
    const formCard = document.querySelector('.contact-form');
    if (formCard) {
        gsap.fromTo(formCard,
            { opacity: 0, y: 50, scale: 0.97 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: formCard,
                    start: 'top 85%',
                    once: true
                }
            }
        );
    }

    // FAQ items
    gsap.utils.toArray('.faq-item').forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, y: 25 },
            {
                opacity: 1, y: 0,
                duration: 0.6,
                ease: 'power2.out',
                delay: i * 0.09,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true
                }
            }
        );
    });
})();
