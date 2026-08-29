/**
 * MarketSystem.js - Microeconomic commercial goods, labor market, and business operating engine.
 * Models price elasticity curves ($P = P_{base} \times (D / S)^\epsilon$), commodity market clearing,
 * business P&L accounting, bankruptcy liquidation, and supply/demand driven wage adjustments.
 */

import { clamp, randomRange, generateId } from '@citymind/utilities';

export const COMMODITY_TYPE = {
  FOOD: 'FOOD',
  CONSUMER_GOODS: 'CONSUMER_GOODS',
  LUXURY_GOODS: 'LUXURY_GOODS',
  BUILDING_MATERIALS: 'BUILDING_MATERIALS',
  RAW_MATERIALS: 'RAW_MATERIALS'
};

export const COMMODITY_DEFAULTS = {
  [COMMODITY_TYPE.FOOD]: { basePrice: 15.0, elasticity: 0.3, minPrice: 5.0, maxPrice: 100.0 },
  [COMMODITY_TYPE.CONSUMER_GOODS]: { basePrice: 50.0, elasticity: 0.7, minPrice: 15.0, maxPrice: 300.0 },
  [COMMODITY_TYPE.LUXURY_GOODS]: { basePrice: 250.0, elasticity: 1.4, minPrice: 80.0, maxPrice: 2000.0 },
  [COMMODITY_TYPE.BUILDING_MATERIALS]: { basePrice: 100.0, elasticity: 0.5, minPrice: 30.0, maxPrice: 800.0 },
  [COMMODITY_TYPE.RAW_MATERIALS]: { basePrice: 40.0, elasticity: 0.4, minPrice: 10.0, maxPrice: 250.0 }
};

export class BusinessEntity {
  constructor(config = {}) {
    this.id = config.id || generateId('biz');
    this.name = config.name || 'City Business Corp';
    this.category = config.category || 'commercial'; // 'commercial' | 'industrial'
    this.buildingId = config.buildingId || null;
    this.x = config.x || 0;
    this.y = config.y || 0;

    // Financial Balances
    this.treasury = config.startingCapital ?? 25000;
    this.revenue = 0;
    this.expenses = 0;
    this.profitHistory = [];

    // Operations & Labor
    this.employees = []; // Array of citizen IDs
    this.maxEmployees = config.capacity || 10;
    this.wageRate = config.startingWage || 2500; // Monthly salary per employee
    this.requiredEducation = config.requiredEducation || 1;

    // Inventory & Commodity Trade
    this.commodityType = config.commodityType || COMMODITY_TYPE.CONSUMER_GOODS;
    this.inventory = config.startingInventory || 100;
    this.maxInventory = 1000;
    this.productionRate = config.productionRate || 20; // Units produced per tick

    // Solvency State
    this.isBankrupt = false;
    this.ticksInLoss = 0;
  }
}

export class MarketSystem {
  constructor() {
    // Commodity Market Data: Map commodityType -> MarketData
    this.commodities = new Map();
    this._initializeCommodityMarkets();

    // Map businessId -> BusinessEntity
    this.businesses = new Map();

    // Minimum Wage Policy
    this.minimumWage = 1500;
  }

  _initializeCommodityMarkets() {
    Object.keys(COMMODITY_TYPE).forEach((key) => {
      const type = COMMODITY_TYPE[key];
      const defaults = COMMODITY_DEFAULTS[type];
      this.commodities.set(type, {
        type,
        basePrice: defaults.basePrice,
        currentPrice: defaults.basePrice,
        elasticity: defaults.elasticity,
        supply: 500,
        demand: 500,
        minPrice: defaults.minPrice,
        maxPrice: defaults.maxPrice,
        priceHistory: []
      });
    });
  }

  /**
   * Register a new business enterprise into the market system.
   * @param {Object} businessConfig
   * @returns {BusinessEntity}
   */
  createBusiness(businessConfig) {
    const biz = new BusinessEntity(businessConfig);
    this.businesses.set(biz.id, biz);
    return biz;
  }

  /**
   * Primary Market Tick.
   * 1. Updates commodity supply & demand equilibrium prices ($P = P_{base} \cdot (D / S)^\epsilon$).
   * 2. Executes business P&L accounting (revenues, material costs, wages).
   * 3. Triggers worker salary adjustments based on labor market tightness.
   * 4. Evaluates bankruptcy liquidations.
   *
   * @param {Array<Object>} citizens - Active citizen population
   * @param {number} currentTick - Current game tick
   */
  tick(citizens = [], currentTick = 0) {
    // 1. Reset & Aggregate Market Supply and Demand Signals
    this._aggregateSupplyAndDemand(citizens);

    // 2. Clear Commodity Markets & Recalculate Prices
    this._clearCommodityPrices();

    // 3. Process Business Production & Financial P&L
    this._processBusinessPnL(currentTick);

    // 4. Adjust Labor Market Salaries
    this._adjustLaborMarketSalaries(citizens);

    // 5. Evaluate Bankruptcy Liquidation Triggers
    this._evaluateBankruptcies();
  }

