export class VideoModal {
  constructor() {
    this.modal = document.getElementById('video-modal');
    this.videoEl = document.getElementById('modal-video-element');
    this.titleEl = document.getElementById('modal-video-title');
    this.bpmEl = document.getElementById('modal-video-bpm');
    this.descEl = document.getElementById('modal-video-desc');
    this.closeBtn = document.getElementById('modal-close-btn');
    this.backdrop = this.modal ? this.modal.querySelector('.modal-backdrop') : null;
    this.fxToggle = document.getElementById('modal-fx-toggle');
    this.crtOverlay = document.getElementById('modal-crt-overlay');

    this.init();
  }

  init() {
    if (!this.modal) return;

    // Hover previews on cards
    const cards = document.querySelectorAll('.video-card');
    cards.forEach((card) => {
      const previewVideo = card.querySelector('.card-video-preview');

      card.addEventListener('mouseenter', () => {
        if (previewVideo) {
          previewVideo.currentTime = 0;
          previewVideo.play().catch(() => {});
        }
      });

      card.addEventListener('mouseleave', () => {
        if (previewVideo) {
          previewVideo.pause();
        }
      });

      // Click to open modal
      card.addEventListener('click', () => {
        const src = card.getAttribute('data-video-src');
        const title = card.getAttribute('data-video-title');
        const bpm = card.getAttribute('data-video-bpm');
        const desc = card.getAttribute('data-video-desc');
        this.open(src, title, bpm, desc);
      });
    });

    // Close listeners
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('is-open')) {
        this.close();
      }
    });

    // CRT Scanlines FX toggle
    if (this.fxToggle && this.crtOverlay) {
      this.fxToggle.addEventListener('click', () => {
        this.crtOverlay.classList.toggle('is-active');
        this.fxToggle.classList.toggle('active');
      });
    }
  }

  open(src, title, bpm, desc) {
    if (!this.modal || !this.videoEl) return;

    this.videoEl.src = src;
    if (this.titleEl) this.titleEl.textContent = title || 'DISFOCUS LIVE CAPTURE';
    if (this.bpmEl) this.bpmEl.textContent = bpm || '140 BPM';
    if (this.descEl) this.descEl.textContent = desc || '';

    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.videoEl.play().catch(() => {});
  }

  close() {
    if (!this.modal || !this.videoEl) return;

    this.videoEl.pause();
    this.videoEl.currentTime = 0;
    this.videoEl.src = '';

    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
