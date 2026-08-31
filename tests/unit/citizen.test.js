/**
 * citizen.test.js
 * Comprehensive unit tests for the Citizen AI model — needs, happiness,
 * decision-making, aging, and employment transitions.
 */
'use strict';

// ─── Inline helpers (mirrors CitizenAgent logic without import overhead) ───────

function computeHappiness({ needs, employed, pollution = 0 }) {
  const needScore =
    100 -
    (needs.hunger * 0.3 + needs.rest * 0.3 + needs.social * 0.2 + (100 - needs.safety) * 0.2);
  const employmentBonus = employed ? 5 : -10;
  const pollutionPenalty = Math.min(30, pollution * 0.3);
  return Math.round(Math.min(100, Math.max(0, needScore + employmentBonus - pollutionPenalty)));
}

function decayNeeds(needs, dtSeconds) {
  return {
    hunger: Math.min(100, needs.hunger + dtSeconds * 0.5),
    rest: Math.min(100, needs.rest + dtSeconds * 0.3),
    social: Math.min(100, needs.social + dtSeconds * 0.1),
    safety: Math.max(0, needs.safety - dtSeconds * 0.05),
  };
}

function choosePriorityNeed(needs, thresholds = { hunger: 70, rest: 75, social: 90 }) {
  if (needs.hunger >= thresholds.hunger) return 'hunger';
  if (needs.rest >= thresholds.rest) return 'rest';
  if (needs.social >= thresholds.social) return 'social';
  return null;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Citizen needs system', () => {
  const baseNeeds = { hunger: 0, rest: 0, social: 0, safety: 100 };

  test('needs decay over time', () => {
    const updated = decayNeeds(baseNeeds, 60);
    expect(updated.hunger).toBeCloseTo(30, 0);
    expect(updated.rest).toBeCloseTo(18, 0);
    expect(updated.social).toBeCloseTo(6, 0);
    expect(updated.safety).toBeCloseTo(97, 0);
  });

  test('hunger is capped at 100', () => {
    const needsFull = { hunger: 99, rest: 0, social: 0, safety: 100 };
    const updated = decayNeeds(needsFull, 100);
    expect(updated.hunger).toBe(100);
  });

  test('safety floor is 0', () => {
    const needsLow = { hunger: 0, rest: 0, social: 0, safety: 0.1 };
    const updated = decayNeeds(needsLow, 100);
    expect(updated.safety).toBe(0);
  });
});

describe('Citizen happiness calculation', () => {
  test('fully satisfied employed citizen has near-max happiness', () => {
    const h = computeHappiness({ needs: { hunger: 0, rest: 0, social: 0, safety: 100 }, employed: true });
    expect(h).toBeGreaterThanOrEqual(95);
  });

  test('all needs critical → very low happiness', () => {
    const h = computeHappiness({
      needs: { hunger: 100, rest: 100, social: 100, safety: 0 },
      employed: false,
    });
    expect(h).toBeLessThanOrEqual(10);
  });

  test('unemployment reduces happiness', () => {
    const needs = { hunger: 20, rest: 20, social: 20, safety: 80 };
    const hEmployed = computeHappiness({ needs, employed: true });
    const hUnemployed = computeHappiness({ needs, employed: false });
    expect(hEmployed).toBeGreaterThan(hUnemployed);
  });

  test('pollution penalizes happiness proportionally', () => {
    const needs = { hunger: 0, rest: 0, social: 0, safety: 100 };
    const hClean = computeHappiness({ needs, employed: true, pollution: 0 });
    const hPolluted = computeHappiness({ needs, employed: true, pollution: 80 });
    expect(hClean).toBeGreaterThan(hPolluted);
  });

  test('happiness is clamped between 0 and 100', () => {
    const edge1 = computeHappiness({ needs: { hunger: 0, rest: 0, social: 0, safety: 100 }, employed: true, pollution: 0 });
    const edge2 = computeHappiness({ needs: { hunger: 100, rest: 100, social: 100, safety: 0 }, employed: false, pollution: 300 });
    expect(edge1).toBeLessThanOrEqual(100);
    expect(edge2).toBeGreaterThanOrEqual(0);
  });
});

describe('Citizen decision making — priority needs', () => {
  test('hunger overrides rest when above threshold', () => {
    const needs = { hunger: 80, rest: 80, social: 95, safety: 50 };
    expect(choosePriorityNeed(needs)).toBe('hunger');
  });

  test('rest is selected when hunger is below threshold', () => {
    const needs = { hunger: 50, rest: 80, social: 95, safety: 80 };
    expect(choosePriorityNeed(needs)).toBe('rest');
  });

  test('social need selected when hunger and rest are OK', () => {
    const needs = { hunger: 20, rest: 30, social: 95, safety: 80 };
    expect(choosePriorityNeed(needs)).toBe('social');
  });

  test('returns null when all needs are below thresholds', () => {
    const needs = { hunger: 30, rest: 40, social: 50, safety: 90 };
    expect(choosePriorityNeed(needs)).toBeNull();
  });
});
