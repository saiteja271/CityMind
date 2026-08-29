/**
 * PowerGrid.js - Node-edge electrical circuit simulation engine.
 * Models multi-fuel generator plants (Fossil, Solar, Wind, Nuclear, Hydro), high/low voltage line losses ($P_{loss} = I^2 R$),
 * grid overload load-shedding, rolling blackout cascades, and battery storage dispatch optimization.
 */

import { clamp, randomRange } from '@citymind/utilities';

export const POWER_PLANT_TYPE = {
  FOSSIL: 'FOSSIL',
  SOLAR: 'SOLAR',
  WIND: 'WIND',
  NUCLEAR: 'NUCLEAR',
  HYDRO: 'HYDRO'
};

export class PowerNode {
  constructor(id, type, x, y, capacity = 100) {
    this.id = id;
    this.type = type; // 'generator' | 'consumer' | 'substation' | 'battery'
    this.x = x;
    this.y = y;
    this.capacity = capacity; // MW capacity
    this.currentOutput = 0; // Current generated or stored MW
    this.currentDemand = 0; // Current requested MW
    this.isPowered = true;
    this.priority = 1; // 1 = standard, 5 = critical (hospitals, emergency)
    this.fuelType = POWER_PLANT_TYPE.FOSSIL;
  }
}

export class PowerGrid {
  constructor() {
    // Map nodeId -> PowerNode
    this.nodes = new Map();

    // Map edgeId -> TransmissionLine
    this.transmissionLines = new Map();

    // Battery Storage System (MW capacity & stored MWh)
    this.batteryStorage = {
      capacityMWh: 500.0,
      storedMWh: 250.0,
      maxChargeRateMW: 50.0,
      maxDischargeRateMW: 50.0,
      efficiency: 0.92
    };

    // Grid Status Summary
    this.gridState = {
      totalCapacityMW: 0,
      totalGeneratedMW: 0,
      totalDemandMW: 0,
      totalLineLossMW: 0,
      gridSatisfactionRatio: 1.0,
      isRollingBlackoutActive: false,
      blackoutNodesCount: 0
    };
  }

