export class Cursor {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    if (!this.cursor) return;

    this.dot = this.cursor.querySelector('.cursor-dot');
    this.ring = this.cursor.querySelector('.cursor-ring');

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });

    // Magnetic buttons & interactive elements
    this.setupMagneticElements();
  }

  setupMagneticElements() {
    const interactables = document.querySelectorAll('a, button, .video-card, .gallery-item, [data-magnetic]');
    
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        if (el.hasAttribute('data-magnetic')) {
          el.style.transform = '';
        }
      });

      if (el.hasAttribute('data-magnetic')) {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.25;
          const deltaY = (e.clientY - centerY) * 0.25;

          el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
      }
    });
  }

  update() {
    if (!this.cursor) return;

    // Smooth inertia
    this.pos.x += (this.target.x - this.pos.x) * 0.2;
    this.pos.y += (this.target.y - this.pos.y) * 0.2;

    this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
  }
}
