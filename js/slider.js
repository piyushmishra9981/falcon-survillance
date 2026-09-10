/* ============================================================
   FALCON SURVEILLANCE - BRAND LOGO SLIDER
   Infinite auto-scrolling brand carousel
   ============================================================ */

class BrandSlider {
  constructor() {
    this.slider = document.querySelector('[data-brand-slider]');
    this.track = document.querySelector('[data-slider-track]');
    this.items = this.track?.querySelectorAll('.brand-item');

    if (!this.slider || !this.track || !this.items?.length) return;

    this.isMouseOver = false;
    this.init();
  }

  init() {
    // Clone items for infinite scroll
    this.cloneItems();
    this.setupHoverPause();
    this.startAnimation();
  }

  /**
   * Clone items to create infinite scroll effect
   */
  cloneItems() {
    // Clone all items and append to create seamless loop
    this.items.forEach((item) => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
  }

  /**
   * Setup pause on hover
   */
  setupHoverPause() {
    // Only enable hover pause on devices that support hover (desktop)
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.slider.addEventListener('mouseenter', () => {
        this.track.classList.add('paused');
      });

      this.slider.addEventListener('mouseleave', () => {
        this.track.classList.remove('paused');
      });
    }
  }

  /**
   * Start animation
   */
  startAnimation() {
    // Animation is handled by CSS
    // This method can be extended for future interactive features
  }
}

// Initialize brand slider
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BrandSlider();
  });
} else {
  new BrandSlider();
}

/* ========== CAROUSEL TOUCH SUPPORT ========== */

class CarouselTouch {
  constructor() {
    this.sliders = document.querySelectorAll('[data-brand-slider]');
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.init();
  }

  init() {
    this.sliders.forEach((slider) => {
      slider.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
      slider.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
    });
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const difference = this.touchStartX - this.touchEndX;
    if (Math.abs(difference) > 50) {
      // Swipe detected - can implement custom behavior here
    }
  }
}

// Initialize carousel touch
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CarouselTouch();
  });
} else {
  new CarouselTouch();
}