  /**
   * Register a new node in the power grid.
   */
  addNode(id, type, x, y, capacity = 100, priority = 1, fuelType = POWER_PLANT_TYPE.FOSSIL) {
    const node = new PowerNode(id, type, x, y, capacity);
    node.priority = priority;
    node.fuelType = fuelType;
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Connect two grid nodes with a transmission line edge.
   *
   * @param {string} sourceId
   * @param {string} targetId
   * @param {number} resistance - Line resistance in Ohms
   * @param {number} maxCurrent - Max amperage/capacity limit
   * @param {boolean} isHighVoltage - High voltage vs low voltage distribution
   */
  connectNodes(sourceId, targetId, resistance = 0.05, maxCurrent = 200, isHighVoltage = true) {
    const lineId = `${sourceId}->${targetId}`;
    this.transmissionLines.set(lineId, {
      id: lineId,
      sourceId,
      targetId,
      resistance,
      maxCurrent,
      isHighVoltage,
      currentFlow: 0,
      lineLoss: 0
    });
  }

  /**
   * Primary Power Grid Simulation Tick.
   *
   * @param {number} gameHour - Float game hour (0.00 - 23.99)
   * @param {number} weatherWindSpeed - Wind speed modifier (m/s)
   * @param {Object} buildingDemands - Map of buildingId -> requested MW
   */
  tick(gameHour = 12.0, weatherWindSpeed = 8.0, buildingDemands = {}) {
    // 1. Calculate Generator Outputs based on fuel type & diurnal/weather factors
    let totalSupply = 0;
    this.nodes.forEach((node) => {
      if (node.type === 'generator') {
        node.currentOutput = this._calculateGeneratorOutput(node, gameHour, weatherWindSpeed);
        totalSupply += node.currentOutput;
      }
    });

    // 2. Aggregate Consumer Demand
    let totalDemand = 0;
    this.nodes.forEach((node) => {
      if (node.type === 'consumer') {
        node.currentDemand = buildingDemands[node.id] || node.capacity * 0.7;
        totalDemand += node.currentDemand;
      }
    });

    // 3. Battery Storage Dispatch (Charge on surplus, discharge on deficit)
    const netDeficit = totalDemand - totalSupply;

    if (netDeficit > 0 && this.batteryStorage.storedMWh > 0) {
      // Discharge battery to cover deficit
      const dischargeMW = Math.min(netDeficit, this.batteryStorage.maxDischargeRateMW, this.batteryStorage.storedMWh);
      totalSupply += dischargeMW;
      this.batteryStorage.storedMWh -= dischargeMW;
    } else if (netDeficit < 0 && this.batteryStorage.storedMWh < this.batteryStorage.capacityMWh) {
      // Charge battery with surplus
      const surplusMW = Math.abs(netDeficit);
      const chargeMW = Math.min(surplusMW, this.batteryStorage.maxChargeRateMW);
      this.batteryStorage.storedMWh = Math.min(
        this.batteryStorage.capacityMWh,
        this.batteryStorage.storedMWh + chargeMW * this.batteryStorage.efficiency
      );
      totalSupply -= chargeMW;
    }

    // 4. Calculate Transmission Line Losses: P_loss = I^2 * R
    let totalLoss = 0;
    this.transmissionLines.forEach((line) => {
      const current = (totalSupply / Math.max(1, this.nodes.size)) * 0.1;
      line.currentFlow = current;
      // High voltage has 80% lower line loss factor
      const voltageFactor = line.isHighVoltage ? 0.2 : 1.0;
      line.lineLoss = Math.pow(current, 2) * line.resistance * voltageFactor;
      totalLoss += line.lineLoss;
    });

    const netAvailableSupply = Math.max(0, totalSupply - totalLoss);
    const satisfactionRatio = totalDemand > 0 ? clamp(netAvailableSupply / totalDemand, 0, 1) : 1.0;

    // 5. Overload & Rolling Blackout Allocation Logic
    let blackoutCount = 0;

    if (satisfactionRatio < 0.95) {
      // Power Deficit: Perform priority load shedding (Low priority shed first)
      const consumers = Array.from(this.nodes.values())
        .filter((n) => n.type === 'consumer')
        .sort((a, b) => a.priority - b.priority); // Low priority first

      let availableMW = netAvailableSupply;

      consumers.forEach((consumer) => {
        if (availableMW >= consumer.currentDemand) {
          consumer.isPowered = true;
          availableMW -= consumer.currentDemand;
        } else {
          consumer.isPowered = false; // Blackout for this node
          blackoutCount++;
        }
      });
    } else {
      // Full power coverage
      this.nodes.forEach((n) => {
        if (n.type === 'consumer') n.isPowered = true;
      });
    }

    // Update Grid Summary Payload
    this.gridState = {
      totalCapacityMW: Array.from(this.nodes.values())
        .filter((n) => n.type === 'generator')
        .reduce((sum, n) => sum + n.capacity, 0),
      totalGeneratedMW: Number(totalSupply.toFixed(1)),
      totalDemandMW: Number(totalDemand.toFixed(1)),
      totalLineLossMW: Number(totalLoss.toFixed(2)),
      gridSatisfactionRatio: Number(satisfactionRatio.toFixed(3)),
      isRollingBlackoutActive: blackoutCount > 0,
      blackoutNodesCount: blackoutCount,
      batteryStoredMWh: Number(this.batteryStorage.storedMWh.toFixed(1))
    };

    return this.gridState;
  }

  /**
   * Calculate output for generator based on fuel physics and diurnal cycle.
   */
  _calculateGeneratorOutput(node, gameHour, windSpeed) {
    switch (node.fuelType) {
      case POWER_PLANT_TYPE.SOLAR: {
        // Diurnal sine wave peak at 12:00 PM (hour 12)
        const sunFactor = Math.max(0, Math.sin(((gameHour - 6) / 12) * Math.PI));
        return node.capacity * sunFactor;
      }

      case POWER_PLANT_TYPE.WIND: {
        // Wind power curve P = 0.5 * rho * A * v^3
        const windFactor = clamp(Math.pow(windSpeed / 12.0, 3), 0.1, 1.0);
        return node.capacity * windFactor;
      }

      case POWER_PLANT_TYPE.FOSSIL:
        // Dispatchable base load
        return node.capacity * 0.95;

      case POWER_PLANT_TYPE.NUCLEAR:
        // Continuous 100% base load
        return node.capacity * 1.0;

      case POWER_PLANT_TYPE.HYDRO:
        // Continuous steady hydro flow
        return node.capacity * 0.85;

      default:
        return node.capacity * 0.8;
    }
  }

  /**
   * Summary overview of power grid status.
   */
  getGridSummary() {
    return { ...this.gridState };
  }
}
