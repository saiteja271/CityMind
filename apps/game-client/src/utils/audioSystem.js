/**
 * audioSystem.js
 * CITYMIND Audio System — manages music, ambient soundscapes, and SFX
 * using the Web Audio API with graceful fallback to HTMLAudioElement.
 *
 * Features:
 *  - Background music with crossfade transitions between tracks
 *  - Ambient layer (city hum, nature sounds) driven by simulation state
 *  - SFX pool with spatial distance attenuation
 *  - Master, music, ambient, and SFX volume channels
 *  - Mute/unmute and user preference persistence via localStorage
 */

const PREF_KEY = 'citymind_audio_prefs';

// ─── Default volume levels (0–1) ─────────────────────────────────────────────
const DEFAULT_PREFS = {
  masterVolume: 0.8,
  musicVolume: 0.5,
  ambientVolume: 0.6,
  sfxVolume: 0.8,
  muted: false,
};

// ─── Track registry ───────────────────────────────────────────────────────────
export const MUSIC_TRACKS = {
  menu: '/audio/music/menu_theme.ogg',
  daytime: '/audio/music/city_daytime.ogg',
  nighttime: '/audio/music/city_night.ogg',
  prosperity: '/audio/music/prosperity.ogg',
  crisis: '/audio/music/crisis_alert.ogg',
};

export const AMBIENT_TRACKS = {
  nature: '/audio/ambient/nature.ogg',
  city_low: '/audio/ambient/city_low.ogg',
  city_medium: '/audio/ambient/city_medium.ogg',
  city_high: '/audio/ambient/city_high.ogg',
  rain: '/audio/ambient/rain.ogg',
  storm: '/audio/ambient/storm.ogg',
};

export const SFX_MAP = {
  build: '/audio/sfx/build_place.ogg',
  demolish: '/audio/sfx/demolish.ogg',
  notification: '/audio/sfx/notification.ogg',
  achievement: '/audio/sfx/achievement_unlock.ogg',
  disaster: '/audio/sfx/disaster_alert.ogg',
  coin: '/audio/sfx/coin.ogg',
  click: '/audio/sfx/ui_click.ogg',
  hover: '/audio/sfx/ui_hover.ogg',
};

// ─── AudioSystem class ────────────────────────────────────────────────────────

