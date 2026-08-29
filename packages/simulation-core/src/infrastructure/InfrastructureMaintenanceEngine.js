/**
 * CITYMIND Municipal Infrastructure Aging & Preventive Maintenance Engine
 * Computes structural degradation curves for roads, bridges, water treatment plants, and substations,
 * schedules preventive maintenance budgets, and triggers emergency structural failures.
 */

export class InfrastructureAsset {
  constructor(assetId, name, category = 'Road', constructionCost = 250000) {
    this.assetId = assetId;
    this.name = name;
    this.category = category; // 'Road', 'Bridge', 'Substation', 'WaterPlant'
    this.constructionCost = constructionCost;
    this.structuralIntegrityPct = 100; // 0 to 100
    this.monthlyMaintenanceCost = Math.round(constructionCost * 0.005);
    this.ageMonths = 0;
    this.requiresEmergencyRepair = false;
  }

  processMonthlyDegradation(allocatedMaintenanceBudget) {
    this.ageMonths += 1;
    const maintenanceRatio = allocatedMaintenanceBudget / Math.max(1, this.monthlyMaintenanceCost);

    if (maintenanceRatio >= 1.0) {
      // Fully funded maintenance keeps integrity high
      this.structuralIntegrityPct = Math.min(100, this.structuralIntegrityPct + 0.5);
    } else {
      // Underfunded maintenance degrades asset
      const decay = (1.0 - maintenanceRatio) * 2.5;
      this.structuralIntegrityPct = Math.max(0, this.structuralIntegrityPct - decay);
    }

    if (this.structuralIntegrityPct < 30) {
      this.requiresEmergencyRepair = true;
    }
    return this.structuralIntegrityPct;
  }
}

export class InfrastructureMaintenanceEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.assets = new Map();
    this.averageCityInfrastructureConditionPct = 92;
    this.initializeAssets();
  }

  initializeAssets() {
    const defaultAssets = [
      new InfrastructureAsset('asset_bridge_01', 'Metropolis Suspension Bridge', 'Bridge', 1500000),
      new InfrastructureAsset('asset_substation_02', 'Downtown Electrical Substation 4', 'Substation', 800000),
      new InfrastructureAsset('asset_water_03', 'Central Water Purification Facility', 'WaterPlant', 950000),
    ];

    defaultAssets.forEach((a) => this.assets.set(a.assetId, a));
  }

  update(deltaMonths) {
    let sumCondition = 0;
    this.assets.forEach((asset) => {
      const cond = asset.processMonthlyDegradation(asset.monthlyMaintenanceCost);
      sumCondition += cond;
    });

    const count = this.assets.size;
    this.averageCityInfrastructureConditionPct = count > 0 ? Math.round(sumCondition / count) : 92;
  }

  getMaintenanceSummary() {
    const totalAssets = this.assets.size;
    const atRiskCount = Array.from(this.assets.values()).filter((a) => a.requiresEmergencyRepair).length;

    return {
      totalAssetsCount: totalAssets,
      averageCityInfrastructureConditionPct: this.averageCityInfrastructureConditionPct,
      atRiskCount,
    };
  }
}

export default InfrastructureMaintenanceEngine;
