/**
 * TradeSystem.js - Regional external trade, resource import/export, and tariff engine.
 * Manages freight ports, rail depots, import tariffs, export subsidies, trade balance calculation,
 * and regional supply chain bottleneck detection.
 */

import { clamp } from '@citymind/utilities';

export const TRADE_HUB_TYPE = {
  SEAPORT: 'SEAPORT',
  HIGHWAY_FREIGHT: 'HIGHWAY_FREIGHT',
  RAIL_DEPOT: 'RAIL_DEPOT',
  CARGO_AIRPORT: 'CARGO_AIRPORT'
};

export const RESOURCE_TYPE = {
  RAW_ORE: 'RAW_ORE',
  FOOD_GRAIN: 'FOOD_GRAIN',
  CLEAN_ENERGY: 'CLEAN_ENERGY',
  HIGH_TECH_COMPONENTS: 'HIGH_TECH_COMPONENTS',
  HEAVY_MACHINERY: 'HEAVY_MACHINERY'
};

export class TradeSystem {
  constructor() {
    // External Trade Hub Nodes
    this.hubs = new Map();

    // Tariff & Policy Rates (0.0 to 0.50)
    this.tariffs = {
      [RESOURCE_TYPE.RAW_ORE]: 0.05,
      [RESOURCE_TYPE.FOOD_GRAIN]: 0.02,
      [RESOURCE_TYPE.CLEAN_ENERGY]: 0.0,
      [RESOURCE_TYPE.HIGH_TECH_COMPONENTS]: 0.10,
      [RESOURCE_TYPE.HEAVY_MACHINERY]: 0.08
    };

    // Export Subsidies (0.0 to 0.20)
    this.exportSubsidies = {
      [RESOURCE_TYPE.CLEAN_ENERGY]: 0.05,
      [RESOURCE_TYPE.HIGH_TECH_COMPONENTS]: 0.04
    };

    // Global Regional Resource Market Base Prices
    this.globalPrices = {
      [RESOURCE_TYPE.RAW_ORE]: 45.0,
      [RESOURCE_TYPE.FOOD_GRAIN]: 20.0,
      [RESOURCE_TYPE.CLEAN_ENERGY]: 60.0,
      [RESOURCE_TYPE.HIGH_TECH_COMPONENTS]: 350.0,
      [RESOURCE_TYPE.HEAVY_MACHINERY]: 500.0
    };

    // Trade Balance Ledger (Last Cycle)
    this.ledger = {
      totalExports: 0,
      totalImports: 0,
      netBalance: 0, // Exports - Imports (Surplus if > 0, Deficit if < 0)
      tariffRevenuesCollected: 0,
      subsidiesPaidOut: 0
    };

    // Inventory Warehouses (Import/Export storage buffer)
    this.reserves = {
      [RESOURCE_TYPE.RAW_ORE]: 1000,
      [RESOURCE_TYPE.FOOD_GRAIN]: 2000,
      [RESOURCE_TYPE.CLEAN_ENERGY]: 1500,
      [RESOURCE_TYPE.HIGH_TECH_COMPONENTS]: 500,
      [RESOURCE_TYPE.HEAVY_MACHINERY]: 300
    };

    // Supply Chain Bottleneck Indicators
    this.bottlenecks = [];
  }

  /**
   * Register an external trade hub infrastructure building.
   *
   * @param {string} id
   * @param {string} type - TRADE_HUB_TYPE
   * @param {number} capacity - Max tons/units per tick
   */
  registerTradeHub(id, type, capacity = 500) {
    this.hubs.set(id, {
      id,
      type,
      capacity,
      throughput: 0,
      active: true
    });
  }

  /**
   * Primary Trade Tick.
   * Processes import/export orders, applies tariffs/subsidies, and computes trade deficit/surplus.
   *
   * @param {Object} cityResourceDemands - City demand vs domestic production per resource
   * @returns {Object} Trade ledger summary
   */
  tick(cityResourceDemands = {}) {
    let totalCap = 0;
    this.hubs.forEach((hub) => {
      if (hub.active) totalCap += hub.capacity;
    });

    if (totalCap === 0) totalCap = 200; // Baseline emergency road trade

    const periodLedger = {
      exports: 0,
      imports: 0,
      tariffRevenue: 0,
      subsidiesPaid: 0
    };

    this.bottlenecks = [];

    // Evaluate trade flows per resource type
    Object.keys(RESOURCE_TYPE).forEach((key) => {
      const resource = RESOURCE_TYPE[key];
      const demand = cityResourceDemands[resource]?.demand || 200;
      const production = cityResourceDemands[resource]?.production || 150;
      const globalPrice = this.globalPrices[resource] || 50.0;

      const netShortage = demand - production;

      if (netShortage > 0) {
        // IMPORT NEEDED
        const importQty = Math.min(netShortage, totalCap * 0.25);
        if (importQty > totalCap * 0.24) {
          this.bottlenecks.push(`Import bottleneck detected for ${resource}. Capacity capped.`);
        }

        const tariffRate = this.tariffs[resource] || 0.05;
        const grossImportCost = importQty * globalPrice;
        const tariffCollected = grossImportCost * tariffRate;
        const netCost = grossImportCost + tariffCollected;

        periodLedger.imports += netCost;
        periodLedger.tariffRevenue += tariffCollected;

        // Fulfill reserve buffer
        this.reserves[resource] = (this.reserves[resource] || 0) + importQty;
      } else if (netShortage < 0) {
        // EXPORT SURPLUS
        const exportQty = Math.min(Math.abs(netShortage), totalCap * 0.25);
        const subsidyRate = this.exportSubsidies[resource] || 0.0;

        const grossExportRevenue = exportQty * globalPrice;
        const subsidyPaid = grossExportRevenue * subsidyRate;

        periodLedger.exports += grossExportRevenue;
        periodLedger.subsidiesPaid += subsidyPaid;

        this.reserves[resource] = Math.max(0, (this.reserves[resource] || 0) - exportQty);
      }
    });

    // Update main ledger
    this.ledger.totalExports += periodLedger.exports;
    this.ledger.totalImports += periodLedger.imports;
    this.ledger.netBalance = this.ledger.totalExports - this.ledger.totalImports;
    this.ledger.tariffRevenuesCollected += periodLedger.tariffRevenue;
    this.ledger.subsidiesPaidOut += periodLedger.subsidiesPaid;

    return periodLedger;
  }

  /**
   * Set import tariff for a specific resource.
   */
  setTariff(resourceType, rate) {
    if (this.tariffs[resourceType] !== undefined) {
      this.tariffs[resourceType] = clamp(rate, 0.0, 0.50);
    }
  }

  /**
   * Summary overview of external trade balance.
   */
  getTradeSummary() {
    return {
      netBalance: Math.round(this.ledger.netBalance),
      status: this.ledger.netBalance >= 0 ? 'TRADE_SURPLUS' : 'TRADE_DEFICIT',
      totalExports: Math.round(this.ledger.totalExports),
      totalImports: Math.round(this.ledger.totalImports),
      tariffRevenueCollected: Math.round(this.ledger.tariffRevenuesCollected),
      activeHubCount: this.hubs.size,
      bottlenecks: [...this.bottlenecks],
      reserves: { ...this.reserves }
    };
  }
}