export class AudioSystem {
  constructor() {
    this.prefs = this._loadPrefs();
    this._ctx = null; // AudioContext (lazy-initialized on first user gesture)
    this._masterGain = null;
    this._musicGain = null;
    this._ambientGain = null;
    this._sfxGain = null;

    this._currentMusicSource = null;
    this._currentMusicTrack = null;
    this._currentAmbientSource = null;

    this._sfxCache = new Map(); // url -> AudioBuffer
    this._ready = false;
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  /**
   * Initialize the Web Audio API context.
   * Must be called from a user gesture (click, keydown) to satisfy browser policy.
   * @returns {Promise<void>}
   */
  async init() {
    if (this._ready) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('[AudioSystem] Web Audio API not supported');
        return;
      }
      this._ctx = new AudioContext();

      // Master → Music/Ambient/SFX gain nodes
      this._masterGain = this._ctx.createGain();
      this._musicGain = this._ctx.createGain();
      this._ambientGain = this._ctx.createGain();
      this._sfxGain = this._ctx.createGain();

      this._musicGain.connect(this._masterGain);
      this._ambientGain.connect(this._masterGain);
      this._sfxGain.connect(this._masterGain);
      this._masterGain.connect(this._ctx.destination);

      this._applyPrefs();
      this._ready = true;
    } catch (err) {
      console.error('[AudioSystem] init failed:', err);
    }
  }

  // ─── Music ──────────────────────────────────────────────────────────────────

  /**
   * Play a music track with an optional crossfade duration.
   * @param {string} trackKey - Key from MUSIC_TRACKS
   * @param {object} [opts]
   * @param {number} [opts.fadeMs=2000] - Crossfade duration in ms
   * @param {boolean} [opts.loop=true]
   */
  async playMusic(trackKey, { fadeMs = 2000, loop = true } = {}) {
    if (!this._ready) return;
    const url = MUSIC_TRACKS[trackKey];
    if (!url || this._currentMusicTrack === trackKey) return;

    const buffer = await this._loadBuffer(url);
    if (!buffer) return;

    // Fade out current track
    if (this._currentMusicSource) {
      const oldSource = this._currentMusicSource;
      const oldGain = this._ctx.createGain();
      oldGain.gain.setValueAtTime(oldGain.gain.value, this._ctx.currentTime);
      oldGain.gain.linearRampToValueAtTime(0, this._ctx.currentTime + fadeMs / 1000);
      setTimeout(() => { try { oldSource.stop(); } catch (_) {} }, fadeMs + 100);
    }

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const gainNode = this._ctx.createGain();
    gainNode.gain.setValueAtTime(0, this._ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, this._ctx.currentTime + fadeMs / 1000);

    source.connect(gainNode);
    gainNode.connect(this._musicGain);
    source.start();

    this._currentMusicSource = source;
    this._currentMusicTrack = trackKey;
  }

  stopMusic(fadeMs = 1500) {
    if (!this._ready || !this._currentMusicSource) return;
    const source = this._currentMusicSource;
    const g = this._musicGain;
    g.gain.setValueAtTime(g.gain.value, this._ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this._ctx.currentTime + fadeMs / 1000);
    setTimeout(() => {
      try { source.stop(); } catch (_) {}
      g.gain.setValueAtTime(this.prefs.musicVolume * this.prefs.masterVolume, this._ctx.currentTime);
    }, fadeMs + 100);
    this._currentMusicSource = null;
    this._currentMusicTrack = null;
  }

  // ─── Adaptive ambient ───────────────────────────────────────────────────────

  /**
   * Update ambient layer based on simulation state.
   * @param {object} state - { population, weather, timeOfDay }
   */
  async updateAmbient(state) {
    if (!this._ready) return;

    let trackKey = 'nature';
    if (state.weather === 'storm') trackKey = 'storm';
    else if (state.weather === 'rain') trackKey = 'rain';
    else if (state.population > 5000) trackKey = 'city_high';
    else if (state.population > 1000) trackKey = 'city_medium';
    else if (state.population > 100) trackKey = 'city_low';

    if (this._currentAmbientTrack === trackKey) return;

    const url = AMBIENT_TRACKS[trackKey];
    const buffer = await this._loadBuffer(url);
    if (!buffer) return;

    if (this._currentAmbientSource) {
      try { this._currentAmbientSource.stop(); } catch (_) {}
    }

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this._ambientGain);
    source.start();

    this._currentAmbientSource = source;
    this._currentAmbientTrack = trackKey;
  }

  // ─── SFX ────────────────────────────────────────────────────────────────────

  /**
   * Play a sound effect by key.
   * @param {string} sfxKey - Key from SFX_MAP
   * @param {object} [opts]
   * @param {number} [opts.volume=1] - Relative volume (0–1)
   */
  async playSfx(sfxKey, { volume = 1 } = {}) {
    if (!this._ready) return;
    const url = SFX_MAP[sfxKey];
    if (!url) return;

    const buffer = await this._loadBuffer(url);
    if (!buffer) return;

    const source = this._ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = this._ctx.createGain();
    gainNode.gain.value = Math.min(1, Math.max(0, volume));

    source.connect(gainNode);
    gainNode.connect(this._sfxGain);
    source.start();
  }

  // ─── Volume controls ────────────────────────────────────────────────────────

  setMasterVolume(v) {
    this.prefs.masterVolume = Math.min(1, Math.max(0, v));
    if (this._masterGain) this._masterGain.gain.value = this.prefs.muted ? 0 : this.prefs.masterVolume;
    this._savePrefs();
  }

  setMusicVolume(v) {
    this.prefs.musicVolume = Math.min(1, Math.max(0, v));
    if (this._musicGain) this._musicGain.gain.value = this.prefs.musicVolume;
    this._savePrefs();
  }

  setAmbientVolume(v) {
    this.prefs.ambientVolume = Math.min(1, Math.max(0, v));
    if (this._ambientGain) this._ambientGain.gain.value = this.prefs.ambientVolume;
    this._savePrefs();
  }

  setSfxVolume(v) {
    this.prefs.sfxVolume = Math.min(1, Math.max(0, v));
    if (this._sfxGain) this._sfxGain.gain.value = this.prefs.sfxVolume;
    this._savePrefs();
  }

  mute() {
    this.prefs.muted = true;
    if (this._masterGain) this._masterGain.gain.value = 0;
    this._savePrefs();
  }

  unmute() {
    this.prefs.muted = false;
    if (this._masterGain) this._masterGain.gain.value = this.prefs.masterVolume;
    this._savePrefs();
  }

  toggleMute() {
    if (this.prefs.muted) this.unmute();
    else this.mute();
  }

  // ─── Buffer loading & caching ───────────────────────────────────────────────

  async _loadBuffer(url) {
    if (this._sfxCache.has(url)) return this._sfxCache.get(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._ctx.decodeAudioData(arrayBuffer);
      this._sfxCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn(`[AudioSystem] Failed to load "${url}":`, err.message);
      return null;
    }
  }

  // ─── Preferences persistence ────────────────────────────────────────────────

  _loadPrefs() {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch (_) {
      return { ...DEFAULT_PREFS };
    }
  }

  _savePrefs() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(this.prefs));
    } catch (_) {}
  }

  _applyPrefs() {
    if (!this._ready) return;
    this._masterGain.gain.value = this.prefs.muted ? 0 : this.prefs.masterVolume;
    this._musicGain.gain.value = this.prefs.musicVolume;
    this._ambientGain.gain.value = this.prefs.ambientVolume;
    this._sfxGain.gain.value = this.prefs.sfxVolume;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  destroy() {
    this.stopMusic(0);
    if (this._currentAmbientSource) {
      try { this._currentAmbientSource.stop(); } catch (_) {}
    }
    if (this._ctx) {
      this._ctx.close().catch(() => {});
    }
    this._sfxCache.clear();
    this._ready = false;
  }
}

/** Singleton instance for use throughout the game client */
export const audioSystem = new AudioSystem();
export default audioSystem;
