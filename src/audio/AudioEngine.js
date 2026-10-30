export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.analyser = null;
    this.dataArray = null;
    this.miniCanvas = document.getElementById('audio-mini-visualizer');
    this.bigCanvas = document.getElementById('synth-big-canvas');
    this.miniCtx = this.miniCanvas ? this.miniCanvas.getContext('2d') : null;
    this.bigCtx = this.bigCanvas ? this.bigCanvas.getContext('2d') : null;

    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.masterGain = null;
    this.filter = null;
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }

    return this.isPlaying;
  }

  start() {
    if (!this.ctx) this.init();
    this.isPlaying = true;

    // Fade in master gain
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

    // Deep Sub Bass Drone (F#1 - 46.25 Hz & C#2 - 69.30 Hz)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(46.25, this.ctx.currentTime);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(69.30, this.ctx.currentTime);

    // LFO for filter sweep (Techno breathing pulse)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(450, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();
    this.lfo = lfo;

    this.droneOsc1.connect(this.filter);
    this.droneOsc2.connect(this.filter);

    this.droneOsc1.start();
    this.droneOsc2.start();

    // Start rhythmic techno modular pulse sequence
    this.startPulseSequence();
  }

  startPulseSequence() {
    if (!this.isPlaying) return;

    // Periodic soft click / high-tech beep
    this.seqTimer = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.playTick();
    }, 428); // ~140 BPM pulse
  }

  playTick() {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      // Ignore audio interruption
    }
  }

  triggerBass() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

    osc.connect(gain);
    gain.connect(this.analyser);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.9);
  }

  triggerArp() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const notes = [220, 277.18, 329.63, 440, 554.37, 659.25];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.analyser);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      }, i * 75);
    });
  }

  triggerDrop() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Orchestral tension riser + heavy impact
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 1.2, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(100, this.ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + 0.9);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.analyser);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 1.25);
  }

  stop() {
    this.isPlaying = false;
    if (this.seqTimer) clearInterval(this.seqTimer);

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);

      setTimeout(() => {
        try {
          if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
          if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
          if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); }
        } catch (e) {}
      }, 650);
    }
  }

  getIntensity() {
    if (!this.isPlaying || !this.analyser || !this.dataArray) {
      return 0;
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / (this.dataArray.length * 255);
  }

  renderVisualizers() {
    // 1. Mini Top Nav Visualizer
    if (this.miniCtx && this.miniCanvas) {
      this.miniCtx.clearRect(0, 0, this.miniCanvas.width, this.miniCanvas.height);
      const barCount = 7;
      const barWidth = 3;
      const gap = 3;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 3;
        if (this.isPlaying && this.dataArray) {
          const val = this.dataArray[i * 2] || 0;
          barHeight = Math.max(3, (val / 255) * 16);
        } else {
          barHeight = 2 + Math.sin(Date.now() * 0.005 + i) * 1.5;
        }

        const gradient = this.miniCtx.createLinearGradient(0, 18, 0, 0);
        gradient.addColorStop(0, '#7928ca');
        gradient.addColorStop(1, '#ff2a85');

        this.miniCtx.fillStyle = gradient;
        this.miniCtx.fillRect(i * (barWidth + gap) + 4, 18 - barHeight, barWidth, barHeight);
      }
    }

    // 2. Big Synth Lab Visualizer
    if (this.bigCtx && this.bigCanvas) {
      this.bigCtx.clearRect(0, 0, this.bigCanvas.width, this.bigCanvas.height);
      const width = this.bigCanvas.width;
      const height = this.bigCanvas.height;

      const barCount = 32;
      const barWidth = (width / barCount) - 4;

      for (let i = 0; i < barCount; i++) {
        let val = 0;
        if (this.isPlaying && this.dataArray) {
          val = this.dataArray[i % this.dataArray.length] / 255;
        } else {
          val = (Math.sin(Date.now() * 0.003 + i * 0.4) * 0.5 + 0.5) * 0.25;
        }

        const barHeight = Math.max(4, val * (height - 20));
        const x = i * (barWidth + 4) + 2;
        const y = height - barHeight - 10;

        const grad = this.bigCtx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#4c1d95');
        grad.addColorStop(0.6, '#9d4edd');
        grad.addColorStop(1, '#ff2a85');

        this.bigCtx.fillStyle = grad;
        this.bigCtx.fillRect(x, y, barWidth, barHeight);

        // Neon cap
        this.bigCtx.fillStyle = '#ffffff';
        this.bigCtx.fillRect(x, y - 2, barWidth, 2);
      }
    }
  }
}
