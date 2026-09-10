/* ============================================================
   FALCON SURVEILLANCE - PRODUCT MANAGEMENT SYSTEM
   Advanced Search, Filters, Rendering, and E-Commerce Pages
   ============================================================ */

class ProductManager {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.currentCategory = null;
    this.currentBrand = null;
    this.minPrice = 0;
    this.maxPrice = Infinity;
    this.currentSort = 'popular';
    this.searchQuery = '';
    this.itemsPerPage = COMPANY_CONFIG.productConfig.itemsPerPage || 12;
    this.currentPage = 1;

    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.loadSearchFromURL();
    this.applyFilters();
  }

  loadSearchFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get('search');
      if (searchParam) {
        this.searchQuery = searchParam.toLowerCase().trim();
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
          searchBox.value = searchParam;
        }
      }
      
      const catParam = params.get('category');
      if (catParam) {
        this.currentCategory = catParam;
        const activeCard = document.querySelector(`.category-card[data-category-filter="${catParam}"]`);
        if (activeCard) {
          document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
          activeCard.classList.add('active');
        }
      }
    } catch (e) {
      console.error('Error loading search from URL', e);
    }
  }

  loadProducts() {
    const isGPSPage = window.location.pathname.includes('gps.html');
    const isCCTVPage = window.location.pathname.includes('cctv.html');

    if (isGPSPage) {
      this.allProducts = COMPANY_CONFIG.gpsProducts;
    } else if (isCCTVPage) {
      this.allProducts = COMPANY_CONFIG.cctvProducts;
    } else {
      this.allProducts = [
        ...COMPANY_CONFIG.cctvProducts,
        ...COMPANY_CONFIG.gpsProducts,
      ];
    }
    this.filteredProducts = [...this.allProducts];
  }

  setupEventListeners() {
    // Search input
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.addEventListener('input', (e) => this.handleSearch(e));
      searchBox.addEventListener('focus', () => this.showSearchSuggestions());
      searchBox.addEventListener('blur', () => {
        setTimeout(() => this.hideSearchSuggestions(), 200); // delay to allow clicks
      });
    }

    // Category filter cards
    const categoryFilters = document.querySelectorAll('[data-category-filter]');
    categoryFilters.forEach((btn) => {
      btn.addEventListener('click', (e) => this.filterByCategory(e));
    });

    // Brand filter select dropdown
    const brandSelect = document.querySelector('[data-brand-select]');
    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        this.currentBrand = val === 'all' ? null : val;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Price range filter select dropdown
    const priceFilter = document.querySelector('[data-price-filter]');
    if (priceFilter) {
      priceFilter.addEventListener('change', (e) => this.handlePriceFilter(e));
    }

    // Sort select dropdown
    const sortSelect = document.querySelector('[data-sort]');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.handleSort(e));
    }

    // Pagination
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page]');
        if (btn) {
          this.currentPage = parseInt(btn.dataset.page);
          this.renderProducts();
          window.scrollTo({ top: document.querySelector('.section-products').offsetTop - 100, behavior: 'smooth' });
        }
      });
    }
  }

  handleSearch(event) {
    this.searchQuery = event.target.value.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilters();
    this.showSearchSuggestions();
  }

  showSearchSuggestions() {
    if (!this.searchQuery) {
      this.hideSearchSuggestions();
      return;
    }

    const suggestions = this.allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(this.searchQuery) ||
          p.brand.toLowerCase().includes(this.searchQuery) ||
          p.description.toLowerCase().includes(this.searchQuery)
      )
      .slice(0, 5);

    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
      if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions
          .map((p) => {
            let urlPath = `product-detail.html?id=${p.id}`;
            if (p.id === 'cc001') urlPath = 'product-dome-camera.html';
            if (p.id === 'cc002') urlPath = 'product-bullet-camera.html';
            if (p.id === 'cc003') urlPath = 'product-ip-camera.html';
            if (p.id === 'gps001') urlPath = 'product-car-gps.html';
            if (p.id === 'gps002') urlPath = 'product-fleet-gps.html';
            if (p.id === 'gps003') urlPath = 'product-personal-gps.html';
            return `<a class="suggestion-item" href="${urlPath}" style="display:block;padding:10px 15px;text-decoration:none;color:var(--color-text-primary);border-bottom:1px solid var(--color-border);">${p.name} (${p.brand})</a>`;
          })
          .join('');
        suggestionsContainer.style.display = 'block';
        suggestionsContainer.classList.add('active');
      } else {
        this.hideSearchSuggestions();
      }
    }
  }

  hideSearchSuggestions() {
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
      suggestionsContainer.classList.remove('active');
    }
  }

  filterByCategory(event) {
    const card = event.currentTarget;
    const categoryId = card.dataset.categoryFilter;

    // Check if category card is already active
    const wasActive = card.classList.contains('active');
    document.querySelectorAll('[data-category-filter]').forEach((c) => c.classList.remove('active'));

    if (wasActive) {
      this.currentCategory = null;
    } else {
      card.classList.add('active');
      this.currentCategory = categoryId;
    }

    this.currentPage = 1;
    this.applyFilters();
  }

  handlePriceFilter(event) {
    const val = event.target.value;
    if (val === 'all') {
      this.minPrice = 0;
      this.maxPrice = Infinity;
    } else if (val === 'under-3k') {
      this.minPrice = 0;
      this.maxPrice = 3000;
    } else if (val === '3k-6k') {
      this.minPrice = 3000;
      this.maxPrice = 6000;
    } else if (val === '6k-12k') {
      this.minPrice = 6000;
      this.maxPrice = 12000;
    } else if (val === 'over-12k') {
      this.minPrice = 12000;
      this.maxPrice = Infinity;
    }
    this.currentPage = 1;
    this.applyFilters();
  }

  handleSort(event) {
    this.currentSort = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Search query filter
    if (this.searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(this.searchQuery) ||
          p.description.toLowerCase().includes(this.searchQuery) ||
          p.brand.toLowerCase().includes(this.searchQuery)
      );
    }

    // Category filter
    if (this.currentCategory) {
      filtered = filtered.filter((p) => p.category === this.currentCategory);
    }

    // Brand filter
    if (this.currentBrand) {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === this.currentBrand.toLowerCase());
    }

    // Price filter
    filtered = filtered.filter((p) => p.price >= this.minPrice && p.price <= this.maxPrice);

    // Sorting
    this.sortProducts(filtered);
    this.filteredProducts = filtered;
    this.renderProducts();
  }

  sortProducts(products) {
    switch (this.currentSort) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => (b.id.localeCompare(a.id))); // mock date fallback
        break;
      case 'popular':
      default:
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }

  renderProducts() {
    const container = document.querySelector('.products-grid');
    if (!container) return;

    if (this.filteredProducts.length === 0) {
      container.innerHTML = `
        <div class="no-products-found" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--color-bg-secondary); border-radius: var(--radius-2xl); border: 1px dashed var(--color-border);">
          <h3 style="margin-bottom: 10px; font-weight: 700; font-size: var(--fs-lg);">No Products Match Your Filters</h3>
          <p style="color: var(--color-text-secondary); max-width: 450px; margin: 0 auto;">Try clearing some search terms or adjusting the price range selector to view our security models.</p>
        </div>
      `;
      this.updatePagination();
      return;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginated = this.filteredProducts.slice(start, end);

    container.innerHTML = paginated
      .map((product) => this.createProductCard(product))
      .join('');

    this.attachProductCardListeners();
    this.updatePagination();

    // Trigger hover animations
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.animation = `fadeIn 0.6s ease-out ${index * 0.04}s both`;
    });
  }

  createProductCard(product) {
    const badge = product.badge ? `<div class="product-badge ${product.badge}">${product.badge}</div>` : '';
    const formattedPrice = `₹${product.price.toLocaleString('en-IN')}`;
    const formattedWholesale = product.wholesalePrice ? `₹${product.wholesalePrice.toLocaleString('en-IN')}` : '';

    let urlPath = `product-detail.html?id=${product.id}`;
    if (product.id === 'cc001') urlPath = 'product-dome-camera.html';
    if (product.id === 'cc002') urlPath = 'product-bullet-camera.html';
    if (product.id === 'cc003') urlPath = 'product-ip-camera.html';
    if (product.id === 'gps001') urlPath = 'product-car-gps.html';
    if (product.id === 'gps002') urlPath = 'product-fleet-gps.html';
    if (product.id === 'gps003') urlPath = 'product-personal-gps.html';

    return `
      <a class="product-card" href="${urlPath}" data-product-id="${product.id}" aria-label="View details for ${product.name}" style="text-decoration:none; color:inherit;">
        <div class="product-image-wrapper">
          ${badge}
          <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
        </div>
        <div class="product-content">
          <div class="product-brand" style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">${product.brand}</div>
          <h3 class="product-name" style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: 600; line-height: 1.4; color: var(--color-text-primary); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${product.name}</h3>
          <div class="product-price-section" style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--color-border-light); padding-top: 10px;">
            <div class="product-price" style="font-weight: 700; font-size: 1.2rem; color: var(--color-text-primary);">${formattedPrice}</div>
            ${formattedWholesale ? `<div class="product-price-small" style="font-size: 0.8rem; color: var(--color-text-secondary);">Wholesale: ${formattedWholesale}</div>` : ''}
          </div>
        </div>
      </a>
    `;
  }

  attachProductCardListeners() {
    document.querySelectorAll('.product-card[data-product-id]').forEach((card) => {
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    if (paginationContainer) {
      if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
      }
      paginationContainer.innerHTML = Array(totalPages)
        .fill(0)
        .map(
          (_, index) =>
            `<button class="pagination-button ${this.currentPage === index + 1 ? 'active' : ''}" data-page="${index + 1}" style="padding: 10px 16px; border: 1px solid var(--color-border); background: var(--color-bg-secondary); cursor: pointer; border-radius: 6px; font-weight:600; transition:all 0.2s;">
          ${index + 1}
        </button>`
        )
        .join('');

      // inline active styling fix
      document.querySelectorAll('.pagination-button').forEach(btn => {
        if(btn.classList.contains('active')) {
          btn.style.background = 'var(--color-primary)';
          btn.style.color = '#ffffff';
          btn.style.borderColor = 'var(--color-primary)';
        }
      });
    }
  }
}

