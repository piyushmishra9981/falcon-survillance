/* ============================================================
   FALCON SURVEILLANCE - UTILITIES & SMOOTH SCROLL
   General utility functions and smooth scrolling
   ============================================================ */

class SmoothScroller {
  constructor() {
    this.setupSmoothScroll();
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        const target = document.querySelector(href);

        if (target && href !== '#') {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }
}

// Initialize utilities when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SmoothScroller();
  });
} else {
  new SmoothScroller();
}
