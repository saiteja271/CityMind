/**
 * WaterGrid.js - Hydraulic flow, water purification, sewage treatment, and contamination engine.
 * Models Hazen-Williams pressure loss ($h_f = \frac{10.67 \cdot L \cdot Q^{1.852}}{C^{1.852} \cdot d^{4.87}}$),
 * reservoir levels, sewage effluent discharge, and 2D groundwater contaminant plume diffusion.
 */

import { clamp } from '@citymind/utilities';

export class WaterGrid {
  constructor(gridWidth = 50, gridHeight = 50) {
    this.width = gridWidth;
    this.height = gridHeight;

    // Infrastructure Facilities: Map facilityId -> FacilityData
    this.facilities = new Map();

    // Reservoir Storage Metrics (Liters / m3)
    this.reservoir = {
      capacityM3: 1000000.0,
      currentLevelM3: 750000.0,
      monthlyRainfallM3: 20000.0,
      droughtIndex: 0.1 // 0.0 = normal, 1.0 = extreme drought
    };

    // 2D Groundwater Contamination Plume Grid (Values 0.0 to 100.0 PPM)
    this.contaminationGrid = new Float32Array(gridWidth * gridHeight);

    // System Metrics Summary
    this.systemState = {
      totalCleanWaterCapacityM3: 0,
      totalWaterDemandM3: 0,
      totalSewageProcessedM3: 0,
      avgWaterQualityIndex: 98.0,
      effluentPollutionLoadingPPM: 2.5
    };
  }

  /**
   * Register a water utility facility (treatment plant, water tower, sewage plant).
   */
  addFacility(id, type, x, y, capacityM3 = 5000) {
    this.facilities.set(id, {
      id,
      type, // 'treatment_plant' | 'water_tower' | 'sewage_plant'
      x,
      y,
      capacityM3,
      currentOutputM3: 0,
      purificationEfficiency: 0.95
    });
  }

  /**
   * Primary Water & Sewage Grid Tick.
   *
   * @param {number} totalCityWaterDemandM3 - Total requested clean water volume
   * @param {number} totalCitySewageGeneratedM3 - Total generated wastewater volume
   * @param {Array<Object>} industrialSpills - Active chemical spill events
   */
  tick(totalCityWaterDemandM3 = 50000, totalCitySewageGeneratedM3 = 45000, industrialSpills = []) {
    // 1. Process Reservoir Water Intake & Seasonal Rainfall Replenishment
    const netRainfall = this.reservoir.monthlyRainfallM3 * (1 - this.reservoir.droughtIndex);
    this.reservoir.currentLevelM3 = Math.min(
      this.reservoir.capacityM3,
      this.reservoir.currentLevelM3 + netRainfall - totalCityWaterDemandM3 * 0.1
    );

    // 2. Clean Water Treatment Purification Throughput
    let totalPurified = 0;
    this.facilities.forEach((fac) => {
      if (fac.type === 'treatment_plant' || fac.type === 'water_tower') {
        fac.currentOutputM3 = Math.min(fac.capacityM3, totalCityWaterDemandM3 * 0.5);
        totalPurified += fac.currentOutputM3 * fac.purificationEfficiency;
      }
    });

    // 3. Sewage Treatment & Effluent Environmental Discharge
    let totalSewageProcessed = 0;
    let effluentToxins = 0;

    this.facilities.forEach((fac) => {
      if (fac.type === 'sewage_plant') {
        const inputWastewater = Math.min(fac.capacityM3, totalCitySewageGeneratedM3 * 0.5);
        totalSewageProcessed += inputWastewater;
        // Remaining un-purified effluent discharged to rivers
        effluentToxins += inputWastewater * (1 - fac.purificationEfficiency) * 0.1;
      }
    });

    // 4. Groundwater Contamination Spatial 2D Plume Diffusion Step
    this._diffuseContaminationPlume(industrialSpills);

    // 5. Update System State Metrics
    this.systemState = {
      reservoirLevelPercent: Number(((this.reservoir.currentLevelM3 / this.reservoir.capacityM3) * 100).toFixed(1)),
      totalCleanWaterCapacityM3: totalPurified,
      totalWaterDemandM3: totalCityWaterDemandM3,
      waterSatisfactionRatio: Number(clamp(totalPurified / Math.max(1, totalCityWaterDemandM3), 0, 1).toFixed(2)),
      totalSewageProcessedM3: totalSewageProcessed,
      avgWaterQualityIndex: Number(clamp(100 - effluentToxins * 0.05, 40, 100).toFixed(1)),
      effluentPollutionLoadingPPM: Number(effluentToxins.toFixed(2))
    };

    return this.systemState;
  }

  /**
   * Calculate pipe pressure loss using Hazen-Williams Equation.
   * h_f = (10.67 * L * Q^1.852) / (C^1.852 * d^4.87)
   *
   * @param {number} lengthM - Pipe length in meters
   * @param {number} flowRateQ - Flow rate m3/s
   * @param {number} pipeDiameterD - Pipe diameter meters
   * @param {number} [cCoefficient=130] - Pipe roughness coefficient (130 for smooth steel/PVC)
   * @returns {number} Pressure head loss in meters
   */
  calculateHazenWilliamsPressureLoss(lengthM, flowRateQ, pipeDiameterD, cCoefficient = 130) {
    if (pipeDiameterD <= 0 || flowRateQ <= 0) return 0;
    const numerator = 10.67 * lengthM * Math.pow(flowRateQ, 1.852);
    const denominator = Math.pow(cCoefficient, 1.852) * Math.pow(pipeDiameterD, 4.87);
    return numerator / denominator;
  }

  /**
   * Spatial 2D Plume Diffusion step for groundwater contaminant transport across grid cells.
   */
  _diffuseContaminationPlume(industrialSpills = []) {
    const W = this.width;
    const H = this.height;
    const nextGrid = new Float32Array(W * H);

    // Inject active spill source terms
    industrialSpills.forEach((spill) => {
      if (spill.x >= 0 && spill.x < W && spill.y >= 0 && spill.y < H) {
        const idx = spill.y * W + spill.x;
        this.contaminationGrid[idx] = Math.min(100.0, this.contaminationGrid[idx] + (spill.intensity || 20.0));
      }
    });

    // 4-neighbor laplacian diffusion operator (diffusivity rate alpha = 0.1)
    const alpha = 0.1;
    const decay = 0.98; // Natural attenuation

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const cCenter = this.contaminationGrid[idx];
        const cUp = this.contaminationGrid[(y - 1) * W + x];
        const cDown = this.contaminationGrid[(y + 1) * W + x];
        const cLeft = this.contaminationGrid[y * W + (x - 1)];
        const cRight = this.contaminationGrid[y * W + (x + 1)];

        const laplacian = (cUp + cDown + cLeft + cRight - 4 * cCenter);
        nextGrid[idx] = clamp((cCenter + alpha * laplacian) * decay, 0, 100);
      }
    }

    this.contaminationGrid = nextGrid;
  }

  /**
   * Get groundwater toxin level at grid coordinate.
   */
  getContaminationAt(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.contaminationGrid[y * this.width + x];
  }

  /**
   * Summary payload of water utility system.
   */
  getWaterSummary() {
    return { ...this.systemState };
  }
}
