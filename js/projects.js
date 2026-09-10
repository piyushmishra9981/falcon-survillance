/* ============================================================
   FALCON SURVEILLANCE - PROJECTS SHOWCASE
   ============================================================ */

class ProjectShowcase {
  constructor() {
    this.filters = document.querySelectorAll('[data-project-filter]');
    this.cards = document.querySelectorAll('.project-card');
    this.init();
  }

  init() {
    this.filters.forEach((button) => {
      button.addEventListener('click', () => this.filterProjects(button.dataset.projectFilter));
    });
  }

  filterProjects(category) {
    this.filters.forEach((button) => button.classList.toggle('active', button.dataset.projectFilter === category));

    this.cards.forEach((card) => {
      const matches = category === 'all' || card.dataset.projectCategory === category;
      card.classList.toggle('is-hidden', !matches);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-project-filter]')) new ProjectShowcase();
  });
} else if (document.querySelector('[data-project-filter]')) {
  new ProjectShowcase();
}
