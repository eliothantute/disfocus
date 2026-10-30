import Lenis from 'lenis';
import gsap from 'gsap';
import { SceneManager } from './webgl/SceneManager.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { Cursor } from './components/Cursor.js';
import { VideoModal } from './components/VideoModal.js';
import { VideoCardsAnimation } from './components/VideoCardsAnimation.js';

class DisfocusApp {
  constructor() {
    this.sceneManager = null;
    this.audioEngine = null;
    this.cursor = null;
    this.videoModal = null;
    this.videoCardsAnim = null;
    this.lenis = null;
    this.lastTime = performance.now();

    this.init();
  }

  init() {
    // 1. Smooth Scroll (Lenis)
    this.initSmoothScroll();

    // 2. WebGL Scene (Three.js 3D Hero + Particles)
    try {
      this.sceneManager = new SceneManager();
    } catch (e) {
      console.warn('WebGL error:', e);
    }

    // 3. Audio Engine
    this.audioEngine = new AudioEngine();

    // 4. Cursor
    this.cursor = new Cursor();

    // 5. Video Modal & Hover Previews
    this.videoModal = new VideoModal();

    // 6. Video Cards 3D Tilt, Glare, HUD & Scroll Animations
    this.videoCardsAnim = new VideoCardsAnimation();

    // 7. UI Controls & Interactions
    this.bindUIEvents();

    // 8. Entrance Animations
    this.initEntranceAnimations();

    // 9. Start Render Loop
    this.startRenderLoop();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl && this.lenis) {
          this.lenis.scrollTo(targetEl, { offset: -40, duration: 1.2 });
        }
      });
    });
  }

  bindUIEvents() {
    // Audio Toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioLabel = document.getElementById('audio-btn-label');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isPlaying = this.audioEngine.toggle();
        audioBtn.classList.toggle('is-active', isPlaying);
        if (audioLabel) audioLabel.textContent = isPlaying ? 'SOUND [ON]' : 'SOUND';
      });
    }

    // Minimal Synth Triggers
    const bassBtn = document.getElementById('synth-trigger-bass');
    const arpBtn = document.getElementById('synth-trigger-arp');
    const impactBtn = document.getElementById('synth-trigger-impact');

    if (bassBtn) {
      bassBtn.addEventListener('click', () => {
        this.audioEngine.triggerBass();
        bassBtn.classList.add('active');
        setTimeout(() => bassBtn.classList.remove('active'), 400);
      });
    }

    if (arpBtn) {
      arpBtn.addEventListener('click', () => {
        this.audioEngine.triggerArp();
        arpBtn.classList.add('active');
        setTimeout(() => arpBtn.classList.remove('active'), 500);
      });
    }

    if (impactBtn) {
      impactBtn.addEventListener('click', () => {
        this.audioEngine.triggerDrop();
        impactBtn.classList.add('active');
        setTimeout(() => impactBtn.classList.remove('active'), 700);
      });
    }

    // 1-Click Copy Buttons
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '✓ OK';
            btn.style.background = '#27c93f';
            btn.style.borderColor = '#27c93f';
            btn.style.color = '#000';

            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.style.borderColor = '';
              btn.style.color = '';
            }, 1800);
          });
        }
      });
    });

    // 8. Spotlight Video Player
    this.initSpotlightPlayer();
  }

  initSpotlightPlayer() {
    const video = document.getElementById('spotlight-video-element');
    const playBtn = document.getElementById('spotlight-center-play-btn');
    const listenBtn = document.getElementById('spotlight-listen-btn');
    const soundBtn = document.getElementById('spotlight-sound-toggle');
    const expandBtn = document.getElementById('spotlight-expand-btn');
    const iconMuted = document.getElementById('spotlight-icon-muted');
    const iconSound = document.getElementById('spotlight-icon-sound');
    const soundText = document.getElementById('spotlight-sound-text');
    const progressBar = document.getElementById('spotlight-progress-bar');
    const playSvg = playBtn ? playBtn.querySelector('.play-svg') : null;
    const pauseSvg = playBtn ? playBtn.querySelector('.pause-svg') : null;

    if (!video) return;

    const setPlayState = (isPlaying) => {
      if (playSvg && pauseSvg) {
        if (isPlaying) {
          playSvg.classList.add('hidden');
          pauseSvg.classList.remove('hidden');
        } else {
          playSvg.classList.remove('hidden');
          pauseSvg.classList.add('hidden');
        }
      }
      if (playBtn) {
        if (isPlaying) {
          playBtn.classList.add('is-playing');
        } else {
          playBtn.classList.remove('is-playing');
        }
      }
    };

    const updateSoundUI = (hasSound) => {
      if (iconMuted && iconSound && soundText && soundBtn) {
        if (hasSound) {
          iconMuted.classList.add('hidden');
          iconSound.classList.remove('hidden');
          soundText.textContent = 'SON ACTIF';
          soundBtn.classList.add('active');
        } else {
          iconMuted.classList.remove('hidden');
          iconSound.classList.add('hidden');
          soundText.textContent = 'SON COUPÉ';
          soundBtn.classList.remove('active');
        }
      }
    };

    const togglePlay = (unmute = false) => {
      if (video.paused) {
        if (unmute) {
          video.muted = false;
          updateSoundUI(true);
        }
        video.play().then(() => {
          setPlayState(true);
        }).catch(() => {});
      } else {
        video.pause();
        setPlayState(false);
      }
    };

    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay(false);
      });
    }

    const playerCard = document.getElementById('spotlight-player-card');
    if (playerCard) {
      playerCard.addEventListener('click', (e) => {
        if (e.target.closest('#spotlight-sound-toggle') || e.target.closest('#spotlight-expand-btn')) return;
        togglePlay(false);
      });
    }

    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        togglePlay(true);
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        updateSoundUI(!video.muted);
      });
    }

    video.addEventListener('timeupdate', () => {
      if (progressBar && video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${pct}%`;
      }
    });

    video.addEventListener('ended', () => {
      setPlayState(false);
    });

    if (expandBtn && this.videoModal) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.pause();
        setPlayState(false);
        this.videoModal.open(
          '/assets/videos/disfocus-tiktok-session.mp4',
          'DISFOCUS — ID (STUDIO LIVE)',
          '160 BPM',
          'Session live TikTok exclusive // #acidtechno #unreleasedsong #studiosession #hardtechno'
        );
      });
    }
  }

  initEntranceAnimations() {
    gsap.from('#hero-glitch-logo', {
      duration: 1.5,
      scale: 0.92,
      opacity: 0,
      ease: 'power4.out',
      delay: 0.2
    });
  }

  startRenderLoop() {
    const loop = (currentTime) => {
      const deltaTime = (currentTime - this.lastTime) * 0.001;
      this.lastTime = currentTime;

      if (this.lenis) {
        this.lenis.raf(currentTime);
      }

      let audioVal = 0;
      if (this.audioEngine) {
        audioVal = this.audioEngine.getIntensity();
        this.audioEngine.renderVisualizers();
      }

      if (this.sceneManager) {
        this.sceneManager.setAudioIntensity(audioVal);
        this.sceneManager.render(deltaTime);
      }

      if (this.cursor) {
        this.cursor.update();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DisfocusApp();
});
