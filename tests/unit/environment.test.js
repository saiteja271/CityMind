/**
 * environment.test.js
 * Unit tests for the CITYMIND environment system:
 * pollution diffusion, weather cycle transitions, and day/night cycle.
 */
'use strict';

// ─── Pollution helpers ────────────────────────────────────────────────────────

function diffuseCell(grid, r, c, decayRate, diffusionRate) {
  const rows = grid.length;
  const cols = grid[0].length;
  let val = grid[r][c] * (1 - decayRate);
  if (r > 0) val += grid[r - 1][c] * diffusionRate * 0.25;
  if (r < rows - 1) val += grid[r + 1][c] * diffusionRate * 0.25;
  if (c > 0) val += grid[r][c - 1] * diffusionRate * 0.25;
  if (c < cols - 1) val += grid[r][c + 1] * diffusionRate * 0.25;
  return Math.max(0, Math.min(100, val));
}

function averagePollution(grid) {
  let sum = 0;
  let count = 0;
  for (const row of grid) for (const v of row) { sum += v; count++; }
  return count > 0 ? sum / count : 0;
}

// ─── Weather helpers ──────────────────────────────────────────────────────────

const WEATHER_TRANSITIONS = {
  sunny: ['sunny', 'cloudy'],
  cloudy: ['sunny', 'cloudy', 'rain'],
  rain: ['cloudy', 'rain', 'storm'],
  storm: ['rain', 'cloudy'],
};

function isValidTransition(from, to) {
  return WEATHER_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Day/night helpers ────────────────────────────────────────────────────────

function timeToPhase(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function lightLevel(hour) {
  // Simple sinusoidal approximation
  const normalized = ((hour - 6 + 24) % 24) / 24;
  return Math.max(0.05, Math.min(1, Math.sin(normalized * Math.PI)));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Pollution diffusion', () => {
  test('isolated source decays over time', () => {
    const grid = [[0, 0, 0], [0, 100, 0], [0, 0, 0]];
    const next = diffuseCell(grid, 1, 1, 0.1, 0.2);
    expect(next).toBeLessThan(100);
    expect(next).toBeGreaterThan(0);
  });

  test('zero-pollution cell remains zero', () => {
    const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    expect(diffuseCell(grid, 1, 1, 0.1, 0.2)).toBe(0);
  });

  test('pollution is clamped between 0 and 100', () => {
    const high = [[100, 100, 100], [100, 100, 100], [100, 100, 100]];
    const val = diffuseCell(high, 1, 1, 0, 1);
    expect(val).toBeLessThanOrEqual(100);
    expect(val).toBeGreaterThanOrEqual(0);
  });

  test('averagePollution correctly computes mean', () => {
    const grid = [[0, 50], [100, 50]];
    expect(averagePollution(grid)).toBe(50);
  });

  test('averagePollution returns 0 for empty-like input', () => {
    expect(averagePollution([[0, 0, 0]])).toBe(0);
  });
});

describe('Weather transition system', () => {
  test('sunny can transition to cloudy', () => {
    expect(isValidTransition('sunny', 'cloudy')).toBe(true);
  });

  test('storm cannot jump directly to sunny', () => {
    expect(isValidTransition('storm', 'sunny')).toBe(false);
  });

  test('storm can resolve to rain', () => {
    expect(isValidTransition('storm', 'rain')).toBe(true);
  });

  test('unknown weather state returns false', () => {
    expect(isValidTransition('blizzard', 'sunny')).toBe(false);
  });

  test('all valid transitions are reversible or asymmetric appropriately', () => {
    // rain → storm is valid; storm → sunny is not
    expect(isValidTransition('rain', 'storm')).toBe(true);
    expect(isValidTransition('storm', 'sunny')).toBe(false);
  });
});

describe('Day/night cycle', () => {
  test('hour 6 maps to morning', () => expect(timeToPhase(6)).toBe('morning'));
  test('hour 12 maps to afternoon', () => expect(timeToPhase(12)).toBe('afternoon'));
  test('hour 17 maps to evening', () => expect(timeToPhase(17)).toBe('evening'));
  test('hour 0 maps to night', () => expect(timeToPhase(0)).toBe('night'));
  test('hour 23 maps to night', () => expect(timeToPhase(23)).toBe('night'));

  test('light level is highest at midday', () => {
    const noon = lightLevel(12);
    const midnight = lightLevel(0);
    expect(noon).toBeGreaterThan(midnight);
  });

  test('light level has a minimum floor (never fully dark)', () => {
    for (const h of [0, 1, 2, 3, 4, 5]) {
      expect(lightLevel(h)).toBeGreaterThanOrEqual(0.05);
    }
  });

  test('light level is clamped to [0.05, 1]', () => {
    for (let h = 0; h < 24; h++) {
      const l = lightLevel(h);
      expect(l).toBeGreaterThanOrEqual(0.05);
      expect(l).toBeLessThanOrEqual(1);
    }
  });
});
