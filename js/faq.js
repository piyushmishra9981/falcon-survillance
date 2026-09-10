/*
  Robust accessible FAQ accordion
  - Delegated handling per accordion
  - Smooth expand/collapse using max-height + opacity
  - Single-open enforcement, keyboard support, ARIA updates
*/

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.faq-accordion, .faq-grid');

  accordions.forEach((container) => {
    const items = Array.from(container.querySelectorAll('.faq-item'));
    if (!items.length) return;

    // initialize
    items.forEach((item, idx) => {
      const btn = item.querySelector('.faq-question');
      const panel = item.querySelector('.faq-answer');
      if (!btn || !panel) return;

      const btnId = btn.id || `faq-button-${idx + 1}`;
      const panelId = panel.id || `faq-panel-${idx + 1}`;
      btn.id = btnId;
      panel.id = panelId;

      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');

      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      panel.style.transition = 'max-height 360ms ease, opacity 240ms ease, padding 240ms ease';
    });

    const closeItem = (it) => {
      const btn = it.querySelector('.faq-question');
      const panel = it.querySelector('.faq-answer');
      if (!btn || !panel) return;
      it.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');

      // animate collapse from current height -> 0
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      // force layout so transition happens
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight;
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
      });
    };

    const openItem = (it) => {
      const btn = it.querySelector('.faq-question');
      const panel = it.querySelector('.faq-answer');
      if (!btn || !panel) return;
      it.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');

      // set to exact height to animate
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.style.opacity = '1';

      // after transition, allow natural height by clearing maxHeight
      const onEnd = () => {
        panel.style.maxHeight = 'none';
        panel.removeEventListener('transitionend', onEnd);
      };
      panel.addEventListener('transitionend', onEnd);
    };

    // click delegation
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn || !container.contains(btn)) return;
      e.preventDefault();
      const item = btn.closest('.faq-item');
      if (!item) return;

      const isOpen = item.classList.contains('active');
      // close all first
      items.forEach((it) => {
        // if an item is open, collapse it
        if (it.classList.contains('active')) closeItem(it);
      });

      if (!isOpen) openItem(item);
    });

    // keyboard: Enter or Space toggles
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });

    // maintain open heights on resize
    window.addEventListener('resize', () => {
      items.forEach((it) => {
        const panel = it.querySelector('.faq-answer');
        if (!panel) return;
        if (it.classList.contains('active')) {
          // if maxHeight was cleared, set to current scrollHeight to avoid clipping
          if (getComputedStyle(panel).maxHeight === 'none') {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
            // clear after a tick
            setTimeout(() => {
              panel.style.maxHeight = 'none';
            }, 350);
          } else {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
          }
        }
      });
    });
  });
});
