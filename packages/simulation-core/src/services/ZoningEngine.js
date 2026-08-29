/**
 * ZoningEngine.js - Hedonic property valuation, spatial land value heatmaps, density evolution, and RCI demand index.
 * Models multi-attribute hedonic land pricing ($V = V_{base} + \alpha_1 \cdot Transit + \alpha_2 \cdot Safety + \alpha_3 \cdot School - \alpha_5 \cdot Pollution$),
 * automated building density evolution, and dynamic RCI (Residential, Commercial, Industrial) demand meters.
 */

import { clamp, distance } from '@citymind/utilities';

export const ZONE_TYPE = {
  NONE: 'NONE',
  RESIDENTIAL: 'RESIDENTIAL',
  COMMERCIAL: 'COMMERCIAL',
  INDUSTRIAL: 'INDUSTRIAL',
  PUBLIC: 'PUBLIC',
  PARK: 'PARK'
};

export class ZoningEngine {
  constructor(gridWidth = 50, gridHeight = 50) {
    this.width = gridWidth;
    this.height = gridHeight;

    // 2D Continuous Spatial Land Value Heatmap ($ per m2)
    this.landValueHeatmap = new Float32Array(gridWidth * gridHeight);

    // Dynamic RCI Market Demand Meters (-100.0 to +100.0)
    this.rciDemand = {
      residential: 45.0,
      commercial: 30.0,
      industrial: 25.0
    };

    // Baseline Hedonic Regression Coefficients
    this.hedonicWeights = {
      baseValue: 100.0,
      safetyWeight: 1.5,
      schoolWeight: 2.0,
      parkWeight: 2.5,
      transitWeight: 1.8,
      pollutionPenalty: 3.0
    };

    // Initialize baseline land values
    this.landValueHeatmap.fill(100.0);
  }

  /**
   * Primary Zoning Engine Tick.
   * Recalculates 2D land value heatmaps and updates RCI demand meters.
   *
   * @param {Object} cityServicesContext - Safety, school, park, pollution spatial layers
   * @param {Object} macroEconomyContext - Job vacancies, population growth, GDP growth
   * @returns {Object} Zoning summary payload
   */
  tick(cityServicesContext = {}, macroEconomyContext = {}) {
    // 1. Recalculate Hedonic Land Valuation Matrix across 2D grid
    this._recalculateLandValueHeatmap(cityServicesContext);

    // 2. Recalculate RCI (Residential, Commercial, Industrial) Market Demand Meters
    this._updateRciDemandMeters(macroEconomyContext);

    return {
      rciDemand: { ...this.rciDemand },
      avgLandValue: Number(this._calculateAvgLandValue().toFixed(2)),
      gridSize: `${this.width}x${this.height}`
    };
  }

  /**
   * Recalculate Hedonic Property Value per grid cell:
   * V(x,y) = V_base + a1 * Transit + a2 * Safety + a3 * School + a4 * Park - a5 * Pollution
   */
  _recalculateLandValueHeatmap(servicesContext = {}) {
    const W = this.width;
    const H = this.height;
    const { baseValue, safetyWeight, schoolWeight, parkWeight, transitWeight, pollutionPenalty } = this.hedonicWeights;

    const safetyIndex = servicesContext.safetyIndex || 70.0;
    const schoolQuality = servicesContext.schoolQuality || 65.0;
    const pollutionIndex = servicesContext.pollutionIndex || 15.0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;

        // Spatial Proximity to City Center (Distance decay)
        const distFromCenter = distance(x, y, W / 2, H / 2);
        const centerAccess = Math.max(0, 100 - distFromCenter * 2.5);

        // Hedonic Valuation Sum
        const hedonicValue =
          baseValue +
          (safetyIndex * safetyWeight) +
          (schoolQuality * schoolWeight) +
          (centerAccess * transitWeight) -
          (pollutionIndex * pollutionPenalty);

        this.landValueHeatmap[idx] = Math.max(20.0, hedonicValue);
      }
    }
  }

  /**
   * Recalculate RCI (Residential, Commercial, Industrial) Demand Meters.
   */
  _updateRciDemandMeters(macroEconomy = {}) {
    const { populationGrowthRate = 0.02, jobVacancyRate = 0.05, industrialOutputDemand = 100 } = macroEconomy;

    // Residential Demand driven by population growth & low housing vacancies
    const rDemand = (populationGrowthRate * 1000) + 20.0;
    this.rciDemand.residential = clamp(rDemand, -100.0, 100.0);

    // Commercial Demand driven by citizen wealth & customer foot traffic
    const cDemand = (jobVacancyRate > 0.03 ? 40.0 : 10.0) + (this.rciDemand.residential * 0.4);
    this.rciDemand.commercial = clamp(cDemand, -100.0, 100.0);

    // Industrial Demand driven by manufacturing trade exports
    const iDemand = (industrialOutputDemand / 2) - 10.0;
    this.rciDemand.industrial = clamp(iDemand, -100.0, 100.0);
  }

  /**
   * Check if a building on a tile is eligible for density evolution (upgrading to high-rise/apartment).
   *
   * @param {number} tileX
   * @param {number} tileY
   * @param {number} currentLevel - Current density level (1 to 3)
   * @param {boolean} hasPowerAndWater - Utility connectivity check
   * @returns {boolean} True if building should upgrade density
   */
  evaluateDensityEvolution(tileX, tileY, currentLevel = 1, hasPowerAndWater = true) {
    if (!hasPowerAndWater || currentLevel >= 3) return false;

    const landVal = this.getLandValueAt(tileX, tileY);

    // Upgrade thresholds
    if (currentLevel === 1 && landVal > 250.0 && this.rciDemand.residential > 20.0) {
      return true; // Upgrade to Level 2 Medium Density
    }
    if (currentLevel === 2 && landVal > 450.0 && this.rciDemand.residential > 50.0) {
      return true; // Upgrade to Level 3 High Density
    }

    return false;
  }

  /**
   * Get land value ($/m2) at grid coordinates.
   */
  getLandValueAt(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 100.0;
    return this.landValueHeatmap[Math.floor(y) * this.width + Math.floor(x)];
  }

  _calculateAvgLandValue() {
    let sum = 0;
    for (let i = 0; i < this.landValueHeatmap.length; i++) sum += this.landValueHeatmap[i];
    return sum / (this.landValueHeatmap.length || 1);
  }

  getZoningSummary() {
    return {
      rciDemand: { ...this.rciDemand },
      avgLandValue: Number(this._calculateAvgLandValue().toFixed(2))
    };
  }
}
