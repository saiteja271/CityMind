/**
 * TelecomGrid.js - Cellular signal propagation, fiber backbone, and digital access engine.
 * Models Log-Distance signal path loss ($PL(d) = PL(d_0) + 10 \cdot n \cdot \log_{10}(d / d_0)$), 4G/5G coverage density,
 * citizen digital access index, and smart city automation bonuses.
 */

import { clamp, distance } from '@citymind/utilities';

export const TOWER_TYPE = {
  TOWER_4G: 'TOWER_4G',
  TOWER_5G: 'TOWER_5G',
  FIBER_HUB: 'FIBER_HUB'
};

export class TelecomTower {
  constructor(id, type, x, y, rangeRadius = 15, maxBandwidthGbps = 10.0) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.rangeRadius = rangeRadius;
    this.maxBandwidthGbps = maxBandwidthGbps;
    this.connectedUsers = 0;
    this.active = true;
  }
}

export class TelecomGrid {
  constructor(gridWidth = 50, gridHeight = 50) {
    this.width = gridWidth;
    this.height = gridHeight;

    // Map towerId -> TelecomTower
    this.towers = new Map();

    // System Metrics Summary
    this.systemState = {
      totalTowers: 0,
      avgSignalStrengthDb: -75.0,
      coveragePercentage: 85.0,
      internetAccessIndex: 0.88, // 0.0 to 1.0
      smartCityEfficiencyBonus: 0.15 // +15% boost to smart services
    };
  }

  /**
   * Register a new cell tower or fiber hub node.
   */
  addTower(id, type, x, y, rangeRadius = 15, maxBandwidthGbps = 10.0) {
    const tower = new TelecomTower(id, type, x, y, rangeRadius, maxBandwidthGbps);
    this.towers.set(id, tower);
    return tower;
  }

  /**
   * Calculate signal path loss using the Log-Distance Path Loss Model.
   * PL(d) = PL(d0) + 10 * n * log10(d / d0)
   *
   * @param {number} distMeters - Distance from tower in meters
   * @param {number} [pathLossExponent=3.0] - Environment exponent (urban = 3.0 to 4.0)
   * @returns {number} Path loss in decibels (dB)
   */
  calculateLogDistancePathLoss(distMeters, pathLossExponent = 3.2) {
    const d0 = 1.0; // Reference distance 1 meter
    const PL0 = 38.0; // Reference path loss at 1m in dB
    if (distMeters <= d0) return PL0;
    return PL0 + 10 * pathLossExponent * Math.log10(distMeters / d0);
  }

  /**
   * Primary Telecom Simulation Tick.
   *
   * @param {Array<Object>} citizens - Active citizen instances
   * @returns {Object} System state payload
   */
  tick(citizens = []) {
    if (this.towers.size === 0) {
      this.systemState = {
        totalTowers: 0,
        avgSignalStrengthDb: -110.0,
        coveragePercentage: 10.0,
        internetAccessIndex: 0.15,
        smartCityEfficiencyBonus: 0.0
      };
      return this.systemState;
    }

    let coveredCount = 0;
    let totalSignalSum = 0;

    // Reset user count per tower
    this.towers.forEach((t) => { t.connectedUsers = 0; });

    citizens.forEach((c) => {
      if (!c.alive) return;

      let bestSignal = -120.0; // Minimal signal dBm
      let bestTower = null;

      this.towers.forEach((tower) => {
        if (!tower.active) return;
        const d = distance(c.x, c.y, tower.x, tower.y);
        if (d <= tower.rangeRadius) {
          const pathLoss = this.calculateLogDistancePathLoss(d * 10);
          const signalDbm = -30.0 - pathLoss; // Transmit power -30 dBm
          if (signalDbm > bestSignal) {
            bestSignal = signalDbm;
            bestTower = tower;
          }
        }
      });

      if (bestTower) {
        bestTower.connectedUsers++;
        coveredCount++;
        totalSignalSum += bestSignal;
      }
    });

    const totalCitizens = Math.max(1, citizens.length);
    const coveragePct = (coveredCount / totalCitizens) * 100;
    const avgSignal = coveredCount > 0 ? totalSignalSum / coveredCount : -110.0;

    // Digital Access Index = Coverage % * Signal Quality Factor
    const signalQualityFactor = clamp((avgSignal + 100) / 40, 0.2, 1.0);
    const accessIndex = clamp((coveragePct / 100) * signalQualityFactor, 0.05, 1.0);

    // Smart City Efficiency Bonus derived from internet access index (up to +25% boost)
    const smartBonus = accessIndex * 0.25;

    this.systemState = {
      totalTowers: this.towers.size,
      avgSignalStrengthDb: Number(avgSignal.toFixed(1)),
      coveragePercentage: Number(coveragePct.toFixed(1)),
      internetAccessIndex: Number(accessIndex.toFixed(3)),
      smartCityEfficiencyBonus: Number(smartBonus.toFixed(3))
    };

    return this.systemState;
  }

  /**
   * Summary overview of telecom network.
   */
  getTelecomSummary() {
    return { ...this.systemState };
  }
}
