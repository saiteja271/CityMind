/**
 * TimeSystem - Game clock with pause, speed control, day/month/year tracking.
 */

import { TIME } from '@citymind/constants';
import { EventEmitter } from '@citymind/utilities';

export class TimeSystem extends EventEmitter {
  constructor() {
    super();
    this.totalTicks = 0;
    this.tickInHour = 0;
    this.hour = 8;
    this.day = 1;
    this.month = 1;
    this.year = 1;
    this.speed = TIME.DEFAULT_SPEED;
    this.paused = false;
    this._accum = 0;
  }

  get isPaused() {
    return this.paused || this.speed === 0;
  }

  setSpeed(speed) {
    if (TIME.SPEEDS[Object.keys(TIME.SPEEDS).find((k) => TIME.SPEEDS[k] === speed)] !== undefined ||
        Object.values(TIME.SPEEDS).includes(speed)) {
      this.speed = speed;
      this.paused = speed === 0;
      this.emit('speedChange', speed);
    }
  }

  pause() {
    this.paused = true;
    this.emit('pause');
  }

  resume() {
    this.paused = false;
    if (this.speed === 0) this.speed = TIME.DEFAULT_SPEED;
    this.emit('resume');
  }

  togglePause() {
    if (this.paused) this.resume();
    else this.pause();
  }

  /**
   * Advance simulation. Returns number of ticks processed.
   */
  update(realDtMs) {
    if (this.isPaused) return 0;
    const tickMs = 1000 / this.speed;
    this._accum += realDtMs;
    let ticks = 0;
    while (this._accum >= tickMs) {
      this._accum -= tickMs;
      this._advanceTick();
      ticks++;
      if (ticks > 100) break; // safety
    }
    return ticks;
  }

  _advanceTick() {
    this.totalTicks++;
    this.tickInHour++;
    if (this.tickInHour >= TIME.TICKS_PER_HOUR) {
      this.tickInHour = 0;
      this.hour++;
      this.emit('hour', this.hour, this.day, this.month, this.year);
      if (this.hour >= TIME.HOURS_PER_DAY) {
        this.hour = 0;
        this.day++;
        this.emit('day', this.day, this.month, this.year);
        if (this.day > TIME.DAYS_PER_MONTH) {
          this.day = 1;
          this.month++;
          this.emit('month', this.month, this.year);
          if (this.month > TIME.MONTHS_PER_YEAR) {
            this.month = 1;
            this.year++;
            this.emit('year', this.year);
          }
        }
      }
    }
  }

  get gameHour() {
    return this.hour + this.tickInHour / TIME.TICKS_PER_HOUR;
  }

  get isNight() {
    return this.hour >= 20 || this.hour < 6;
  }

  get isDaytime() {
    return !this.isNight;
  }

  format() {
    const h = this.hour % 12 || 12;
    const m = Math.floor((this.tickInHour / TIME.TICKS_PER_HOUR) * 60);
    const period = this.hour >= 12 ? 'PM' : 'AM';
    return `Y${this.year} M${this.month} D${this.day} ${h}:${String(m).padStart(2, '0')} ${period}`;
  }

  toJSON() {
    return {
      totalTicks: this.totalTicks,
      tickInHour: this.tickInHour,
      hour: this.hour,
      day: this.day,
      month: this.month,
      year: this.year,
      speed: this.speed,
      paused: this.paused
    };
  }

  static fromJSON(data) {
    const t = new TimeSystem();
    Object.assign(t, data);
    return t;
  }
}

export default TimeSystem;
