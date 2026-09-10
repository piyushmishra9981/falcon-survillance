/* ============================================================
   FALCON SURVEILLANCE - THEME TOGGLE
   Automatic theme detection and manual toggle functionality
   ============================================================ */

class ThemeManager {
  constructor() {
    this.storageKey = 'falcon-theme-preference';
    this.darkModeClass = 'dark-mode';
    this.lightModeClass = 'light-mode';
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  init() {
    this.setTheme();
    this.setupEventListeners();
    this.systemPrefersDark.addEventListener('change', () => this.handleSystemThemeChange());
  }

  /**
   * Get the theme preference from localStorage or system
   */
  getThemePreference() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return stored;
    }
    return this.systemPrefersDark.matches ? 'dark' : 'light';
  }

  /**
   * Set the theme on the document
   */
  setTheme(theme = null) {
    const currentTheme = theme || this.getThemePreference();

    // Remove both classes first
    document.documentElement.classList.remove(this.darkModeClass, this.lightModeClass);
    document.body.classList.remove(this.darkModeClass, this.lightModeClass);

    // Apply the appropriate class
    if (currentTheme === 'dark') {
      document.documentElement.classList.add(this.darkModeClass);
      document.body.classList.add(this.darkModeClass);
    } else {
      document.documentElement.classList.add(this.lightModeClass);
      document.body.classList.add(this.lightModeClass);
    }

    // Update meta theme-color
    this.updateMetaThemeColor(currentTheme);

    // Dispatch custom event
    this.dispatchThemeChangeEvent(currentTheme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const current = this.getThemePreference();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, newTheme);
    this.setTheme(newTheme);
  }

  /**
   * Handle system theme preference changes
   */
  handleSystemThemeChange() {
    const stored = localStorage.getItem(this.storageKey);
    // Only apply system change if user hasn't manually set a preference
    if (!stored) {
      const newTheme = this.systemPrefersDark.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
    }
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  updateMetaThemeColor(theme) {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const color = theme === 'dark' ? '#0F172A' : '#FFFFFF';
      metaTheme.setAttribute('content', color);
    }
  }

  /**
   * Dispatch custom event for theme changes
   */
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: { theme },
      bubbles: true,
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
   * Setup event listeners for theme toggle button
   */
  setupEventListeners() {
    const themeToggleBtn = document.querySelector('[data-theme-toggle]');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
        this.updateToggleButtonState(themeToggleBtn);
      });

      // Set initial button state
      this.updateToggleButtonState(themeToggleBtn);
    }

    // Listen for theme changes to update button state
    document.documentElement.addEventListener('themechange', (e) => {
      const themeToggleBtn = document.querySelector('[data-theme-toggle]');
      if (themeToggleBtn) {
        this.updateToggleButtonState(themeToggleBtn);
      }
    });
  }

  /**
   * Update toggle button appearance
   */
  updateToggleButtonState(btn) {
    const isDark = this.getThemePreference() === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.innerHTML = isDark
      ? '<span class="icon-inline" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm8-6a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1Zm-15 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h1Zm10.66 7.66a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM8.46 7.46a1 1 0 0 1 0 1.41L7.75 9.58a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0Zm8.2-1.41a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM8.46 16.54a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"></path></svg></span>'
      : '<span class="icon-inline" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg></span>';
  }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
  });
} else {
  new ThemeManager();
}
