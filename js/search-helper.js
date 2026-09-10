/* ============================================================
   FALCON SURVEILLANCE - ENTERPRISE SEARCH ARCHITECT
   Multi-Index Search (Products, Blogs, Services, Guides)
   ============================================================ */

class AdvancedSearchHelper {
  constructor() {
    this.searchBoxes = document.querySelectorAll('.search-box, #blog-search-box');
    this.init();
  }

  init() {
    this.searchBoxes.forEach(box => {
      // Find or create suggestions container if not present
      let suggestionsContainer = box.parentElement.querySelector('.search-suggestions');
      if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        suggestionsContainer.style.cssText = `
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-bg-primary, #050e21);
          border: 1px solid var(--color-border, #1a2c50);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 999;
          max-height: 450px;
          overflow-y: auto;
          display: none;
          margin-top: 5px;
        `;
        box.parentElement.appendChild(suggestionsContainer);
      }

      // Input listener
      box.addEventListener('input', (e) => this.handleSearchInput(e, suggestionsContainer));
      box.addEventListener('focus', (e) => this.handleSearchInput(e, suggestionsContainer));
      
      // Blur listener to close dropdown (with small delay for click registration)
      box.addEventListener('blur', () => {
        setTimeout(() => {
          suggestionsContainer.style.display = 'none';
        }, 250);
      });
    });

    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('search-helper-styles')) return;
    const style = document.createElement('style');
    style.id = 'search-helper-styles';
    style.textContent = `
      .search-suggest-group-title {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-primary, #0056CD);
        padding: 10px 15px 5px 15px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        letter-spacing: 0.05em;
      }
      .search-suggest-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        color: var(--color-text-primary, #ffffff);
        text-decoration: none;
        font-size: 0.9rem;
        transition: background 0.2s;
        border-bottom: 1px solid rgba(255,255,255,0.02);
      }
      .search-suggest-item:hover {
        background: rgba(0, 86, 205, 0.15);
        color: var(--color-primary, #0056CD);
      }
      .search-suggest-meta {
        font-size: 0.75rem;
        color: var(--color-text-secondary, #8c9bb5);
      }
    `;
    document.head.appendChild(style);
  }

  handleSearchInput(event, container) {
    const query = event.target.value.toLowerCase().trim();
    if (!query) {
      container.style.display = 'none';
      return;
    }

    // Index 1: Products
    const allProducts = [
      ...(typeof COMPANY_CONFIG !== 'undefined' ? COMPANY_CONFIG.cctvProducts : []),
      ...(typeof COMPANY_CONFIG !== 'undefined' ? COMPANY_CONFIG.gpsProducts : [])
    ];
    const matchingProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    ).slice(0, 4);

    // Index 2: Blogs
    const allBlogs = typeof BLOG_POSTS !== 'undefined' ? BLOG_POSTS : [];
    const matchingBlogs = allBlogs.filter(b => 
      b.title.toLowerCase().includes(query) ||
      b.excerpt.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query)
    ).slice(0, 4);

    // Index 3: Services
    const staticServices = [
      { name: "CCTV Installation Services", url: "cctv-installation.html" },
      { name: "Wireless Security Cameras", url: "wireless-cctv.html" },
      { name: "IP Network Surveillance", url: "ip-camera.html" },
      { name: "GPS Fleet Tracking System", url: "fleet-tracking.html" },
      { name: "Biometric Access Control", url: "biometric-system.html" },
      { name: "Commercial Fire Alarms", url: "fire-alarm.html" },
      { name: "Annual Maintenance Contracts (AMC)", url: "service-amc.html" }
    ];
    const matchingServices = staticServices.filter(s => 
      s.name.toLowerCase().includes(query)
    ).slice(0, 3);

    let html = '';

    // Render Products Group
    if (matchingProducts.length > 0) {
      html += `<div class="search-suggest-group-title">Products</div>`;
      matchingProducts.forEach(p => {
        let urlPath = `product-detail.html?id=${p.id}`;
        if (p.id === 'cc001') urlPath = 'product-dome-camera.html';
        if (p.id === 'cc002') urlPath = 'product-bullet-camera.html';
        if (p.id === 'cc003') urlPath = 'product-ip-camera.html';
        if (p.id === 'gps001') urlPath = 'product-car-gps.html';
        if (p.id === 'gps002') urlPath = 'product-fleet-gps.html';
        if (p.id === 'gps003') urlPath = 'product-personal-gps.html';
        
        html += `
          <a class="search-suggest-item" href="${urlPath}">
            <span>${p.name}</span>
            <span class="search-suggest-meta">${p.brand}</span>
          </a>
        `;
      });
    }

    // Render Blogs Group
    if (matchingBlogs.length > 0) {
      html += `<div class="search-suggest-group-title">Guides & Articles</div>`;
      matchingBlogs.forEach(b => {
        html += `
          <a class="search-suggest-item" href="blog-post.html?id=${b.id}">
            <span>${b.title}</span>
            <span class="search-suggest-meta">${b.category}</span>
          </a>
        `;
      });
    }

    // Render Services Group
    if (matchingServices.length > 0) {
      html += `<div class="search-suggest-group-title">Services</div>`;
      matchingServices.forEach(s => {
        html += `
          <a class="search-suggest-item" href="${s.url}">
            <span>${s.name}</span>
            <span class="search-suggest-meta">Installation</span>
          </a>
        `;
      });
    }

    if (!html) {
      container.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--color-text-secondary); font-size: 0.9rem;">No results matches "${event.target.value}"</div>`;
    } else {
      container.innerHTML = html;
    }
    container.style.display = 'block';
  }
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Disable default suggestion dropdown in ProductManager to prevent conflicts
  if (window.productManager) {
    window.productManager.showSearchSuggestions = () => {};
    window.productManager.hideSearchSuggestions = () => {};
  }
  new AdvancedSearchHelper();
});
