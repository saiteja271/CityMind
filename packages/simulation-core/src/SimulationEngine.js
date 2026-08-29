/**
 * SimulationEngine - Orchestrates all city systems in the main simulation loop.
 */

import { MapGrid, Pathfinder } from '@citymind/game-engine';
import { ENVIRONMENT, EVENT_TYPES, GAME_MODE } from '@citymind/constants';
import { EventEmitter, generateId } from '@citymind/utilities';
import { CitizenManager } from './citizens/CitizenManager.js';
import { EconomySystem } from './economy/EconomySystem.js';
import { TimeSystem } from './time/TimeSystem.js';
import { BuildingManager } from './buildings/BuildingManager.js';

export class SimulationEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.id = options.id || generateId('city');
    this.name = options.name || 'New City';
    this.mode = options.mode || GAME_MODE.SANDBOX;
    this.seed = options.seed || Date.now();

    this.map = new MapGrid(
      options.mapWidth || 80,
      options.mapHeight || 80,
      this.seed
    );
    this.pathfinder = new Pathfinder(this.map);
    this.time = new TimeSystem();
    this.citizens = new CitizenManager(this);
    this.economy = new EconomySystem(this);
    this.buildings = new BuildingManager(this);

    this.environment = {
      weather: 'clear',
      temperature: 22,
      pollution: 0,
      dayNight: 1
    };
    this.events = [];
    this.activeEvents = [];
    this.districts = [];
    this.quests = [];
    this.analytics = { history: [] };
    this.notifications = [];
    this.initialized = false;
  }

  initialize(options = {}) {
    if (this.initialized) return;
    this.map.generateTerrain(options.terrain || {});
    // Place a starting road network
    this._placeStarterInfrastructure();
    if (options.initialPopulation) {
      this.citizens.spawnInitialPopulation(options.initialPopulation, this.map);
    }
    this.initialized = true;
    this.emit('initialized', this);
  }

  _placeStarterInfrastructure() {
    const cx = Math.floor(this.map.width / 2);
    const cy = Math.floor(this.map.height / 2);
    // Cross of roads
    for (let x = cx - 15; x <= cx + 15; x++) {
      this.map.placeRoad(x, cy);
    }
    for (let y = cy - 15; y <= cy + 15; y++) {
      this.map.placeRoad(cx, y);
    }
    // Starter buildings
    const starters = [
      { type: 'small_house', x: cx - 3, y: cy - 3 },
      { type: 'small_house', x: cx + 2, y: cy - 3 },
      { type: 'shop', x: cx - 2, y: cy + 2 },
      { type: 'park', x: cx + 3, y: cy + 2 }
    ];
    for (const s of starters) {
      const result = this.buildings.create(s.type, s.x, s.y, { instant: true });
      if (result.success) {
        this.map.placeBuilding(result.building, s.x, s.y);
        if (result.success) {
          this.economy.spend(result.building.cost * 0.5);
        }
      }
    }
    this.map.rebuildRoadGraph();
  }

  /**
   * Main update called from game loop with real delta time in ms.
   */
  update(realDtMs) {
    const ticks = this.time.update(realDtMs);
    if (ticks === 0) return;

    const dtHours = ticks / 60; // TICKS_PER_HOUR = 60

    // Citizens
    this.citizens.update(dtHours, this.time.gameHour, this.pathfinder);

    // Buildings construction
    this.buildings.updateConstruction(dtHours / 24);
    this.buildings.updateEfficiency();

    // Environment
    this._updateEnvironment(dtHours);

    // Events
    this._updateEvents(dtHours);

    // Monthly economy
    if (this.time.day === 1 && this.time.hour === 0 && this.time.tickInHour < ticks) {
      this.economy.monthlyTick(this.citizens.getAlive(), this.buildings.getAll());
      this._recordAnalytics();
    }

    // Yearly population
    if (this.time.month === 1 && this.time.day === 1 && this.time.hour === 0) {
      this.citizens.processAging(this.time.totalTicks);
      this.citizens.processBirths(this.time.totalTicks);
      const capacity = this.buildings.getTotalHousingCapacity();
      const stats = this.citizens.getStats();
      this.citizens.processMigration(
        this.time.totalTicks,
        capacity,
        stats.averageHappiness
      );
    }

    this.emit('update', { ticks, time: this.time.format() });
  }

  _updateEnvironment(dtHours) {
    // Pollution from buildings
    let pollutionSum = 0;
    for (const b of this.buildings.getAll()) {
      if (b.pollution && b.operating) {
        this.map.applyPollution(b.x, b.y, b.pollution * 0.01 * dtHours, b.influenceRadius || 3);
        pollutionSum += b.pollution;
      }
    }
    this.map.decayAllPollution(ENVIRONMENT.BASE_POLLUTION_DECAY * dtHours);
    const mapStats = this.map.getStats();
    this.environment.pollution = mapStats.averagePollution;
    this.environment.dayNight = this.time.isNight ? 0 : 1;

    // Simple weather cycle
    if (Math.random() < 0.001 * dtHours) {
      const weathers = ['clear', 'cloudy', 'rain', 'clear', 'clear'];
      this.environment.weather = weathers[Math.floor(Math.random() * weathers.length)];
    }
  }

  _updateEvents(dtHours) {
    // Chance to spawn random event
    if (Math.random() < 0.0005 * dtHours && this.activeEvents.length < 3) {
      this._spawnRandomEvent();
    }
    // Update active events
    this.activeEvents = this.activeEvents.filter((e) => {
      e.remainingHours -= dtHours;
      if (e.remainingHours <= 0) {
        this._endEvent(e);
        return false;
      }
      return true;
    });
  }

  _spawnRandomEvent() {
    const types = Object.values(EVENT_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const event = {
      id: generateId('evt'),
      type,
      name: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      remainingHours: 24 + Math.random() * 72,
      severity: 0.3 + Math.random() * 0.5,
      startedAt: this.time.totalTicks
    };
    this.activeEvents.push(event);
    this.notifications.push({
      id: generateId('notif'),
      type: 'event',
      message: `Event: ${event.name}`,
      timestamp: Date.now()
    });
    this.emit('event', event);
  }

  _endEvent(event) {
    this.emit('eventEnd', event);
  }

  _recordAnalytics() {
    const citStats = this.citizens.getStats();
    const ecoStats = this.economy.getStats();
    const bldStats = this.buildings.getStats();
    this.analytics.history.push({
      tick: this.time.totalTicks,
      year: this.time.year,
      month: this.time.month,
      population: citStats.total,
      happiness: citStats.averageHappiness,
      unemployment: citStats.unemploymentRate,
      budget: ecoStats.budget,
      pollution: this.environment.pollution,
      buildings: bldStats.total
    });
    if (this.analytics.history.length > 200) {
      this.analytics.history.shift();
    }
  }

  getCityFactors() {
    return {
      safety: 70 - this.environment.pollution * 0.2,
      pollution: this.environment.pollution,
      taxRate: this.economy.taxRate,
      services: Math.min(100, this.buildings.getByCategory('public').length * 10)
    };
  }

  placeBuilding(type, x, y) {
    const def = require('@citymind/constants').BUILDING_DEFS[type];
    if (!def) return { success: false, reason: 'Unknown type' };
    if (!this.economy.canAfford(def.cost)) {
      return { success: false, reason: 'Insufficient funds' };
    }
    const result = this.buildings.create(type, x, y);
    if (!result.success) return result;
    const placed = this.map.placeBuilding(result.building, x, y);
    if (!placed.success) {
      this.buildings.remove(result.building.id);
      return placed;
    }
    this.economy.spend(def.cost);
    if (type === 'road') {
      this.map.placeRoad(x, y);
    }
    this.emit('buildingPlaced', result.building);
    return result;
  }

  getAdvisorAdvice() {
    const cit = this.citizens.getStats();
    const eco = this.economy.getStats();
    const bld = this.buildings.getStats();
    const advice = [];

    if (cit.unemploymentRate > 0.15) {
      advice.push({
        priority: 'high',
        topic: 'employment',
        message: `Unemployment is at ${(cit.unemploymentRate * 100).toFixed(1)}%. Consider building more commercial or industrial zones to create jobs.`
      });
    }
    if (cit.averageHappiness < 40) {
      advice.push({
        priority: 'high',
        topic: 'happiness',
        message: `City happiness is low (${cit.averageHappiness.toFixed(0)}). Check housing, pollution, and public services.`
      });
    }
    if (eco.budget < 0) {
      advice.push({
        priority: 'critical',
        topic: 'budget',
        message: `City budget is negative ($${eco.budget.toFixed(0)}). Raise taxes or reduce expenses.`
      });
    }
    if (bld.housingCapacity < cit.total * 1.1) {
      advice.push({
        priority: 'medium',
        topic: 'housing',
        message: `Housing capacity (${bld.housingCapacity}) is tight for population (${cit.total}). Build more residential.`
      });
    }
    if (this.environment.pollution > 40) {
      advice.push({
        priority: 'medium',
        topic: 'environment',
        message: `Pollution level is high (${this.environment.pollution.toFixed(0)}). Add parks and reduce industrial density.`
      });
    }
    if (advice.length === 0) {
      advice.push({
        priority: 'low',
        topic: 'general',
        message: 'City is running smoothly. Consider expanding or setting new goals.'
      });
    }
    return advice;
  }

  getFullState() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      time: this.time.toJSON(),
      map: this.map.toJSON(),
      citizens: this.citizens.toJSON(),
      economy: this.economy.toJSON(),
      buildings: this.buildings.toJSON(),
      environment: this.environment,
      activeEvents: this.activeEvents,
      analytics: this.analytics,
      stats: {
        citizens: this.citizens.getStats(),
        economy: this.economy.getStats(),
        buildings: this.buildings.getStats(),
        map: this.map.getStats()
      }
    };
  }

  toJSON() {
    return this.getFullState();
  }

  static fromJSON(data) {
    const sim = new SimulationEngine({
      id: data.id,
      name: data.name,
      mode: data.mode,
      seed: data.map?.seed
    });
    if (data.map) sim.map = MapGrid.fromJSON(data.map);
    sim.pathfinder = new Pathfinder(sim.map);
    if (data.time) sim.time = TimeSystem.fromJSON(data.time);
    if (data.citizens) sim.citizens = CitizenManager.fromJSON(data.citizens, sim);
    if (data.economy) sim.economy = EconomySystem.fromJSON(data.economy, sim);
    if (data.buildings) sim.buildings = BuildingManager.fromJSON(data.buildings, sim);
    if (data.environment) sim.environment = data.environment;
    if (data.activeEvents) sim.activeEvents = data.activeEvents;
    if (data.analytics) sim.analytics = data.analytics;
    sim.initialized = true;
    return sim;
  }
}

export default SimulationEngine;