  /**
   * Aggregate total demand from citizens and supply from active businesses.
   */
  _aggregateSupplyAndDemand(citizens) {
    // Reset market supply and demand counters
    this.commodities.forEach((market) => {
      market.supply = 50; // Base baseline
      market.demand = 50;
    });

    // Aggregate Demand from Citizen Wealth & Needs
    citizens.forEach((c) => {
      if (!c.alive) return;
      const wealth = c.wealth || 1000;

      // Food demand is inelastic & baseline for everyone
      const foodMkt = this.commodities.get(COMMODITY_TYPE.FOOD);
      if (foodMkt) foodMkt.demand += 1.0;

      // Consumer goods demand scaled by wealth
      if (wealth > 2000) {
        const cgMkt = this.commodities.get(COMMODITY_TYPE.CONSUMER_GOODS);
        if (cgMkt) cgMkt.demand += 0.8;
      }

      // Luxury goods demand for wealthy citizens
      if (wealth > 50000) {
        const luxMkt = this.commodities.get(COMMODITY_TYPE.LUXURY_GOODS);
        if (luxMkt) luxMkt.demand += 0.5;
      }
    });

    // Aggregate Supply from Active Business Inventory & Production
    this.businesses.forEach((biz) => {
      if (biz.isBankrupt) return;
      const mkt = this.commodities.get(biz.commodityType);
      if (mkt) {
        mkt.supply += biz.inventory + biz.productionRate * biz.employees.length;
      }
    });
  }

  /**
   * Recalculate prices based on Elasticity Curve: P = P_base * (Demand / Supply)^epsilon
   */
  _clearCommodityPrices() {
    this.commodities.forEach((mkt) => {
      const ratio = Math.max(0.1, mkt.demand / Math.max(1, mkt.supply));
      const rawPrice = mkt.basePrice * Math.pow(ratio, mkt.elasticity);

      mkt.currentPrice = clamp(rawPrice, mkt.minPrice, mkt.maxPrice);
      mkt.priceHistory.push(mkt.currentPrice);
      if (mkt.priceHistory.length > 30) mkt.priceHistory.shift();
    });
  }

  /**
   * Run business monthly P&L ledger updates.
   */
  _processBusinessPnL(currentTick) {
    this.businesses.forEach((biz) => {
      if (biz.isBankrupt) return;

      const mkt = this.commodities.get(biz.commodityType);
      const unitPrice = mkt ? mkt.currentPrice : 20.0;

      // 1. Goods Production & Sales
      const unitsProduced = biz.productionRate * Math.max(1, biz.employees.length);
      biz.inventory = Math.min(biz.maxInventory, biz.inventory + unitsProduced);

      // Sold units capped by inventory and market demand
      const unitsSold = Math.min(biz.inventory, Math.ceil(unitsProduced * 0.85));
      biz.inventory -= unitsSold;

      const grossRevenue = unitsSold * unitPrice;
      biz.revenue = grossRevenue;

      // 2. Expenses (Wage Payouts + Raw Material Costs + Facility Overhead)
      const wageExpenses = biz.employees.length * (biz.wageRate / 12);
      const rawMaterialCost = unitsProduced * 5.0;
      const facilityMaintenance = 500.0;

      biz.expenses = wageExpenses + rawMaterialCost + facilityMaintenance;
      const netProfit = biz.revenue - biz.expenses;

      biz.treasury += netProfit;
      biz.profitHistory.push(netProfit);
      if (biz.profitHistory.length > 12) biz.profitHistory.shift();

      // Track consecutive loss periods
      if (netProfit < 0) {
        biz.ticksInLoss++;
      } else {
        biz.ticksInLoss = Math.max(0, biz.ticksInLoss - 1);
      }
    });
  }

  /**
   * Dynamically adjust labor wages based on supply/demand ratio for skilled labor.
   */
  _adjustLaborMarketSalaries(citizens) {
    this.businesses.forEach((biz) => {
      if (biz.isBankrupt) return;

      const fillRatio = biz.employees.length / biz.maxEmployees;

      if (fillRatio < 0.5 && biz.treasury > 10000) {
        // Understaffed business increases salary offer to attract workers
        biz.wageRate = Math.min(15000, biz.wageRate * 1.05);
      } else if (fillRatio > 0.9 && biz.ticksInLoss > 2) {
        // Struggling overstaffed business reduces wage rate slightly
        biz.wageRate = Math.max(this.minimumWage, biz.wageRate * 0.97);
      }
    });
  }

  /**
   * Liquidate bankrupt businesses unable to meet payroll or debt obligations.
   */
  _evaluateBankruptcies() {
    this.businesses.forEach((biz) => {
      if (biz.isBankrupt) return;

      // Bankruptcy condition: Negative treasury below debt threshold or 6 consecutive loss periods
      if (biz.treasury < -15000 || biz.ticksInLoss >= 6) {
        biz.isBankrupt = true;
        biz.employees = []; // Lay off all workers
        biz.treasury = 0;
        biz.inventory = 0;
      }
    });
  }

  /**
   * Summary payload of market pricing & business statistics.
   */
  getMarketSummary() {
    const activeBiz = Array.from(this.businesses.values()).filter((b) => !b.isBankrupt).length;
    const bankruptCount = Array.from(this.businesses.values()).filter((b) => b.isBankrupt).length;

    const commodityPrices = {};
    this.commodities.forEach((mkt, type) => {
      commodityPrices[type] = Number(mkt.currentPrice.toFixed(2));
    });

    return {
      activeBusinesses: activeBiz,
      bankruptBusinesses: bankruptCount,
      minimumWage: this.minimumWage,
      commodityPrices
    };
  }
}
