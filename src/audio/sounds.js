/**
 * INNOVRUSH 2K26 — Procedural Web Audio Sound Synthesizer
 * Zero external audio files required. Produces authentic sci-fi cinematic audio.
 */

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(mute) {
    this.muted = mute;
  }

  // Soft subtle UI tick on hover
  playHover() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Futuristic metallic click
  playClick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Cinematic gold laser sweep (for poster & domain transitions)
  playLaserSweep() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.45);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.7);
    } catch (e) {}
  }

  // Surprise Constraints Reveal Fanfare
  playConstraintUnlock() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Glitch burst oscillator
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(220, t);
      osc1.frequency.setValueAtTime(880, t + 0.08);
      osc1.frequency.setValueAtTime(440, t + 0.16);
      osc1.frequency.setValueAtTime(1320, t + 0.24);

      gain1.gain.setValueAtTime(0.07, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.4);

      // Deep resonant gold surge
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(90, t + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(440, t + 0.7);

      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.linearRampToValueAtTime(0.12, t + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.15);
      osc2.stop(t + 1.2);
    } catch (e) {}
  }

  // Timer Tick
  playTimerTick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Cinematic Engine / Turbine Spool
  playEngineSpool() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 2.0);
      osc.frequency.exponentialRampToValueAtTime(80, t + 3.5);

      // Lowpass filter for deep motor purr
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 2.0);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 3.8);
    } catch (e) {}
  }

  // Dual Laser Headlight Ignite
  playLaserIgnite() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(240, t + 0.25);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  // 3D Camera Whoosh Sweep
  playWhoosh() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.7);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    } catch (e) {}
  }

  // Deep Sub-bass Impact on Hero Reveal
  playBassDrop() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.9);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    } catch (e) {}
  }

  // Hyperspace Reveal Transition
  playWarp() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.55);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.75);
    } catch (e) {}
  }
}

export const sounds = new SoundFX();