/* ========== PRODUCT DETAIL PAGE MANAGER ========== */

class ProductDetailManager {
  constructor() {
    this.product = null;
    this.init();
  }

  init() {
    this.loadProductFromURL();
    if (!this.product) return;
    this.renderProductDetail();
    this.updateSEOAndMetadata();
    this.setupAccordionListeners();
  }

  loadProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    let productId = params.get('id');

    // Fallback: detect via filename
    if (!productId) {
      const filename = window.location.pathname.split('/').pop();
      if (filename === 'product-dome-camera.html') productId = 'cc001';
      else if (filename === 'product-bullet-camera.html') productId = 'cc002';
      else if (filename === 'product-ip-camera.html') productId = 'cc003';
      else if (filename === 'product-car-gps.html') productId = 'gps001';
      else if (filename === 'product-fleet-gps.html') productId = 'gps002';
      else if (filename === 'product-personal-gps.html') productId = 'gps003';
    }

    const allProducts = [
      ...COMPANY_CONFIG.cctvProducts,
      ...COMPANY_CONFIG.gpsProducts,
    ];
    this.product = allProducts.find((p) => p.id === productId);

    // If still not found, load first product as default to prevent breaking layout
    if (!this.product && allProducts.length > 0) {
      this.product = allProducts[0];
    }
  }

  renderProductDetail() {
    if (!this.product) return;

    const container = document.querySelector('.product-detail-container');
    if (!container) return;

    const formattedPrice = `₹${this.product.price.toLocaleString('en-IN')}`;
    const formattedMRP = `₹${this.product.mrp.toLocaleString('en-IN')}`;
    const formattedWholesale = `₹${this.product.wholesalePrice.toLocaleString('en-IN')}`;
    const savings = this.product.mrp - this.product.price;
    const savingsPercentage = Math.round((savings / this.product.mrp) * 100);

    // Dynamic Specifications Generation
    let specsTableRows = '';
    for (const [key, value] of Object.entries(this.product.specifications || {})) {
      specsTableRows += `
        <tr style="border-bottom:1px solid var(--color-border-light);">
          <td style="padding:14px;font-weight:700;color:var(--color-text-primary);width:35%;font-size:0.95rem;">${key}</td>
          <td style="padding:14px;color:var(--color-text-secondary);font-size:0.95rem;">${value}</td>
        </tr>
      `;
    }

    // Dynamic Gallery Thumbnails
    const galleryImages = this.product.images || [this.product.image];
    const galleryHTML = galleryImages.map((imgUrl, idx) => `
      <div class="gallery-thumbnail ${idx === 0 ? 'active' : ''}" data-index="${idx}" style="cursor:pointer;border:2px solid ${idx === 0 ? 'var(--color-primary)' : 'var(--color-border)'};border-radius:10px;overflow:hidden;width:80px;height:80px;display:flex;align-items:center;justify-content:center;background:var(--color-bg-secondary);transition:all 0.2s;">
        <img src="${imgUrl}" alt="Thumbnail ${idx + 1}" style="max-width:100%;max-height:100%;object-fit:contain;" />
      </div>
    `).join('');

    // Dynamic Related Products
    const allProducts = [...COMPANY_CONFIG.cctvProducts, ...COMPANY_CONFIG.gpsProducts];
    const relatedList = allProducts
      .filter((p) => p.id !== this.product.id && p.category === this.product.category)
      .slice(0, 3);
    
    // Fill with others if not enough related
    if (relatedList.length < 3) {
      const fill = allProducts.filter((p) => p.id !== this.product.id && !relatedList.includes(p)).slice(0, 3 - relatedList.length);
      relatedList.push(...fill);
    }

    const relatedHTML = relatedList.map((p) => {
      let urlPath = `product-detail.html?id=${p.id}`;
      if (p.id === 'cc001') urlPath = 'product-dome-camera.html';
      if (p.id === 'cc002') urlPath = 'product-bullet-camera.html';
      if (p.id === 'cc003') urlPath = 'product-ip-camera.html';
      if (p.id === 'gps001') urlPath = 'product-car-gps.html';
      if (p.id === 'gps002') urlPath = 'product-fleet-gps.html';
      if (p.id === 'gps003') urlPath = 'product-personal-gps.html';
      return `
        <a href="${urlPath}" style="text-decoration:none;color:inherit;background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:16px;padding:20px;display:block;transition:all 0.2s;" class="related-card-hover">
          <div style="height:160px;display:flex;align-items:center;justify-content:center;background:#ffffff;border-radius:12px;padding:10px;margin-bottom:15px;overflow:hidden;">
            <img src="${p.image}" alt="${p.name}" style="max-height:100%;max-width:100%;object-fit:contain;" />
          </div>
          <div style="font-size:0.75rem;text-transform:uppercase;color:var(--color-primary);font-weight:700;margin-bottom:5px;">${p.brand}</div>
          <h4 style="margin:0 0 10px;font-size:1.05rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</h4>
          <div style="font-weight:700;font-size:1.15rem;color:var(--color-text-primary);">₹${p.price.toLocaleString('en-IN')}</div>
        </a>
      `;
    }).join('');

    // Dynamic FAQs Generation (10 detailed accordions)
    const faqs = this.generateFAQData();
    const faqsHTML = faqs.map((faq, idx) => `
      <article class="faq-item" role="listitem" style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:12px;margin-bottom:12px;overflow:hidden;transition:all 0.3s;">
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-panel-${idx + 1}" id="faq-button-${idx + 1}" style="width:100%;text-align:left;padding:20px 24px;background:none;border:none;outline:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-family:'Poppins',sans-serif;font-weight:600;font-size:1.05rem;color:var(--color-text-primary);transition:color 0.2s;">
          <span class="faq-question-text">${faq.q}</span>
          <span class="faq-toggle" style="transition:transform 0.3s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
          </span>
        </button>
        <div class="faq-answer" id="faq-panel-${idx + 1}" role="region" aria-labelledby="faq-button-${idx + 1}" style="max-height:0;opacity:0;overflow:hidden;padding:0 24px;transition:max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;">
          <p style="padding-bottom:20px;line-height:1.7;color:var(--color-text-secondary);font-size:0.95rem;margin:0;">${faq.a}</p>
        </div>
      </article>
    `).join('');

    // Comparison Table Generation
    let comparisonHTML = '';
    if (this.product.comparison) {
      const comp = this.product.comparison;
      comparisonHTML = `
        <div style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:18px;padding:30px;margin-top:40px;box-shadow:var(--shadow-md);">
          <h3 style="font-size:1.35rem;font-weight:700;margin:0 0 20px;color:var(--color-text-primary);">${comp.title}</h3>
          <div style="overflow-x:auto;">
            <table class="specs-table" style="width:100%;border-collapse:collapse;min-width:500px;">
              <thead>
                <tr style="border-bottom:2px solid var(--color-border);background:var(--color-bg-primary);">
                  ${comp.headers.map(h => `<th style="padding:14px;text-align:left;font-weight:700;color:var(--color-text-primary);font-size:0.95rem;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${comp.rows.map((row, rIdx) => `
                  <tr style="border-bottom:1px solid var(--color-border-light);background:${rIdx % 2 === 0 ? 'transparent' : 'rgba(0, 86, 205, 0.02)'};">
                    ${row.map((cell, cIdx) => `<td style="padding:14px;color:var(--color-text-secondary);font-size:0.95rem;font-weight:${cIdx === 0 ? '700' : '400'};">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Assembly of HTML structure
    container.innerHTML = `
      <!-- Breadcrumb Link Fix -->
      <nav aria-label="Breadcrumb" style="margin-bottom:30px;font-size:0.9rem;color:var(--color-text-secondary);">
        <a href="index.html" style="text-decoration:none;color:var(--color-primary);font-weight:600;">Home</a> / 
        <a href="${this.product.id.startsWith('cc') ? 'cctv.html' : 'gps.html'}" style="text-decoration:none;color:var(--color-primary);font-weight:600;">${this.product.id.startsWith('cc') ? 'CCTV' : 'GPS'}</a> / 
        <span style="color:var(--color-text-primary);font-weight:500;">${this.product.name}</span>
      </nav>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:40px;align-items:start;margin-bottom:50px;" class="detail-top-responsive">
        <!-- Left: Image Gallery & Zoom -->
        <div style="display:flex;flex-direction:column;gap:15px;">
          <div class="main-image-wrapper zoom-container" style="position:relative;border-radius:18px;overflow:hidden;background:#ffffff;display:flex;align-items:center;justify-content:center;padding:20px;border:1px solid var(--color-border);cursor:zoom-in;height:450px;">
            <img class="detail-main-img" src="${this.product.image}" alt="${this.product.name}" style="max-width:100%;max-height:100%;object-fit:contain;transition:transform 0.1s ease-out;transform-origin:center;" />
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
            ${galleryHTML}
          </div>
        </div>

        <!-- Right: Specifications Summary & Pricing -->
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div>
            <div style="text-transform:uppercase;color:var(--color-primary);font-weight:800;font-size:0.85rem;letter-spacing:0.12em;margin-bottom:6px;">${this.product.brand} • Model: ${this.product.modelNumber || 'N/A'}</div>
            <h1 style="margin:0 0 10px;font-size:2rem;font-weight:800;color:var(--color-text-primary);line-height:1.2;">${this.product.name}</h1>
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">
              <div style="display:flex;align-items:center;color:#FFB800;font-size:1.15rem;">
                ★★★★★ <span style="color:var(--color-text-secondary);font-size:0.9rem;margin-left:6px;font-weight:600;">(${this.product.rating || '4.8'} / 5.0)</span>
              </div>
              <span style="font-size:0.85rem;padding:4px 10px;border-radius:50px;font-weight:700;background:rgba(46, 204, 113, 0.1);color:#2ECC71;">${this.product.stockStatus || 'In Stock'}</span>
            </div>
          </div>

          <!-- Premium Pricing Table -->
          <div style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);">
            <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:5px;">
              <span style="font-size:2.2rem;font-weight:800;color:var(--color-primary);">${formattedPrice}</span>
              <span style="font-size:1.15rem;text-decoration:line-through;color:var(--color-text-secondary);">${formattedMRP}</span>
              <span style="font-size:0.9rem;padding:3px 8px;background:#e74c3c;color:#ffffff;border-radius:6px;font-weight:700;">Save ${savingsPercentage}%</span>
            </div>
            <div style="font-size:0.85rem;color:var(--color-text-secondary);margin-bottom:15px;font-weight:500;">Offer Price (${this.product.gstInfo || 'Includes GST'})</div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:15px;border-top:1px dashed var(--color-border);font-size:0.9rem;">
              <div><strong>Retail Store Price:</strong><div style="color:var(--color-text-primary);font-weight:600;margin-top:2px;">₹${this.product.retailPrice.toLocaleString('en-IN')}</div></div>
              <div><strong>Wholesale Trade Price:</strong><div style="color:var(--color-primary);font-weight:700;margin-top:2px;">${formattedWholesale}* <span style="font-size:0.75rem;color:var(--color-text-secondary);">(Bulk 10+)</span></div></div>
            </div>
          </div>

          <!-- Feature Bullets (compact) -->
          <div>
            <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px;color:var(--color-text-primary);">Highlights</h3>
            <ul style="margin:0;padding-left:20px;line-height:1.7;color:var(--color-text-secondary);font-size:0.95rem;">
              ${this.product.features.map(f => `<li style="margin-bottom:4px;">${f}</li>`).join('')}
            </ul>
          </div>

          <!-- Primary Actions -->
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;">
            <a href="https://wa.me/919981668234?text=Hi%20Falcon%20Surveillance,%20I'm%20interested%20in%20buying%20${encodeURIComponent(this.product.name)}%20(Model:%20${this.product.modelNumber}).%20Please%20provide%20a%20quote." target="_blank" rel="noopener noreferrer" style="flex:1;min-width:200px;text-align:center;padding:15px 25px;background:#25D366;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:1.05rem;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 20px rgba(37, 211, 102, 0.25);transition:all 0.2s;" class="cta-hover">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.93-2.21-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-.14.24-.7.24-1.29.17-1.41-.08-.12-.27-.2-.57-.35Z"></path></svg>
              WhatsApp Quote
            </a>
            <a href="tel:7049345854" style="flex:1;min-width:200px;text-align:center;padding:15px 25px;background:var(--color-primary);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:1.05rem;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 20px rgba(0, 86, 205, 0.25);transition:all 0.2s;" class="cta-hover">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Call Specialists
            </a>
          </div>
          <div style="font-size:0.85rem;color:var(--color-text-secondary);text-align:center;margin-top:5px;font-weight:500;">
            Email: <a href="mailto:info@falconsurveillance.in" style="color:var(--color-primary);text-decoration:none;font-weight:600;">info@falconsurveillance.in</a> | Office: Subhash Nagar, Shahdol
          </div>
        </div>
      </div>

      <!-- Specs & Details -->
      <div style="margin-top:60px;display:grid;grid-template-columns:1.5fr 1fr;gap:40px;align-items:start;" class="detail-two-col-responsive">
        <div>
          <h2 style="font-size:1.6rem;font-weight:800;color:var(--color-text-primary);margin-bottom:20px;border-bottom:2px solid var(--color-border);padding-bottom:10px;">Technical Specifications</h2>
          <table style="width:100%;border-collapse:collapse;background:var(--color-bg-secondary);border-radius:12px;overflow:hidden;border:1px solid var(--color-border-light);">
            <tbody>
              ${specsTableRows}
            </tbody>
          </table>
        </div>
        
        <div style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:18px;padding:30px;box-shadow:var(--shadow-sm);">
          <h3 style="font-size:1.3rem;font-weight:800;color:var(--color-text-primary);margin:0 0 20px;border-bottom:1px solid var(--color-border-light);padding-bottom:10px;">Pro Guide: Advantages</h3>
          <ul style="margin:0 0 25px;padding-left:20px;line-height:1.7;color:#2ECC71;font-weight:500;">
            ${(this.product.advantages || []).map(a => `<li style="margin-bottom:8px;"><span style="color:var(--color-text-secondary);">${a}</span></li>`).join('')}
          </ul>

          <h3 style="font-size:1.3rem;font-weight:800;color:var(--color-text-primary);margin:0 0 20px;border-bottom:1px solid var(--color-border-light);padding-bottom:10px;">Limitations</h3>
          <ul style="margin:0;padding-left:20px;line-height:1.7;color:#E74C3C;font-weight:500;">
            ${(this.product.disadvantages || []).map(d => `<li style="margin-bottom:8px;"><span style="color:var(--color-text-secondary);">${d}</span></li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Professional Buying Guide -->
      <section style="margin-top:60px;padding:40px;background:linear-gradient(135deg, rgba(0, 86, 205, 0.03), rgba(255, 107, 53, 0.03));border:1px solid var(--color-border-light);border-radius:24px;">
        <h2 style="font-size:1.6rem;font-weight:800;color:var(--color-text-primary);margin:0 0 8px;">Professional Buying & Architecture Guide</h2>
        <p style="color:var(--color-text-secondary);margin-bottom:30px;">Read expert site-planning tips and configurations recommended by Falcon Surveillance engineering team.</p>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:25px;">
          <div style="background:#ffffff;padding:24px;border-radius:16px;border:1px solid var(--color-border-light);">
            <h4 style="margin:0 0 10px;font-weight:700;color:var(--color-text-primary);font-size:1.05rem;">Who Should Buy This?</h4>
            <p style="margin:0;line-height:1.6;font-size:0.95rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.whoShouldBuy || 'Ideal for residential, retail, and commercial security integrations.'}</p>
          </div>
          <div style="background:#ffffff;padding:24px;border-radius:16px;border:1px solid var(--color-border-light);">
            <h4 style="margin:0 0 10px;font-weight:700;color:var(--color-text-primary);font-size:1.05rem;">Recommended Environments</h4>
            <p style="margin:0;line-height:1.6;font-size:0.95rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.whereUsed || 'Suitable for standard security sweep areas and corridors.'}</p>
          </div>
          <div style="background:#ffffff;padding:24px;border-radius:16px;border:1px solid var(--color-border-light);">
            <h4 style="margin:0 0 10px;font-weight:700;color:var(--color-text-primary);font-size:1.05rem;">Installation Placement</h4>
            <p style="margin:0;line-height:1.6;font-size:0.95rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.installationLocation || 'Mount at a height of 8-10 feet with a clear down angle.'}</p>
          </div>
        </div>

        <div style="margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;padding-top:30px;border-top:1px solid var(--color-border);">
          <div><strong>Storage Recommendation:</strong><p style="margin:5px 0 0;font-size:0.9rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.storageRec || 'N/A'}</p></div>
          <div><strong>Network Standard:</strong><p style="margin:5px 0 0;font-size:0.9rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.networkRec || 'N/A'}</p></div>
          <div><strong>Power Supply Hook:</strong><p style="margin:5px 0 0;font-size:0.9rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.powerRec || 'N/A'}</p></div>
          <div><strong>Expected Life Cycle:</strong><p style="margin:5px 0 0;font-size:0.9rem;color:var(--color-text-secondary);">${this.product.buyingGuide?.expectedLife || '5-7 Years'}</p></div>
        </div>

        <div style="margin-top:30px;padding:20px;background:#ffffff;border-radius:12px;border-left:4px solid var(--color-primary);">
          <strong style="display:block;margin-bottom:5px;">Professional Installation Advice:</strong>
          <span style="font-size:0.95rem;color:var(--color-text-secondary);line-height:1.6;">${this.product.buyingGuide?.professionalAdvice || 'Consult a Falcon certified engineer for optimal angle mapping and cabling protection.'}</span>
        </div>
      </section>

      <!-- Comparisons Section -->
      ${comparisonHTML}

      <!-- Recommended / Related Products Section -->
      <section style="margin-top:60px;">
        <h2 style="font-size:1.6rem;font-weight:800;color:var(--color-text-primary);margin:0 0 25px;">Related Products</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:25px;">
          ${relatedHTML}
        </div>
      </section>

      <!-- Ratings & Customer Reviews -->
      <section style="margin-top:60px;border-top:1px solid var(--color-border);padding-top:60px;">
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:40px;" class="detail-two-col-responsive">
          <div style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:18px;padding:30px;text-align:center;">
            <h3 style="font-size:1.35rem;font-weight:800;margin:0 0 10px;">Customer Reviews</h3>
            <div style="font-size:3.5rem;font-weight:800;color:var(--color-text-primary);line-height:1.1;">${this.product.rating || '4.8'}</div>
            <div style="color:#FFB800;font-size:1.4rem;margin:10px 0;">★★★★★</div>
            <div style="color:var(--color-text-secondary);font-size:0.9rem;font-weight:600;">Based on ${this.product.reviews || '125'} verified ratings</div>
          </div>
          <div>
            <h3 style="font-size:1.35rem;font-weight:800;margin:0 0 20px;">Top Reviews</h3>
            <div style="display:flex;flex-direction:column;gap:20px;">
              ${this.generateReviewSnippets()}
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section" id="product-faqs" style="margin-top:60px;border-top:1px solid var(--color-border);padding-top:60px;">
        <div style="max-width:800px;margin:0 auto 40px;text-align:center;">
          <h2 style="font-size:1.8rem;font-weight:800;color:var(--color-text-primary);margin-bottom:12px;">Frequently Asked Questions</h2>
          <p style="color:var(--color-text-secondary);line-height:1.6;">Detailed guidelines regarding specifications, compatibility, storage limits, and professional operations.</p>
        </div>
        <div class="faq-accordion" role="list" style="max-width:900px;margin:0 auto;">
          ${faqsHTML}
        </div>
      </section>
    `;

    // Initialize Interactive Gallery Switcher
    this.setupGalleryListeners();

    // Initialize Zoom Tool
    this.setupZoom();
  }

  setupGalleryListeners() {
    const thumbs = document.querySelectorAll('.gallery-thumbnail');
    const mainImg = document.querySelector('.detail-main-img');
    if (!thumbs || !mainImg) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => {
          t.classList.remove('active');
          t.style.borderColor = 'var(--color-border)';
        });
        thumb.classList.add('active');
        thumb.style.borderColor = 'var(--color-primary)';
        
        const imgUrl = thumb.querySelector('img').src;
        mainImg.src = imgUrl;
      });
    });
  }

  setupZoom() {
    const container = document.querySelector('.zoom-container');
    const img = document.querySelector('.detail-main-img');
    if (!container || !img) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(2)';
    });

    container.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center';
    });
  }

  setupAccordionListeners() {
    const container = document.querySelector('#product-faqs .faq-accordion');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.faq-item'));

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      e.preventDefault();
      
      const item = btn.closest('.faq-item');
      const panel = item.querySelector('.faq-answer');
      const toggle = btn.querySelector('.faq-toggle');
      const isOpen = item.classList.contains('active');

      // Close all other items
      items.forEach((it) => {
        const itPanel = it.querySelector('.faq-answer');
        const itToggle = it.querySelector('.faq-toggle');
        it.classList.remove('active');
        it.style.background = 'var(--color-bg-secondary)';
        itPanel.style.maxHeight = '0px';
        itPanel.style.opacity = '0';
        itPanel.style.padding = '0 24px';
        if (itToggle) itToggle.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        item.classList.add('active');
        item.style.background = 'var(--color-bg-primary)';
        panel.style.maxHeight = panel.scrollHeight + 20 + 'px';
        panel.style.opacity = '1';
        panel.style.padding = '0 24px 20px';
        if (toggle) toggle.style.transform = 'rotate(180deg)';
      }
    });
  }

  generateReviewSnippets() {
    const reviews = COMPANY_CONFIG.customerReviews || [];
    if (reviews.length === 0) return '<p>No reviews yet.</p>';

    return reviews.slice(0, 3).map(r => `
      <div style="background:var(--color-bg-secondary);border:1px solid var(--color-border-light);border-radius:14px;padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div>
            <strong>${r.name}</strong>
            <div style="font-size:0.8rem;color:var(--color-text-secondary);">${r.company} • ${r.location}</div>
          </div>
          <div style="color:#FFB800;">
            ${'★'.repeat(Math.round(r.rating))}
            ${r.verified ? '<span style="font-size:0.75rem;padding:2px 8px;background:rgba(46,204,113,0.1);color:#2ECC71;border-radius:50px;font-weight:700;margin-left:8px;">Verified Partner</span>' : ''}
          </div>
        </div>
        <p style="margin:0;line-height:1.6;font-size:0.95rem;color:var(--color-text-secondary); font-style:italic;">"${r.review}"</p>
      </div>
    `).join('');
  }

  generateFAQData() {
    // Return 10 product-specific FAQs with detailed answers (100-300 words)
    const isCCTV = this.product.id.startsWith('cc');
    
    if (isCCTV) {
      return [
        {
          q: `Does this CCTV camera support remote mobile application access?`,
          a: `Yes, remote access is fully integrated. During installation, our technicians configure secure peer-to-peer cloud routing. We link your CP Plus or Hikvision system with the official mobile applications (gCMOB or Hik-Connect) on your Android, iOS devices, tablets, and laptops. This enables you to stream high-definition live video feeds, review recorded storage, configure push alerts for motion detection, and control motorized lenses securely from anywhere in the world with an internet connection, bypassing complex dynamic DNS setup rules.`
        },
        {
          q: `What storage space is required for a 30-day continuous archive with this camera?`,
          a: `Storage needs depend on video resolution, frame rate, compression standards, and active recording channels. Utilizing the standard H.265+ smart compression algorithm configured on our surveillance-grade Seagate SkyHawk hard disks, this camera records continuously at 1080p resolution while consuming roughly 30GB to 40GB of storage space per day. For a standard 4-camera setup, a 2TB hard disk drive will reliably store between 15 to 20 days of recordings, while an 8TB drive will easily provide a 60-day archive loop. We configure motion-triggered recording modes to optimize capacity.`
        },
        {
          q: `How does infrared night vision perform in absolute zero-light environments?`,
          a: `This surveillance camera features smart infrared (IR) LED technology. In pitch black darkness, a built-in optical sensor detects the light drop and automatically engages the IR arrays, switching the feed to clear monochrome video. The smart IR feature dynamically alters the light emission levels to prevent the whiteout of faces or objects close to the lens. With coverage ranging from 25 to 40 meters depending on the model, you get reliable night monitoring. We also provide hybrid color night-vision systems that trigger warm spotlights when human motion is captured.`
        },
        {
          q: `What is the advantage of using Power over Ethernet (PoE) with IP cameras?`,
          a: `Power over Ethernet (PoE) technology allows single Cat6 Ethernet cables to carry both digital data signals and electrical power to your IP cameras. This eliminates the need to install separate power outlets or run messy DC cabling loops. PoE simplifies your security architecture, cuts conduit costs, and enables centralized power management. Connecting all PoE switch lines to a single centralized online UPS ensures your entire network of security cameras remains active and continues recording during power outages.`
        },
        {
          q: `Is the metallic casing weatherproof and suitable for open outdoor installations in Shahdol?`,
          a: `Our outdoor bullet and PTZ cameras feature an IP67 ingress protection rating. The metallic casing is dustproof and completely protected against water penetration, ensuring uninterrupted operation during heavy rains, dusty winds, and extreme summer temperatures. The camera stands are calibrated with a double-seal gasket to protect connection ports. For indoor cameras (such as dome models), we advise restricted interior setups to avoid humidity degradation.`
        },
        {
          q: `Do you provide professional physical installation and cabling support in Shahdol?`,
          a: `Yes. Falcon Surveillance has an expert team of technicians in Shahdol, MP, operating out of our Subhash Nagar workshop near the IG Bungalow. We handle everything from the initial site inspection and blind-spot planning to running protected PVC conduits, layout wiring, mounting, camera calibration, and networking. This ensures your systems are secure, and cables are protected from weather wear or physical tampering.`
        },
        {
          q: `What are the advantages of choosing an IP network camera over standard analog CCTV loops?`,
          a: `IP network cameras digitize video feeds directly inside the camera head and transmit files over local networks using Ethernet lines (Cat6), allowing resolutions up to 4K. They support smart edge features like virtual tripwire intrusion and face scanning. Analog systems transmit analog raw feeds over BNC coaxial cables to a DVR for digitizing, which limits resolution and lacks AI processing tools. While analog setups are cost-effective, IP systems provide superior clarity, easier expansion, and robust data protection.`
        },
        {
          q: `Can this camera loop be integrated with centralized building alarms or sirens?`,
          a: `Yes, NVR recorders and premium IP cameras support digital I/O alarm ports. We can wire physical door contacts, PIR motion sensors, smoke detectors, and electronic sirens directly to the system. During a tripwire breach, the recorder triggers smart protocols, activating sirens, flashing warnings, locking entryways, or broadcasting notifications to security monitors.`
        },
        {
          q: `What warranty and maintenance support does Falcon Surveillance offer?`,
          a: `We provide a standard 2 to 3-year manufacturer warranty on all cameras and recorders, and a 3-year warranty on Seagate/WD Purple hard disks. In addition, Falcon Surveillance provides physical technical support in Shahdol. We offer structured Annual Maintenance Contracts (AMC) that cover quarterly lens cleanings, cable audits, backup tests, and firmware upgrades.`
        },
        {
          q: `How do I prevent camera lens fogging and moisture build-up during monsoon seasons?`,
          a: `Monsoon humidity can cause condensation inside low-quality camera housings. Our outdoor bullet cameras feature a built-in hermetic seal with a hydrophobic desiccant packet to absorb humidity. During professional installation, we seal cables with weatherproof junction boxes and drip loops to prevent water tracking. Quarterly maintenance includes casing integrity audits to check seal conditions.`
        }
      ];
    } else {
      // GPS FAQ templates
      return [
        {
          q: `How does real-time live location tracking work in remote regions of MP?`,
          a: `Our GPS tracking devices utilize high-sensitivity multi-constellation GNSS chips to communicate with global satellites. The unit calculates location coordinates and transmits data to our cloud servers over 4G/2G GSM cellular networks at 10-second intervals. When vehicles enter cellular blind spots, the tracker stores up to 5,000 coordinate points in its offline flash buffer. Once network coverage is restored, the device uploads this data, ensuring no route logs are lost.`
        },
        {
          q: `How does the remote engine cut-off (immobilization) feature operate?`,
          a: `The immobilization kit utilizes a 12V automotive relay wired into the vehicle ACC ignition or fuel pump line. Using the smartphone application, you can send an engine cut-off command. The cloud server routes this request via cellular bands, opening the relay circuit to disable starting or fuel delivery. For safety, the device executes this command when vehicle speed drops below 20 km/h to prevent high-speed stalls.`
        },
        {
          q: `Will installing this GPS tracker void my car manufacturer warranty?`,
          a: `No. Our technicians perform non-invasive installations, utilizing fused power harnesses and tap-in wiring interfaces that preserve original cabling. For cars with strict warranty requirements, we provide plug-and-play OBD trackers that connect directly to your OBD-II port without splicing any wires.`
        },
        {
          q: `What is a geofence alert and how can it prevent vehicle theft?`,
          a: `Geofencing allows you to draw virtual boundaries on our mapping dashboard around locations like your home, office, or yard. If a vehicle crosses these boundaries, the cloud server triggers instant alerts, sending push notifications, SMS warnings, or email updates to your phone. This helps identify unauthorized use or towing in real time.`
        },
        {
          q: `How much power does the tracker draw from the vehicle battery?`,
          a: `Our GPS trackers feature intelligent sleep modes. When the vehicle is parked, an internal accelerometer detects the static state, powering down cellular and GPS modules to enter sleep mode. In this state, it draws less than 2mA of current, which will not drain your vehicle battery even if parked for weeks. When the vehicle moves, the sensor wakes the device to resume tracking.`
        },
        {
          q: `Is there a backup battery inside the tracker?`,
          a: `Yes, each device features a built-in lithium-polymer backup battery. If an intruder disconnects the car battery or cuts the power wires, the tracker triggers a power-cut alert and continues tracking for 24 to 72 hours, helping you locate and recover the vehicle.`
        },
        {
          q: `What software platforms do you provide for fleet monitoring?`,
          a: `We provide a web-based fleet dashboard and mobile applications for Android and iOS. This software supports tracking multiple vehicles on a single screen, checking speed logs, monitoring driving behaviors, analyzing idle times, managing geofences, and generating excel reports.`
        },
        {
          q: `Can this tracker monitor fuel consumption and prevent fuel theft?`,
          a: `Yes, our fleet and commercial trackers integrate with high-precision digital fuel level sensors. These capacitive sensor rods are installed in the fuel tank to measure levels with 99% accuracy. The system tracks refuelings and sudden drops, sending alerts for anomalies to help eliminate fuel theft.`
        },
        {
          q: `Are your tracking devices compliant with RTO standards for commercial vehicles?`,
          a: `Yes. We supply and configure government-approved AIS140 certified GPS trackers. These devices feature dual eSIM support, emergency panic buttons (SOS), and CDAC server connections, meeting compliance rules for commercial buses, school transports, taxis, and public carriers in Madhya Pradesh.`
        },
        {
          q: `How is the GPS tracker protected from physical tampering or removal?`,
          a: `We install the trackers in concealed locations behind dashboard panels, fuse blocks, or glove compartments, matching the vehicle wiring harness. We also set up automated alerts for power disconnection or device movement, notifying you if tampering occurs.`
        }
      ];
    }
  }

  updateSEOAndMetadata() {
    if (!this.product) return;

    try {
      // Dynamic Page Title
      const titleText = `${this.product.name} | Premium ${this.product.id.startsWith('cc') ? 'CCTV Camera' : 'GPS Tracker'} | Falcon Surveillance Shahdol`;
      document.title = titleText;

      // Dynamic Meta Description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Buy ${this.product.name} by ${this.product.brand} (Model: ${this.product.modelNumber || 'N/A'}). Features: ${this.product.features.slice(0, 3).join(', ')}. Get wholesale/retail prices and professional installation in Shahdol, Madhya Pradesh.`);
      }

      // Dynamic Canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', window.location.origin + window.location.pathname + `?id=${this.product.id}`);

      // Dynamic Open Graph & Twitter Tags
      const metaMappings = {
        'og:title': titleText,
        'og:description': this.product.description,
        'og:image': window.location.origin + '/' + this.product.image,
        'og:url': window.location.href,
        'twitter:title': titleText,
        'twitter:description': this.product.description,
        'twitter:image': window.location.origin + '/' + this.product.image
      };

      for (const [property, value] of Object.entries(metaMappings)) {
        let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
        if (el) {
          el.setAttribute('content', value);
        } else {
          el = document.createElement('meta');
          if (property.startsWith('og:')) {
            el.setAttribute('property', property);
          } else {
            el.setAttribute('name', property);
          }
          el.setAttribute('content', value);
          document.head.appendChild(el);
        }
      }

      // Inject / Update JSON-LD schemas
      this.injectStructuredData();
    } catch (e) {
      console.error('Error updating dynamic SEO metadata', e);
    }
  }

  injectStructuredData() {
    let schemaScript = document.getElementById('dynamic-structured-schemas');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'dynamic-structured-schemas';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const faqs = this.generateFAQData();
    const isCCTV = this.product.id.startsWith('cc');
    const categoryName = isCCTV ? 'CCTV Security Systems' : 'GPS Tracking Devices';
    const categoryUrl = isCCTV ? 'cctv.html' : 'gps.html';

    const structuredData = [
      // Product Schema
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": this.product.name,
        "image": window.location.origin + '/' + this.product.image,
        "description": this.product.description,
        "model": this.product.modelNumber || 'N/A',
        "brand": {
          "@type": "Brand",
          "name": this.product.brand
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": this.product.price,
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": this.product.price,
            "priceCurrency": "INR",
            "valueAddedTaxIncluded": "true"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": this.product.rating || "4.8",
          "reviewCount": this.product.reviews || "125",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      // Breadcrumb Schema
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin + "/index.html"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": window.location.origin + "/" + categoryUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": this.product.name,
            "item": window.location.href
          }
        ]
      },
      // FAQ Page Schema
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ];

    schemaScript.textContent = JSON.stringify(structuredData, null, 2);
  }
}

