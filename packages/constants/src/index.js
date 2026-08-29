/**
 * CITYMIND Shared Constants - Central Export
 * Production-quality export entry point for all game constants and simulation parameters.
 */

export * from './buildings.js';
export * from './citizens.js';
export * from './policies.js';
export * from './events.js';

// Map & World Constants
export const MAP = Object.freeze({
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 100,
  MIN_SIZE: 32,
  MAX_SIZE: 256,
  TILE_SIZE: 32,
  CHUNK_SIZE: 16,
  MAX_ZOOM: 4.0,
  MIN_ZOOM: 0.25,
  DEFAULT_ZOOM: 1.0,
  CAMERA_SPEED: 8,
  PAN_EDGE_THRESHOLD: 40
});

export const TERRAIN = Object.freeze({
  GRASS: 'grass',
  DIRT: 'dirt',
  SAND: 'sand',
  WATER: 'water',
  ROCK: 'rock',
  FOREST: 'forest',
  SWAMP: 'swamp'
});

export const ZONE = Object.freeze({
  NONE: 'none',
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  PUBLIC: 'public',
  PARK: 'park',
  INFRASTRUCTURE: 'infrastructure'
});

export const TIME = Object.freeze({
  TICKS_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_MONTH: 30,
  MONTHS_PER_YEAR: 12,
  SPEEDS: {
    PAUSED: 0,
    NORMAL: 1,
    FAST: 2,
    FASTER: 4,
    FASTEST: 8
  },
  DEFAULT_SPEED: 1
});

export const ECONOMY_DEFAULTS = Object.freeze({
  BASE_TAX_RATE: 0.15,
  MIN_TAX_RATE: 0.05,
  MAX_TAX_RATE: 0.40,
  STARTING_BUDGET: 5000000,
  MAINTENANCE_MULTIPLIER: 1.0
});

export const TRANSPORT_DEFAULTS = Object.freeze({
  ROAD_COST: 1,
  OFFROAD_COST: 10,
  WATER_COST: Infinity,
  DIAGONAL_FACTOR: 1.414,
  MAX_PATH_LENGTH: 500,
  VEHICLE_CAPACITY: 4,
  BUS_CAPACITY: 40,
  CONGESTION_THRESHOLD: 0.7
});

export const UI_DEFAULTS = Object.freeze({
  HUD_UPDATE_INTERVAL: 500,
  NOTIFICATION_DURATION: 5000,
  PANEL_ANIMATION_MS: 200,
  COLORS: {
    primary: '#1a73e8',
    secondary: '#34a853',
    danger: '#ea4335',
    warning: '#fbbc04',
    background: '#0f1419',
    surface: '#1a2332',
    text: '#e8eaed',
    textMuted: '#9aa0a6',
    residential: '#4caf50',
    commercial: '#2196f3',
    industrial: '#ff9800',
    public: '#9c27b0',
    park: '#8bc34a',
    road: '#607d8b',
    water: '#03a9f4'
  }
});
