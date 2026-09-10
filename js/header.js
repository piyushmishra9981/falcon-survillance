/* ============================================================
   FALCON SURVEILLANCE - HEADER & NAVIGATION
   Mobile menu, hamburger menu, and scroll effects
   ============================================================ */

class HeaderManager {
  constructor() {
    this.header = document.querySelector('header');
    this.hamburger = document.querySelector('[data-hamburger]');
    this.mobileMenu = document.querySelector('[data-mobile-menu]');
    this.mobileMenuLinks = document.querySelectorAll('[data-mobile-menu-link]');
    this.scrollThreshold = 50;
    this.isMenuOpen = false;
    this.body = document.body;

    this.init();
  }

  init() {
    this.setupMenuToggle();
    this.setupMobileMenuLinks();
    this.setupScrollEffect();
    this.setupClickOutside();
    this.setupResizeHandler();
    this.setupFloatingActions();
    this.setupNavigationExtensions();
    this.loadDependentScripts();
  }

  /**
   * Dynamically load blog database and search helper scripts
   */
  loadDependentScripts() {
    const isBlogPage = window.location.pathname.includes('blog.html') || window.location.pathname.includes('blog-post.html');
    if (!isBlogPage && !window.BLOG_POSTS && !document.querySelector('script[src*="blog-posts.js"]')) {
      const dbScript = document.createElement('script');
      dbScript.src = 'js/blog-posts.js';
      document.body.appendChild(dbScript);
    }
    if (!document.querySelector('script[src*="search-helper.js"]')) {
      const searchScript = document.createElement('script');
      searchScript.src = 'js/search-helper.js';
      document.body.appendChild(searchScript);
    }
    if (document.querySelector('.reviews-slider') && !document.querySelector('script[src*="reviews-slider.js"]')) {
      const sliderScript = document.createElement('script');
      sliderScript.src = 'js/reviews-slider.js';
      document.body.appendChild(sliderScript);
    }
  }

  /**
   * Inject Blog navigation links dynamically in header and footer bottom
   */
  setupNavigationExtensions() {
    // Desktop Nav Menu
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !navMenu.querySelector('a[href*="blog.html"]')) {
      const faqLink = navMenu.querySelector('a[href*="faq"]');
      const contactLink = navMenu.querySelector('a[href*="contact"]');
      const targetLink = faqLink || contactLink;
      if (targetLink) {
        const targetItem = targetLink.parentElement;
        const blogItem = document.createElement('li');
        blogItem.className = 'nav-item';
        const isBlogPage = window.location.pathname.includes('blog.html') || window.location.pathname.includes('blog-post.html');
        blogItem.innerHTML = `<a href="blog.html" class="nav-link ${isBlogPage ? 'active' : ''}">Blog</a>`;
        navMenu.insertBefore(blogItem, targetItem);
      }
    }

    // Mobile Menu Container
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    if (mobileMenuContainer && !mobileMenuContainer.querySelector('a[href*="blog.html"]')) {
      const contactLink = mobileMenuContainer.querySelector('a[href*="contact"]');
      const blogLink = document.createElement('a');
      blogLink.href = 'blog.html';
      const isBlogPage = window.location.pathname.includes('blog.html') || window.location.pathname.includes('blog-post.html');
      if (isBlogPage) blogLink.className = 'active';
      blogLink.setAttribute('data-mobile-menu-link', '');
      blogLink.textContent = 'Blog';
      if (contactLink) {
        mobileMenuContainer.insertBefore(blogLink, contactLink);
      } else {
        mobileMenuContainer.appendChild(blogLink);
      }
    }

    // Mobile Nav List (for index and subpages)
    const mobileNavList = document.querySelector('.mobile-nav-list');
    if (mobileNavList && !mobileNavList.querySelector('a[href*="blog.html"]')) {
      const faqLink = mobileNavList.querySelector('a[href*="faq"]');
      const contactLink = mobileNavList.querySelector('a[href*="contact"]');
      const targetLink = faqLink || contactLink;
      if (targetLink) {
        const targetItem = targetLink.parentElement;
        const blogItem = document.createElement('li');
        blogItem.className = 'mobile-menu-item';
        const isBlogPage = window.location.pathname.includes('blog.html') || window.location.pathname.includes('blog-post.html');
        blogItem.innerHTML = `<a href="blog.html" class="mobile-menu-link ${isBlogPage ? 'active' : ''}" data-mobile-menu-link>Blog</a>`;
        mobileNavList.insertBefore(blogItem, targetItem);
      }
    }

    // Footer Bottom Links
    const footerBottomLinks = document.querySelector('.footer-bottom-links');
    if (footerBottomLinks && !footerBottomLinks.querySelector('a[href*="blog.html"]')) {
      const blogFooterLink = document.createElement('a');
      blogFooterLink.href = 'blog.html';
      blogFooterLink.textContent = 'Blog';
      footerBottomLinks.appendChild(blogFooterLink);
    }

    // Rewrite hashes for subpages to enable full navigation back to index.html sections
    const isHomepage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '' || window.location.pathname.split('/').pop() === '';
    
