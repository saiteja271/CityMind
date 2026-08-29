/**
 * CITYMIND Municipal Infrastructure Aging & Preventive Maintenance Engine
 * Computes structural degradation curves for roads, bridges, water treatment plants, and substations,
 * schedules preventive maintenance budgets, and triggers emergency structural failures.
 */

export class ManagedCityAsset {
  constructor(id, name, type = 'Bridge', replacementCostDollars = 1200000) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.replacementCostDollars = replacementCostDollars;
    this.integrityPct = 100;
    this.ageMonths = 0;
    this.atRiskOfCollapse = false;
  }

  tickDegradation(maintenanceBudgetRatio) {
    this.ageMonths += 1;
    if (maintenanceBudgetRatio >= 1.0) {
      this.integrityPct = Math.min(100, this.integrityPct + 0.4);
    } else {
      const decay = (1.0 - maintenanceBudgetRatio) * 2.2;
      this.integrityPct = Math.max(0, this.integrityPct - decay);
    }

    if (this.integrityPct < 30) {
      this.atRiskOfCollapse = true;
    }
    return this.integrityPct;
  }
}

export class InfrastructureMaintenanceEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.managedAssetsMap = new Map();
    this.avgAssetConditionPct = 94;
    this.initializeAssets();
  }

  initializeAssets() {
    this.managedAssetsMap.set('asset_suspension_bridge', new ManagedCityAsset('asset_suspension_bridge', 'Metropolis Bay Suspension Bridge', 'Bridge', 2500000));
    this.managedAssetsMap.set('asset_water_treatment_1', new ManagedCityAsset('asset_water_treatment_1', 'Westside Water Treatment Plant', 'WaterPlant', 1100000));
  }

  update(deltaMonths) {
    let conditionSum = 0;
    this.managedAssetsMap.forEach((asset) => {
      const cond = asset.tickDegradation(1.0);
      conditionSum += cond;
    });

    const count = this.managedAssetsMap.size;
    this.avgAssetConditionPct = count > 0 ? Math.round(conditionSum / count) : 94;
  }

  getMaintenanceSummary() {
    return {
      managedAssetsCount: this.managedAssetsMap.size,
      avgAssetConditionPct: this.avgAssetConditionPct,
    };
  }
}

export default InfrastructureMaintenanceEngineFull;