// Global Category URL helper mapping
function getCategoryUrl(categoryId) {
  const map = {
    'bullet-camera': 'bullet-camera.html',
    'dome-camera': 'dome-camera.html',
    'ptz-camera': 'ptz-camera.html',
    'ip-camera': 'ip-camera.html',
    'wifi-camera': 'wireless-cctv.html',
    'wireless-camera': 'wireless-cctv.html',
    'access-control': 'access-control.html',
    'biometric': 'biometric-system.html',
    'video-door-phone': 'video-door-phone.html',
    'boom-barrier': 'boom-barrier.html',
    'fire-alarm': 'fire-alarm.html',
    'car-gps': 'car-gps.html',
    'bike-gps': 'bike-gps.html',
    'bus-gps': 'bus-gps.html',
    'truck-gps': 'truck-gps.html',
    'fleet-gps': 'fleet-tracking.html',
    'personal-gps': 'vehicle-gps.html'
  };

  if (map[categoryId]) return map[categoryId];

  // Fallback map to cctv.html or gps.html with category filter parameter
  const cctvCats = [
    'indoor-camera', 'outdoor-camera', '4g-camera', 'solar-camera',
    'nvr', 'dvr', 'xvr', 'smps', 'hard-disk', 'poe-switch', 'network-switch',
    'accessories', 'motion-sensor', 'alarm-system'
  ];
  if (cctvCats.includes(categoryId)) {
    return `cctv.html?category=${categoryId}`;
  }
  return `gps.html?category=${categoryId}`;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a catalog page with a products grid and filter controls
  if (document.querySelector('.products-grid') && document.querySelector('.filter-panel') && !window.productManager) {
    const manager = new ProductManager();
    window.productManager = manager; // Expose globally
  }

  // Check if we're on a page with a product detail container
  if (document.querySelector('.product-detail-container')) {
    new ProductDetailManager();
  }
});
