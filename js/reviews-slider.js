/* ============================================================
   FALCON SURVEILLANCE - TESTIMONIAL REVIEWS SLIDER
   Premium drag-and-swipe responsive touch slider
   ============================================================ */

// 6 Realistic Fallback Testimonials
const FALCON_DEFAULT_REVIEWS = [
  {
    id: 'review001',
    name: 'Rajesh Kumar',
    company: 'Kumar Electronics',
    location: 'Beohari',
    rating: 5,
    title: 'Excellent CCTV Solutions',
    review: 'Falcon Surveillance provided an outstanding security upgrade for our retail showroom. The clarity of the IP cameras is impressive, and the real-time remote monitoring has made management a breeze. Professional team!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'June 12, 2026',
    productsUsed: ['IP Camera', 'NVR']
  },
  {
    id: 'review002',
    name: 'Amit Sharma',
    company: 'Sharma Traders',
    location: 'Sidhi',
    rating: 5,
    title: 'Professional Installation',
    review: 'We secured our entire commercial complex with Falcon\'s high-definition CCTV camera system. The installation was neat, prompt, and the team ensured all entry points were perfectly covered. Extremely satisfied!',
    image: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'May 28, 2026',
    productsUsed: ['CCTV Camera', 'DVR']
  },
  {
    id: 'review003',
    name: 'Neha Singh',
    company: 'Fashion Store',
    location: 'Rewa',
    rating: 5,
    title: 'Amazing Service',
    review: 'The team at Falcon Surveillance did a fantastic job installing dome security cameras at our fashion boutique. Their attention to detail was exceptional, and the mobile app setup is highly intuitive.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'April 15, 2026',
    productsUsed: ['CCTV Camera', 'PTZ Camera']
  },
  {
    id: 'review004',
    name: 'Vikram Patel',
    company: 'Patel Warehouse',
    location: 'Shahdol',
    rating: 5,
    title: 'Reliable Security',
    review: 'Large-scale warehouse security requires absolute precision, and Falcon delivered exactly that. Their PTZ auto-tracking cameras and robust NVR setup have completely secured our inventory operations.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'March 02, 2026',
    productsUsed: ['PTZ Camera', 'NVR', 'CCTV Camera']
  },
  {
    id: 'review005',
    name: 'Rohit Verma',
    company: 'Logistics Company',
    location: 'Satna',
    rating: 5,
    title: 'Best GPS Tracking',
    review: 'Falcon\'s real-time GPS trackers have transformed how we manage our freight logistics. We now get accurate location updates, geofencing alerts, and fuel usage reports. Invaluable tool for fleet security!',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'February 18, 2026',
    productsUsed: ['GPS Tracker']
  },
  {
    id: 'review006',
    name: 'Priya Mehta',
    company: 'Retail Store',
    location: 'Sohagpur',
    rating: 5,
    title: 'Highly Recommended',
    review: 'An absolute pleasure working with Falcon Surveillance. From initial consultation to final testing, their security experts were helpful, knowledgeable, and provided top-tier surveillance hardware.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    verified: true,
    installationDate: 'January 24, 2026',
    productsUsed: ['IP Camera', 'PTZ Camera', 'NVR']
  }
];

