/* ============================================================
   FALCON SURVEILLANCE - HERO IMAGE SLIDER
   Premium background image slider with fade transitions
   ============================================================ */

class HeroSlider {
  constructor(containerId = 'hero', images = [], autoChangeInterval = 3000) {
    this.container = document.getElementById(containerId);
    this.images = images;
    this.autoChangeInterval = autoChangeInterval;
    this.currentSlide = 0;
    this.autoChangeTimeout = null;
    
    if (!this.container || this.images.length === 0) {
      console.warn('HeroSlider: Container or images not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    this.createSliderHTML();
    this.setupEventListeners();
    this.startAutoChange();
  }
  
  createSliderHTML() {
    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'hero-slider-container';
    
    // Create slides
    this.images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide';
      if (index === 0) slide.classList.add('active');
      slide.style.backgroundImage = `linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('${image}')`;
      sliderContainer.appendChild(slide);
    });
    
    // Insert at the beginning of hero
    this.container.insertBefore(sliderContainer, this.container.firstChild);
    
    // Create controls
    if (this.images.length > 1) {
      this.createControls();
    }
  }
  
  createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'hero-slider-controls';
    
    this.images.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero-slider-dot';
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => this.goToSlide(index));
      controlsContainer.appendChild(dot);
    });
    
    this.container.appendChild(controlsContainer);
    this.dots = controlsContainer.querySelectorAll('.hero-slider-dot');
  }
  
  showSlide(index) {
    if (index < 0) index = this.images.length - 1;
    if (index >= this.images.length) index = 0;
    
    const slides = this.container.querySelectorAll('.hero-slide');
    
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    // Update dots
    if (this.dots) {
      this.dots.forEach(dot => dot.classList.remove('active'));
      this.dots[index].classList.add('active');
    }
    
    this.currentSlide = index;
  }
  
  goToSlide(index) {
    this.showSlide(index);
    this.restartAutoChange();
  }
  
  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }
  
  prevSlide() {
    this.showSlide(this.currentSlide - 1);
  }
  
  startAutoChange() {
    if (this.images.length <= 1) return;
    
    this.autoChangeTimeout = setInterval(() => {
      this.nextSlide();
    }, this.autoChangeInterval);
  }
  
  restartAutoChange() {
    clearInterval(this.autoChangeTimeout);
    this.startAutoChange();
  }
  
  stop() {
    clearInterval(this.autoChangeTimeout);
  }
  
  resume() {
    this.startAutoChange();
  }
}

// Initialize hero slider when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const heroImages = [
    'assets/images/home-one/cctv_surveillance_system.webp',
    'assets/images/falcon_surveillance.webp',
    'assets/images/falcon_Surveillance_cameras.webp',
    'assets/images/home-one/vhickle_tracking_system.webp',
    'assets/images/best_service_provider.webp'
  ];
  
  const heroSlider = new HeroSlider('hero', heroImages, 3000);
  
  // Pause on hover
  const heroContainer = document.getElementById('hero');
  if (heroContainer) {
    heroContainer.addEventListener('mouseenter', () => heroSlider.stop());
    heroContainer.addEventListener('mouseleave', () => heroSlider.resume());
  }
  
  // Make slider globally accessible for debugging
  window.heroSlider = heroSlider;
});
