/**
 * EventSystem - Dynamic city events with effects and duration.
 */

import { EVENT_TYPES } from '@citymind/constants';
import { generateId, randomChoice } from '@citymind/utilities';

const EVENT_DEFS = {
  [EVENT_TYPES.ECONOMIC_DOWNTURN]: {
    name: 'Economic Downturn',
    durationHours: 72,
    effects: { taxRevenue: -0.2, happiness: -5 }
  },
  [EVENT_TYPES.FESTIVAL]: {
    name: 'City Festival',
    durationHours: 48,
    effects: { happiness: 10, traffic: 0.3 }
  },
  [EVENT_TYPES.TRAFFIC_INCIDENT]: {
    name: 'Traffic Incident',
    durationHours: 12,
    effects: { traffic: 0.5 }
  },
  [EVENT_TYPES.POWER_FAILURE]: {
    name: 'Power Failure',
    durationHours: 24,
    effects: { buildingEfficiency: -0.3, happiness: -8 }
  },
  [EVENT_TYPES.WATER_ISSUE]: {
    name: 'Water Supply Issue',
    durationHours: 36,
    effects: { happiness: -6, health: -5 }
  },
  [EVENT_TYPES.WEATHER_EVENT]: {
    name: 'Severe Weather',
    durationHours: 18,
    effects: { traffic: 0.4, happiness: -3 }
  },
  [EVENT_TYPES.FIRE]: {
    name: 'Fire Emergency',
    durationHours: 8,
    effects: { happiness: -10 }
  },
  [EVENT_TYPES.INFRASTRUCTURE_FAILURE]: {
    name: 'Infrastructure Failure',
    durationHours: 48,
    effects: { maintenance: 0.5, happiness: -5 }
  },
  [EVENT_TYPES.MIGRATION_WAVE]: {
    name: 'Migration Wave',
    durationHours: 24,
    effects: { migration: 10 }
  },
  [EVENT_TYPES.CRIME_SPIKE]: {
    name: 'Crime Spike',
    durationHours: 60,
    effects: { safety: -15, happiness: -8 }
  }
};

export class EventSystem {
  constructor(simulation) {
    this.sim = simulation;
    this.active = [];
    this.history = [];
  }

  spawn(type) {
    const def = EVENT_DEFS[type];
    if (!def) return null;
    const event = {
      id: generateId('evt'),
      type,
      name: def.name,
      remainingHours: def.durationHours,
      effects: { ...def.effects },
      startedAt: this.sim.time.totalTicks
    };
    this.active.push(event);
    this.sim.notifications.push({
      id: generateId('notif'),
      type: 'event',
      message: `Event started: ${event.name}`,
      timestamp: Date.now()
    });
    return event;
  }

  spawnRandom() {
    const type = randomChoice(Object.keys(EVENT_DEFS));
    return this.spawn(type);
  }

  update(dtHours) {
    this.active = this.active.filter((e) => {
      e.remainingHours -= dtHours;
      if (e.remainingHours <= 0) {
        this.history.push({ ...e, endedAt: this.sim.time.totalTicks });
        return false;
      }
      return true;
    });
  }

  getActiveEffects() {
    const combined = {};
    for (const e of this.active) {
      for (const [k, v] of Object.entries(e.effects)) {
        combined[k] = (combined[k] || 0) + v;
      }
    }
    return combined;
  }
}

export default EventSystem;