// Helper to generate a beautiful dynamic initials avatar if network images are missing/fail
function getFallbackAvatarSvg(name, index) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  const gradients = [
    ['#0056CD', '#00C6FF'], // Falcon Blue Gradient
    ['#4f46e5', '#06b6d4'], // Indigo / Cyan
    ['#3b82f6', '#2563eb'], // Blue / Royal
    ['#8b5cf6', '#6d28d9'], // Violet / Purple
    ['#10b981', '#059669'], // Emerald / Green
    ['#ec4899', '#f43f5e']  // Pink / Rose
  ];
  
  const [c1, c2] = gradients[index % gradients.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="avatarGrad_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#avatarGrad_${index})" />
    <text x="50" y="58" font-family="'Poppins', sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

class ReviewsSlider {
  constructor() {
    this.container = document.querySelector('.reviews-slider');
    this.track = document.querySelector('.reviews-track');
    this.dotsContainer = document.querySelector('.review-dots');
    this.prevBtn = document.querySelector('.reviews-arrow.prev');
    this.nextBtn = document.querySelector('.reviews-arrow.next');
    
    // Automatically repair HTML structure if DOM elements are missing inside .reviews-section
    this.verifyAndBuildDOM();
    
    if (!this.container || !this.track) {
      console.warn("Falcon Testimonial Warning: Testimonial container or track elements could not be found or built.");
      return;
    }
    
    // Fail-safe initialization of reviews list
    this.reviews = FALCON_DEFAULT_REVIEWS;
    if (typeof COMPANY_CONFIG !== 'undefined') {
      if (COMPANY_CONFIG.customerReviews && Array.isArray(COMPANY_CONFIG.customerReviews) && COMPANY_CONFIG.customerReviews.length > 0) {
        this.reviews = COMPANY_CONFIG.customerReviews;
      } else {
        COMPANY_CONFIG.customerReviews = FALCON_DEFAULT_REVIEWS;
        console.warn("Falcon Testimonial Warning: COMPANY_CONFIG.customerReviews does not exist inside config.js. Initialized using fallback testimonials.");
      }
    } else {
      window.COMPANY_CONFIG = { customerReviews: FALCON_DEFAULT_REVIEWS };
      console.warn("Falcon Testimonial Warning: COMPANY_CONFIG is undefined. Initialized global configuration using fallback testimonials.");
    }
    
    this.clonesPrependedCount = 3;
    this.currentIndex = this.clonesPrependedCount; // Start at index 3 (first original slide A)
    
    // Drag / Swipe States
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.dragActive = false;
    this.isHorizontalGesture = false;
    this.touchActionLocked = false;
    
    // Auto slide states
    this.autoSlideInterval = null;
    this.isHovered = false;
    this.isFocused = false;
    this.autoplayDuration = 5000;
    
    this.cardWidth = 0;
    this.gap = 0;
    this.visibleCardsCount = 1;
    this.realReviewsCount = this.reviews.length;
    
    this.init();
  }

  // Ensures container, track, dots, and arrows exist in HTML
  verifyAndBuildDOM() {
    const section = document.querySelector('.reviews-section');
    if (!section) return;

    let containerDiv = section.querySelector('.reviews-container');
    if (!containerDiv) {
      containerDiv = section.querySelector('.container');
      if (containerDiv) {
        containerDiv.classList.add('reviews-container');
      } else {
        containerDiv = document.createElement('div');
        containerDiv.className = 'container reviews-container';
        section.appendChild(containerDiv);
      }
    }

    let titleEl = containerDiv.querySelector('.reviews-title');
    if (!titleEl) {
      titleEl = document.createElement('h2');
      titleEl.className = 'reviews-title';
      titleEl.textContent = 'What Our Customers Say';
      titleEl.setAttribute('data-reveal', 'up');
      containerDiv.insertBefore(titleEl, containerDiv.firstChild);
    }

    let wrapper = containerDiv.querySelector('.reviews-slider-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'reviews-slider-wrapper';
      wrapper.setAttribute('data-reveal', 'up');
      wrapper.setAttribute('data-reveal-delay', '0.1s');
      containerDiv.appendChild(wrapper);
    }

    let prev = wrapper.querySelector('.reviews-arrow.prev');
    if (!prev) {
      prev = document.createElement('button');
      prev.className = 'reviews-arrow prev';
      prev.type = 'button';
      prev.setAttribute('aria-label', 'Previous slide');
      prev.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      wrapper.appendChild(prev);
    }

    let slider = wrapper.querySelector('.reviews-slider');
    if (!slider) {
      slider = document.createElement('div');
      slider.className = 'reviews-slider';
      wrapper.appendChild(slider);
    }
    this.container = slider;

    let track = slider.querySelector('.reviews-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'reviews-track';
      slider.appendChild(track);
    }
    this.track = track;

    let next = wrapper.querySelector('.reviews-arrow.next');
    if (!next) {
      next = document.createElement('button');
      next.className = 'reviews-arrow next';
      next.type = 'button';
      next.setAttribute('aria-label', 'Next slide');
      next.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
      wrapper.appendChild(next);
    }

    let dots = containerDiv.querySelector('.review-dots');
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'review-dots';
      dots.setAttribute('data-reveal', 'up');
      dots.setAttribute('data-reveal-delay', '0.2s');
      containerDiv.appendChild(dots);
    }
    this.dotsContainer = dots;
    
    this.prevBtn = prev;
    this.nextBtn = next;
  }

  init() {
    this.renderReviews();
    this.updateDimensions();
    
    // Set initial position
    this.prevTranslate = this.calculateTranslation(this.currentIndex);
    this.setTrackPosition(this.prevTranslate);
    
    // Events
    window.addEventListener('resize', () => this.handleResize());
    
    // Touch support (Mobile)
    this.track.addEventListener('touchstart', (e) => this.dragStart(e), { passive: true });
    this.track.addEventListener('touchmove', (e) => this.dragMove(e), { passive: false });
    this.track.addEventListener('touchend', (e) => this.dragEnd(e));
    this.track.addEventListener('touchcancel', (e) => this.dragEnd(e));

    // Mouse support (Desktop)
    this.track.addEventListener('mousedown', (e) => this.dragStart(e));
    window.addEventListener('mousemove', (e) => this.dragMove(e), { passive: false });
    window.addEventListener('mouseup', (e) => this.dragEnd(e));
    
    // Prev / Next button actions
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.slidePrev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.slideNext());
    }

    // Pagination Dots click
    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.review-dot');
        if (dot) {
          const index = parseInt(dot.dataset.index);
          this.goToOriginalIndex(index);
        }
      });
    }

    // Keyboard support
    this.container.tabIndex = 0;
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Customer testimonials');
    
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.slidePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.slideNext();
      }
    });

    this.container.addEventListener('focusin', () => {
      this.isFocused = true;
      this.stopAutoPlay();
    });
    this.container.addEventListener('focusout', () => {
      this.isFocused = false;
      this.startAutoPlay();
    });

    // Hover pause
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.stopAutoPlay();
    });
    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.startAutoPlay();
    });

    // Transition end handler
    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

    // Prevent system dragging images
    this.track.addEventListener('dragstart', (e) => e.preventDefault());

    this.startAutoPlay();
  }

  renderReviews() {
    const realCount = this.reviews.length;
    if (realCount === 0) return;

    // Generate cards HTML with strict safety checks on all fields
    const cardsHtml = this.reviews.map((r, idx) => {
      const name = r.name || 'Valued Partner';
      const company = r.company || 'Enterprise Customer';
      const location = r.location || 'Shahdol';
      const rating = typeof r.rating === 'number' ? r.rating : 5;
      const title = r.title || 'Excellent Security Setup';
      const reviewText = r.review || 'We received professional security installation and services from Falcon. Highly recommended and excellent quality!';
      const installationDate = r.installationDate || 'June 2026';
      const productsUsed = Array.isArray(r.productsUsed) ? r.productsUsed : ['CCTV System'];
      
      const fallbackAvatar = getFallbackAvatarSvg(name, idx);
      const image = r.image || fallbackAvatar;

      return `
        <div class="review-card" role="group" aria-roledescription="slide" aria-label="${idx + 1} of ${realCount}">
          <div class="review-card-header">
            <div class="review-avatar-container">
              <img src="${image}" alt="${name}" class="review-avatar" loading="lazy" onerror="this.onerror=null; this.src='${fallbackAvatar}';" />
              <div class="review-verified-badge" title="Verified Customer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <div class="review-meta">
              <h4 class="review-name">${name}</h4>
              <p class="review-business">${company} <span class="review-location">• ${location}</span></p>
              <div class="review-rating" aria-label="${rating} star rating">
                ${'★'.repeat(Math.round(rating))}
              </div>
            </div>
          </div>
          <h5 class="review-card-title">${title}</h5>
          <p class="review-description">"${reviewText}"</p>
          <div class="review-card-footer">
            <span class="review-install-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; margin-right: 4px; display: inline-block; vertical-align: middle;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Installed: ${installationDate}
            </span>
            <div class="review-products-used">
              ${productsUsed.map((p) => `<span class="product-tag">${p}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    });

    // Prepare prepended clones (last 3 reviews)
    const prependedClones = [
      cardsHtml[realCount - 3],
      cardsHtml[realCount - 2],
      cardsHtml[realCount - 1]
    ];
    
    // Prepare appended clones (first 3 reviews)
    const appendedClones = [
      cardsHtml[0],
      cardsHtml[1],
      cardsHtml[2]
    ];

    this.track.innerHTML = [
      ...prependedClones,
      ...cardsHtml,
      ...appendedClones
    ].join('');

    // Render Dots
    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = this.reviews
        .map((_, i) => `<button class="review-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`)
        .join('');
    }
  }

  updateDimensions() {
    const cards = this.track.querySelectorAll('.review-card');
    if (cards.length > 0) {
      this.cardWidth = cards[0].offsetWidth;
      this.gap = parseFloat(window.getComputedStyle(this.track).gap) || 0;
      this.visibleCardsCount = Math.round(this.container.offsetWidth / (this.cardWidth + this.gap)) || 1;
    }
  }

  calculateTranslation(index) {
    const containerWidth = this.container.offsetWidth;
    let offset = 0;
    
    if (this.visibleCardsCount === 1) {
      // Centered alignment on mobile/one-card view
      offset = (containerWidth - this.cardWidth) / 2;
    } else {
      // Left aligned on desktop/tablet multi-card view
      offset = 0;
    }
    
    return offset - index * (this.cardWidth + this.gap);
  }

  setTrackPosition(translation) {
    this.track.style.transform = `translateX(${translation}px)`;
  }

  handleResize() {
    this.updateDimensions();
    this.prevTranslate = this.calculateTranslation(this.currentIndex);
    this.setTrackPosition(this.prevTranslate);
  }

  // Swipe / Drag Physics
  dragStart(event) {
    this.isDragging = true;
    this.dragActive = true;
    this.isHorizontalGesture = false;
    this.touchActionLocked = false;
    
    const posX = this.getPositionX(event);
    const posY = this.getPositionY(event);
    this.startX = posX;
    this.startY = posY;
    
    this.stopAutoPlay();
    this.track.style.transition = 'none';
    this.updateDimensions();
  }

  dragMove(event) {
    if (!this.isDragging) return;
    
    const posX = this.getPositionX(event);
    const posY = this.getPositionY(event);
    const diffX = posX - this.startX;
    const diffY = posY - this.startY;
    
    if (!this.isHorizontalGesture && !this.touchActionLocked) {
      const threshold = 6;
      if (Math.abs(diffX) > Math.abs(diffY) + threshold) {
        this.isHorizontalGesture = true;
        this.touchActionLocked = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) + threshold) {
        this.isHorizontalGesture = false;
        this.touchActionLocked = true;
      }
    }
    
    if (this.isHorizontalGesture) {
      // Prevent horizontal scroll default behaviors
      if (event.cancelable) event.preventDefault();
      
      this.currentTranslate = this.prevTranslate + diffX;
      this.setTrackPosition(this.currentTranslate);
    }
  }

  dragEnd(event) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.dragActive = false;
    
    const posX = this.getPositionX(event, true);
    const diffX = posX - this.startX;
    
    if (this.isHorizontalGesture) {
      const threshold = this.cardWidth * 0.15; // 15% swipe threshold
      
      if (diffX < -threshold) {
        this.slideNext();
      } else if (diffX > threshold) {
        this.slidePrev();
      } else {
        this.goToIndex(this.currentIndex);
      }
    } else {
      this.goToIndex(this.currentIndex);
    }
    
    this.isHorizontalGesture = false;
    this.touchActionLocked = false;
    
    if (!this.isHovered && !this.isFocused) {
      this.startAutoPlay();
    }
  }

  getPositionX(event, isEnd = false) {
    if (event.type.includes('touch')) {
      if (isEnd) {
        return event.changedTouches[0].clientX;
      }
      return event.touches[0].clientX;
    }
    return event.clientX;
  }

  getPositionY(event, isEnd = false) {
    if (event.type.includes('touch')) {
      if (isEnd) {
        return event.changedTouches[0].clientY;
      }
      return event.touches[0].clientY;
    }
    return event.clientY;
  }

  slideNext() {
    this.currentIndex++;
    this.goToIndex(this.currentIndex);
  }

  slidePrev() {
    this.currentIndex--;
    this.goToIndex(this.currentIndex);
  }

  goToIndex(index, animate = true) {
    this.currentIndex = index;
    this.updateDimensions();
    
    if (animate) {
      this.track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      this.track.style.transition = 'none';
    }
    
    this.currentTranslate = this.calculateTranslation(this.currentIndex);
    this.setTrackPosition(this.currentTranslate);
    this.prevTranslate = this.currentTranslate;
    
    this.updateActiveDot();
  }

  goToOriginalIndex(originalIndex) {
    this.stopAutoPlay();
    this.goToIndex(originalIndex + this.clonesPrependedCount);
    if (!this.isHovered && !this.isFocused) {
      this.startAutoPlay();
    }
  }

  handleTransitionEnd() {
    this.updateDimensions();
    
    // Infinite loop jump boundaries
    if (this.currentIndex >= this.realReviewsCount + this.clonesPrependedCount) {
      this.currentIndex = this.currentIndex - this.realReviewsCount;
      this.goToIndex(this.currentIndex, false);
    } else if (this.currentIndex < this.clonesPrependedCount) {
      this.currentIndex = this.currentIndex + this.realReviewsCount;
      this.goToIndex(this.currentIndex, false);
    }
  }

  updateActiveDot() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.review-dot');
    
    const activeDotIdx = ((this.currentIndex - this.clonesPrependedCount) % this.realReviewsCount + this.realReviewsCount) % this.realReviewsCount;
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeDotIdx);
      dot.setAttribute('aria-selected', idx === activeDotIdx ? 'true' : 'false');
    });
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoSlideInterval = setInterval(() => {
      this.slideNext();
    }, this.autoplayDuration);
  }

  stopAutoPlay() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
}

// Auto instantiate ReviewsSlider
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.reviews-section')) {
      new ReviewsSlider();
    }
  });
} else {
  if (document.querySelector('.reviews-section')) {
    new ReviewsSlider();
  }
}
