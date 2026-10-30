import gsap from 'gsap';

export class VideoCardsAnimation {
  constructor() {
    this.cards = document.querySelectorAll('.video-card');
    if (!this.cards.length) return;

    this.init();
  }

  init() {
    this.setupCardDecorations();
    this.setup3DTilt();
    this.setupScrollEntrance();
  }

  setupCardDecorations() {
    this.cards.forEach((card) => {
      // Add animated conic border, corner brackets, and glare overlay
      const borderEl = document.createElement('div');
      borderEl.className = 'card-neon-border';

      const glareEl = document.createElement('div');
      glareEl.className = 'card-glare';

      const cornerTL = document.createElement('span');
      cornerTL.className = 'card-corner top-left';
      const cornerTR = document.createElement('span');
      cornerTR.className = 'card-corner top-right';
      const cornerBL = document.createElement('span');
      cornerBL.className = 'card-corner bottom-left';
      const cornerBR = document.createElement('span');
      cornerBR.className = 'card-corner bottom-right';

      // Play button radar pulse waves
      const playBtn = card.querySelector('.play-btn-circle');
      if (playBtn) {
        const pulseRing = document.createElement('div');
        pulseRing.className = 'play-pulse-ring';
        playBtn.appendChild(pulseRing);
      }

      card.appendChild(borderEl);
      card.appendChild(glareEl);
      card.appendChild(cornerTL);
      card.appendChild(cornerTR);
      card.appendChild(cornerBL);
      card.appendChild(cornerBR);
    });
  }

  setup3DTilt() {
    this.cards.forEach((card) => {
      let bounds;
      const glare = card.querySelector('.card-glare');

      const onMouseEnter = () => {
        bounds = card.getBoundingClientRect();
        card.style.transition = 'transform 0.15s ease-out, border-color 0.4s ease, box-shadow 0.4s ease';
      };

      const onMouseMove = (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = (mouseX / bounds.width - 0.5) * 2; // -1 to +1
        const yPct = (mouseY / bounds.height - 0.5) * 2; // -1 to +1

        const rotateX = -yPct * 12; // Max 12 deg tilt
        const rotateY = xPct * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255, 42, 133, 0.22) 0%, rgba(157, 78, 221, 0.1) 45%, transparent 70%)`;
        }
      };

      const onMouseLeave = () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glare) {
          glare.style.opacity = '0';
        }
      };

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  setupScrollEntrance() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              {
                opacity: 0,
                y: 80,
                rotateX: 18,
                scale: 0.94
              },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: 1,
                duration: 1.1,
                ease: 'power3.out'
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    this.cards.forEach((card) => observer.observe(card));
  }
}
