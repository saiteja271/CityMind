/**
 * SoundEngine - Comprehensive Web Audio API Synthesizer engine.
 * Generates ambient city sounds, traffic hum, emergency sirens, weather FX, construction hammering,
 * UI clicks, spatial 2D audio, and procedural chord progression soundtrack without external assets.
 */

export class SoundEngine {
  constructor(options = {}) {
    this.audioCtx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.uiGain = null;

    this.isMuted = false;
    this.masterVolume = options.masterVolume ?? 0.8;
    this.ambientVolume = options.ambientVolume ?? 0.5;
    this.sfxVolume = options.sfxVolume ?? 0.7;
    this.musicVolume = options.musicVolume ?? 0.4;
    this.uiVolume = options.uiVolume ?? 0.6;

    // Soundtrack state machine
    this.musicState = {
      playing: false,
      bpm: 72,
      scale: [0, 2, 4, 7, 9], // Major pentatonic degrees (C, D, E, G, A)
      rootFreq: 130.81, // C3
      currentChord: 0,
      step: 0,
      timerId: null
    };

    // Active ambient loops
    this._trafficNode = null;
    this._rainNode = null;
    this._sirenOsc = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();

    // Node graph setup
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.connect(this.audioCtx.destination);

    this.ambientGain = this.audioCtx.createGain();
    this.ambientGain.gain.value = this.ambientVolume;
    this.ambientGain.connect(this.masterGain);

    this.sfxGain = this.audioCtx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.audioCtx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.uiGain = this.audioCtx.createGain();
    this.uiGain.gain.value = this.uiVolume;
    this.uiGain.connect(this.masterGain);

    this._startTrafficHum();
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    }
  }

  setCategoryVolume(category, val) {
    const clamped = Math.max(0, Math.min(1, val));
    if (category === 'ambient') {
      this.ambientVolume = clamped;
      if (this.ambientGain) this.ambientGain.gain.value = clamped;
    } else if (category === 'sfx') {
      this.sfxVolume = clamped;
      if (this.sfxGain) this.sfxGain.gain.value = clamped;
    } else if (category === 'music') {
      this.musicVolume = clamped;
      if (this.musicGain) this.musicGain.gain.value = clamped;
    } else if (category === 'ui') {
      this.uiVolume = clamped;
      if (this.uiGain) this.uiGain.gain.value = clamped;
    }
  }

  // ---------------------------------------------------------------------------
  // Ambient & Environment Synths
  // ---------------------------------------------------------------------------

  _startTrafficHum() {
    if (!this.audioCtx) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180; // Deep traffic rumble cutoff

      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.15;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      noise.start();
      this._trafficNode = { noise, gain, filter };
    } catch (e) {
      console.warn('Traffic hum synthesis warning:', e);
    }
  }

  updateTrafficVolume(congestionRatio) {
    if (this._trafficNode) {
      const targetGain = 0.05 + Math.min(0.4, congestionRatio * 0.4);
      this._trafficNode.gain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.5);
    }
  }

  playWeatherSound(weatherType) {
    if (!this.audioCtx) return;
    if (weatherType === 'rain' || weatherType === 'storm') {
      this._triggerRainSound(weatherType === 'storm' ? 0.4 : 0.2);
    }
    if (weatherType === 'storm') {
      this._triggerThunderSound();
    }
  }

  _triggerRainSound(intensity = 0.2) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;

    const gain = this.audioCtx.createGain();
    gain.gain.value = intensity;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    noise.start();

    setTimeout(() => {
      try {
        noise.stop();
        noise.disconnect();
      } catch (e) {}
    }, 4000);
  }

  _triggerThunderSound() {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 1.5);
  }

  // ---------------------------------------------------------------------------
  // Emergency Siren & Construction Sound FX
  // ---------------------------------------------------------------------------

  playEmergencySiren(type = 'police') {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const now = this.audioCtx.currentTime;
    osc.type = 'sine';

    if (type === 'police') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.3);
      osc.frequency.linearRampToValueAtTime(600, now + 0.6);
    } else {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      osc.frequency.linearRampToValueAtTime(400, now + 1.0);
    }

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  playConstructionHammer(sourcePos = null, cameraPos = null) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    // Apply 2D Spatial Panning if positions are supplied
    let outputNode = this.sfxGain;
    if (sourcePos && cameraPos && this.audioCtx.createPanner) {
      const panner = this.audioCtx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'linear';
      panner.refDistance = 100;
      panner.maxDistance = 1000;
      panner.setPosition(sourcePos.x - cameraPos.x, sourcePos.y - cameraPos.y, 0);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      osc.connect(gain);
      gain.connect(outputNode);
    }

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // ---------------------------------------------------------------------------
  // UI Clicks & Feedback FX
  // ---------------------------------------------------------------------------

  playUIClick(pitch = 800) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.uiGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // ---------------------------------------------------------------------------
  // Procedural Dynamic Background Soundtrack
  // ---------------------------------------------------------------------------

  startSoundtrack() {
    if (!this.audioCtx || this.musicState.playing) return;
    this.musicState.playing = true;
    this._scheduleNextMusicNote();
  }

  stopSoundtrack() {
    this.musicState.playing = false;
    if (this.musicState.timerId) {
      clearTimeout(this.musicState.timerId);
    }
  }

  _scheduleNextMusicNote() {
    if (!this.musicState.playing || !this.audioCtx) return;

    const scale = this.musicState.scale;
    const degree = scale[this.musicState.step % scale.length];
    const octave = Math.floor(this.musicState.step / scale.length) % 2;
    const freq = this.musicState.rootFreq * Math.pow(2, (degree + octave * 12) / 12);

    this._playSynthNote(freq, 0.4);

    this.musicState.step = (this.musicState.step + 1) % 16;
    const intervalMs = (60 / this.musicState.bpm) * 1000 * 0.5; // Eighth notes

    this.musicState.timerId = setTimeout(() => this._scheduleNextMusicNote(), intervalMs);
  }

  _playSynthNote(freq, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration);
  }
}

export default SoundEngine;
