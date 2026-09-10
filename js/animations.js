/* ============================================================
   FALCON SURVEILLANCE - ANIMATIONS & SCROLL REVEAL
   Smooth scroll animations and interactive effects
   ============================================================ */

class AnimationController {
  constructor() {
    this.revealElements = document.querySelectorAll('[data-reveal]');
    this.counterElements = document.querySelectorAll('[data-counter]');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    this.hasAnimated = new Set();
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupCounterAnimation();
  }

  /**
   * Setup scroll reveal animations
   */
  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
          this.revealElement(entry.target);
          this.hasAnimated.add(entry.target);
        }
      });
    }, this.observerOptions);

    this.revealElements.forEach((element) => {
      observer.observe(element);
    });
  }

  /**
   * Reveal element with animation
   */
  revealElement(element) {
    const revealType = element.getAttribute('data-reveal') || 'up';
    const rawDelay = element.getAttribute('data-reveal-delay') || '0';
    let delay = 0;

    if (/^\d+(\.\d+)?s$/.test(rawDelay)) {
      delay = parseFloat(rawDelay) * 1000;
    } else if (/^\d+(\.\d+)?ms$/.test(rawDelay)) {
      delay = parseFloat(rawDelay);
    } else {
      delay = parseFloat(rawDelay) || 0;
    }

    element.style.setProperty('--reveal-delay', `${delay}ms`);

    switch (revealType) {
      case 'fade':
      case 'down':
      case 'left':
      case 'right':
      case 'up':
      case 'scale':
      case 'bounce':
      default:
        element.classList.add('animate-fade-in');
    }
  }

  /**
   * Setup counter animations
   */
  setupCounterAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    this.counterElements.forEach((element) => {
      observer.observe(element);
    });
  }

  /**
   * Animate counter from 0 to target number
   */
  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'), 10);
    const duration = parseInt(element.getAttribute('data-counter-duration')) || 2000;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(counter);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, stepDuration);
  }
}

/**
 * Initialize animations on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AnimationController();
  });
} else {
  new AnimationController();
}

/* ========== SMOOTH SCROLL OPTIMIZATION ========== */

document.addEventListener('click', (e) => {
  const target = e.target.closest('a[href^="#"]');
  if (!target) return;

  const href = target.getAttribute('href');
  if (href === '#') return;

  const section = document.querySelector(href);
  if (!section) return;

  e.preventDefault();
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ========== PAGE LOAD ANIMATIONS ========== */

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

/* FAQ accordion initialization removed — use js/faq.js for a single authoritative implementation */

/* ========== CONTACT FORM HANDLING ========== */

const initContactForms = () => {
  document.querySelectorAll('.contact-form').forEach((form) => {
    if (form.dataset.formEnhanced === 'true') return;
    form.dataset.formEnhanced = 'true';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const fields = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      // Sanitizer to prevent XSS / HTML injection
      const sanitizeInput = (val) => {
        return (val || '').replace(/<[^>]*>/g, '').trim();
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      fields.forEach((field) => {
        const val = sanitizeInput(field.value);
        let fieldValid = true;

        if (field.hasAttribute('required') && !val) {
          fieldValid = false;
        } else if (field.type === 'email' && val && !emailRegex.test(val)) {
          fieldValid = false;
        }

        if (!fieldValid) {
          isValid = false;
          field.style.borderColor = 'var(--color-error)';
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.style.borderColor = '';
          field.setAttribute('aria-invalid', 'false');
        }
      });

      const status = form.querySelector('.contact-form-status');
      if (!isValid) {
        if (status) {
          status.textContent = 'Please complete all fields with valid information.';
        }
        return;
      }

      const nameValue = sanitizeInput(form.querySelector('[name="name"]').value);
      const phoneValue = sanitizeInput(form.querySelector('[name="phone"]').value);
      const emailValue = sanitizeInput(form.querySelector('[name="email"]').value);
      const serviceValue = sanitizeInput(form.querySelector('[name="service"]').value);
      const messageValue = sanitizeInput(form.querySelector('[name="message"]').value);

      const smsBody = [
        'Falcon Surveillance',
        '',
        'New Callback Request',
        '',
        `Name: ${nameValue}`,
        `Phone: ${phoneValue}`,
        `Email: ${emailValue}`,
        `Service: ${serviceValue}`,
        `Requirement: ${messageValue}`,
        'Source: Falcon Surveillance Website'
      ].join('\n');

      const smsUrl = `sms:+917049345854?body=${encodeURIComponent(smsBody)}`;
      if (status) {
        status.textContent = 'Opening SMS app. Please send your request from there.';
      }

      const button = form.querySelector('button[type="submit"]');
      if (button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Opening SMS...';
        button.classList.add('is-success');

        window.location.href = smsUrl;

        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
          button.classList.remove('is-success');
          form.reset();
          if (status) {
            status.textContent = '';
          }
        }, 2500);
      }
    });
  });
};

const initServiceCards = () => {
  document.querySelectorAll('.service-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => {
      if (event.target.closest('.btn-secondary')) {
        return;
      }
      const learnMoreBtn = card.querySelector('.btn-primary');
      if (learnMoreBtn) {
        window.location.href = learnMoreBtn.getAttribute('href');
      }
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initContactForms();
    initServiceCards();
  });
} else {
  initContactForms();
  initServiceCards();
}