    if (!isHomepage) {
      const pageLinks = document.querySelectorAll('.nav-menu a, .mobile-menu a, .footer-bottom-links a, [data-mobile-menu-link]');
      pageLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href !== '#') {
          link.setAttribute('href', 'index.html' + href);
        }
      });
    } else {
      // Smooth scroll interceptor for index.html#... links on the homepage
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (!href) return;
        
        if (href.startsWith('index.html#') || href.startsWith('#')) {
          const hash = href.substring(href.indexOf('#'));
          if (hash === '#') return;
          const section = document.querySelector(hash);
          if (section) {
            e.preventDefault();
            // Close mobile menu if open
            const mobileMenu = document.querySelector('[data-mobile-menu], .mobile-menu');
            const hamburger = document.querySelector('[data-hamburger], .hamburger');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
              mobileMenu.classList.remove('active');
            }
            if (hamburger && hamburger.classList.contains('active')) {
              hamburger.classList.remove('active');
              hamburger.setAttribute('aria-expanded', 'false');
            }
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
  }

  /**
   * Setup hamburger menu toggle
   */
  setupMenuToggle() {
    if (!this.hamburger) return;

    this.hamburger.addEventListener('click', () => {
      this.isMenuOpen ? this.closeMenu() : this.openMenu();
    });

    // Prevent scroll when menu is open
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener('touchmove', (e) => {
        e.preventDefault();
      }, false);
    }
  }

  /**
   * Open mobile menu
   */
  openMenu() {
    if (!this.hamburger || !this.mobileMenu) return;

    this.hamburger.classList.add('active');
    this.mobileMenu.classList.add('active');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.isMenuOpen = true;

    // Prevent body scroll
    this.body.style.overflow = 'hidden';
    this.body.style.touchAction = 'none';
  }

  /**
   * Close mobile menu
   */
  closeMenu() {
    if (!this.hamburger || !this.mobileMenu) return;

    this.hamburger.classList.remove('active');
    this.mobileMenu.classList.remove('active');
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.isMenuOpen = false;

    // Restore body scroll
    this.body.style.overflow = '';
    this.body.style.touchAction = '';
  }

  /**
   * Setup click handlers for mobile menu links
   */
  setupMobileMenuLinks() {
    this.mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
  }

  /**
   * Setup scroll effect for header
   */
  setupScrollEffect() {
    let ticking = false;

    const handleScroll = () => {
      if (window.scrollY > this.scrollThreshold) {
        this.header.classList.add('scrolled', 'shadow-enhanced');
      } else {
        this.header.classList.remove('scrolled', 'shadow-enhanced');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    });
  }

  /**
   * Close the menu on larger screens and on resize
   */
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  /**
   * Add reusable floating call & email buttons that stay fixed at the top center
   */
  setupFloatingActions() {
    if (!document.querySelector('.floating-contact-group')) {
      const contactGroup = document.createElement('div');
      contactGroup.className = 'floating-contact-group';

      const callButton = document.createElement('a');
      callButton.className = 'floating-contact-btn floating-contact-btn--call';
      callButton.href = 'tel:+917049345854';
      callButton.setAttribute('aria-label', 'Call Falcon Surveillance at +91 70493 45854');
      callButton.innerHTML = `
        <span class="floating-contact-btn__icon" aria-hidden="true">
          <svg viewBox="0 0 512 512"><path d="M493.4 24.6l-104-24c-11.7-2.7-23.7 2.4-30.4 12.8l-48 88c-6.3 11.6-4.1 25.8 5.4 34.9l56 56c-41.2 78.5-107.1 144.4-185.6 185.6l-56-56c-9.1-9.5-23.4-11.7-34.9-5.4l-88 48C2.8 357.3-2.3 369.3 .4 381l24 104C27.1 503.3 38.6 512 52 512c256.3 0 464-207.7 464-464 0-13.4-8.7-24.9-20.6-28.4z"/></svg>
        </span>
        <span class="floating-contact-btn__text">Call Now</span>
      `;

      const emailButton = document.createElement('a');
      emailButton.className = 'floating-contact-btn floating-contact-btn--email';
      emailButton.href = 'mailto:info@falconsurveillance.in';
      emailButton.setAttribute('aria-label', 'Email Falcon Surveillance at info@falconsurveillance.in');
      emailButton.innerHTML = `
        <span class="floating-contact-btn__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </span>
        <span class="floating-contact-btn__text">Email Us</span>
      `;

      contactGroup.appendChild(callButton);
      contactGroup.appendChild(emailButton);
      document.body.appendChild(contactGroup);
    }

    if (!document.querySelector('.floating-whatsapp-button')) {
      const whatsappButton = document.createElement('a');
      whatsappButton.className = 'floating-whatsapp-button';
      whatsappButton.href = `https://wa.me/917049345854?text=${encodeURIComponent('Hello Falcon Surveillance Team,\n\nI would like to know more about your CCTV and GPS solutions.\n\nPlease help me choose the best option.\n\nThank you!')}`;
      whatsappButton.target = '_blank';
      whatsappButton.rel = 'noopener noreferrer';
      whatsappButton.setAttribute('aria-label', 'Chat with Falcon Surveillance on WhatsApp');
      whatsappButton.innerHTML = `
        <span class="floating-whatsapp-button__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.93-2.21-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-.14.24-.7.24-1.29.17-1.41-.08-.12-.27-.2-.57-.35Z"></path></svg>
        </span>
      `;
      document.body.appendChild(whatsappButton);
    }
  }

  /**
   * Close menu when clicking outside
   */
  setupClickOutside() {
    document.addEventListener('click', (e) => {
      if (
        this.isMenuOpen &&
        !this.mobileMenu.contains(e.target) &&
        !this.hamburger.contains(e.target)
      ) {
        this.closeMenu();
      }
    });

    // Also close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }
}

// Initialize header manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HeaderManager();
  });
} else {
  new HeaderManager();
}

/* FAQ accordion handled centrally by js/faq.js */