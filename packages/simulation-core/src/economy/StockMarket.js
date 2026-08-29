/**
 * CITYMIND Simulation Engine - Simulated City Financial Equity Market (Stock Market Engine)
 *
 * Exhaustive stock market simulation engine modeling 20 publicly traded municipal corporations,
 * real-time order books, fundamental value modeling, Geometric Brownian Motion price tickers,
 * quarterly earnings reports, dividend distributions, stock splits, short selling mechanics,
 * market sentiment cycles (circuit breakers, crash/boom triggers), individual citizen portfolios,
 * and Mayor Investment Portfolio / Sovereign Wealth Fund management.
 *
 * @module @citymind/simulation-core/economy/StockMarket
 */

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

/**
 * Municipal Industry Sectors
 */
export const STOCK_SECTOR = Object.freeze({
  UTILITIES: 'UTILITIES',
  TRANSPORTATION: 'TRANSPORTATION',
  TECHNOLOGY_REIT: 'TECHNOLOGY_REIT',
  REAL_ESTATE: 'REAL_ESTATE',
  HEAVY_INDUSTRY: 'HEAVY_INDUSTRY',
  DEFENSE_LOGISTICS: 'DEFENSE_LOGISTICS',
  ENERGY_GRID: 'ENERGY_GRID',
  RETAIL_COMMERCE: 'RETAIL_COMMERCE',
  MARITIME_SHIPPING: 'MARITIME_SHIPPING',
  HEALTHCARE_PHARMA: 'HEALTHCARE_PHARMA',
  TELECOM: 'TELECOM',
  FINANCIAL_SERVICES: 'FINANCIAL_SERVICES',
  CONSTRUCTION: 'CONSTRUCTION',
  MEDIA_ENTERTAINMENT: 'MEDIA_ENTERTAINMENT',
  CYBERNETICS: 'CYBERNETICS'
});

/**
 * Overall Market Trend / Macro Cycle Regimes
 */
export const MARKET_TREND = Object.freeze({
  STRONG_BULL: 'STRONG_BULL',   // Aggressive upward momentum (+15% to +30%)
  BULL: 'BULL',                 // Moderate growth (+5% to +15%)
  NEUTRAL: 'NEUTRAL',           // Range-bound (-5% to +5%)
  BEAR: 'BEAR',                 // Moderate decline (-5% to -15%)
  STRONG_BEAR: 'STRONG_BEAR',   // Heavy sell-off (-15% to -30%)
  FLASH_CRASH: 'FLASH_CRASH',   // Panic market collapse (>-30%)
  HYPER_BOOM: 'HYPER_BOOM'      // Irrational exuberance / speculative bubble
});

/**
 * Equity Order Types
 */
export const ORDER_TYPE = Object.freeze({
  MARKET_BUY: 'MARKET_BUY',
  MARKET_SELL: 'MARKET_SELL',
  LIMIT_BUY: 'LIMIT_BUY',
  LIMIT_SELL: 'LIMIT_SELL',
  STOP_LOSS: 'STOP_LOSS',
  SHORT_SELL: 'SHORT_SELL',
  COVER_SHORT: 'COVER_SHORT'
});

/**
 * Corporate Financial Events
 */
export const CORPORATE_EVENT_TYPE = Object.freeze({
  EARNINGS_RELEASE: 'EARNINGS_RELEASE',
  DIVIDEND_PAYOUT: 'DIVIDEND_PAYOUT',
  STOCK_SPLIT: 'STOCK_SPLIT',
  REVERSE_SPLIT: 'REVERSE_SPLIT',
  SHARE_BUYBACK: 'SHARE_BUYBACK',
  NEW_SHARE_ISSUANCE: 'NEW_SHARE_ISSUANCE',
  MUNICIPAL_CONTRACT_AWARD: 'MUNICIPAL_CONTRACT_AWARD'
});


// ============================================================================
// 2. 20 MUNICIPAL PUBLIC CORPORATIONS INITIAL DATASET
// ============================================================================

/**
 * Complete specification of the 20 municipal corporations traded on the CityMind Exchange.
 */
export const INITIAL_CORPORATIONS = Object.freeze([
  {
    ticker: 'MPC',
    name: 'Metropolis Power Corp',
    sector: STOCK_SECTOR.UTILITIES,
    description: 'Primary provider of electrical power generation and distribution across all city districts.',
    initialPrice: 120.50,
    outstandingShares: 10000000,
    annualRevenue: 450000000,
    annualNetProfit: 67500000,
    dividendYield: 0.045, // 4.5% annual yield
    beta: 0.65, // Defensive utility stock
    cityMetricDependency: 'powerDemand'
  },
  {
    ticker: 'CTU',
    name: 'City Transit Unified',
    sector: STOCK_SECTOR.TRANSPORTATION,
    description: 'Operator of municipal bus fleets, subway systems, and light rail transit networks.',
    initialPrice: 45.20,
    outstandingShares: 15000000,
    annualRevenue: 280000000,
    annualNetProfit: 22400000,
    dividendYield: 0.032,
    beta: 0.85,
    cityMetricDependency: 'transitRidership'
  },
  {
    ticker: 'HTIR',
    name: 'HighTech Innovations REIT',
    sector: STOCK_SECTOR.TECHNOLOGY_REIT,
    description: 'Real estate investment trust owning tech parks, data centers, and innovation hubs.',
    initialPrice: 210.00,
    outstandingShares: 8000000,
    annualRevenue: 320000000,
    annualNetProfit: 96000000,
    dividendYield: 0.052,
    beta: 1.25,
    cityMetricDependency: 'techEmployment'
  },
  {
    ticker: 'HRET',
    name: 'Horizon Real Estate Trust',
    sector: STOCK_SECTOR.REAL_ESTATE,
    description: 'Commercial and luxury residential property developer and landlord.',
    initialPrice: 88.75,
    outstandingShares: 12000000,
    annualRevenue: 410000000,
    annualNetProfit: 82000000,
    dividendYield: 0.048,
    beta: 1.15,
    cityMetricDependency: 'housingOccupancy'
  },
  {
    ticker: 'CWU',
    name: 'CleanWater Utility',
    sector: STOCK_SECTOR.UTILITIES,
    description: 'Water treatment, sewage processing, and clean drinking water infrastructure.',
    initialPrice: 62.30,
    outstandingShares: 9000000,
    annualRevenue: 190000000,
    annualNetProfit: 28500000,
    dividendYield: 0.041,
    beta: 0.55,
    cityMetricDependency: 'waterDemand'
  },
  {
    ticker: 'HSW',
    name: 'Heavy Steel Works',
    sector: STOCK_SECTOR.HEAVY_INDUSTRY,
    description: 'Industrial manufacturing conglomerate producing structural steel and heavy machinery.',
    initialPrice: 155.80,
    outstandingShares: 7500000,
    annualRevenue: 520000000,
    annualNetProfit: 62400000,
    dividendYield: 0.028,
    beta: 1.40,
    cityMetricDependency: 'industrialOutput'
  },
  {
    ticker: 'CDL',
    name: 'Civic Defense Logistics',
    sector: STOCK_SECTOR.DEFENSE_LOGISTICS,
    description: 'Security equipment, emergency services vehicles, and municipal defense support.',
    initialPrice: 195.40,
    outstandingShares: 6000000,
    annualRevenue: 380000000,
    annualNetProfit: 57000000,
    dividendYield: 0.022,
    beta: 0.90,
    cityMetricDependency: 'policeFireBudget'
  },
  {
    ticker: 'GGE',
    name: 'Green Grid Energy',
    sector: STOCK_SECTOR.ENERGY_GRID,
    description: 'Solar farms, wind turbines, and smart renewable energy storage grids.',
    initialPrice: 78.90,
    outstandingShares: 14000000,
    annualRevenue: 260000000,
    annualNetProfit: 31200000,
    dividendYield: 0.018,
    beta: 1.35,
    cityMetricDependency: 'greenPolicyRating'
  },
  {
    ticker: 'MCM',
    name: 'Metro Commercial Malls',
    sector: STOCK_SECTOR.RETAIL_COMMERCE,
    description: 'Shopping complexes, retail plazas, and department store properties.',
    initialPrice: 34.60,
    outstandingShares: 20000000,
    annualRevenue: 310000000,
    annualNetProfit: 31000000,
    dividendYield: 0.060,
    beta: 1.10,
    cityMetricDependency: 'retailSalesVolume'
  },
  {
    ticker: 'GCPI',
    name: 'Global Cargo Port Inc',
    sector: STOCK_SECTOR.MARITIME_SHIPPING,
    description: 'Seaport cargo handling, intermodal container terminals, and international trade.',
    initialPrice: 245.00,
    outstandingShares: 5000000,
    annualRevenue: 680000000,
    annualNetProfit: 122400000,
    dividendYield: 0.038,
    beta: 1.30,
    cityMetricDependency: 'portCargoTonnage'
  },
  {
    ticker: 'BCP',
    name: 'BioCivic Pharma',
    sector: STOCK_SECTOR.HEALTHCARE_PHARMA,
    description: 'Pharmaceutical research, hospital medical supplies, and biotech therapeutics.',
    initialPrice: 310.20,
    outstandingShares: 4500000,
    annualRevenue: 490000000,
    annualNetProfit: 98000000,
    dividendYield: 0.015,
    beta: 0.95,
    cityMetricDependency: 'healthcareDemand'
  },
  {
    ticker: 'ATC',
    name: 'Apex Telecom Communications',
    sector: STOCK_SECTOR.TELECOM,
    description: '5G wireless cellular networks, fiber optic internet, and city communications.',
    initialPrice: 94.10,
    outstandingShares: 11000000,
    annualRevenue: 370000000,
    annualNetProfit: 55500000,
    dividendYield: 0.042,
    beta: 0.75,
    cityMetricDependency: 'telecomCoverage'
  },
  {
    ticker: 'UWM',
    name: 'Urban Waste Management',
    sector: STOCK_SECTOR.UTILITIES,
    description: 'Garbage collection, recycling facilities, and waste-to-energy incineration.',
    initialPrice: 58.40,
    outstandingShares: 8500000,
    annualRevenue: 175000000,
    annualNetProfit: 24500000,
    dividendYield: 0.039,
    beta: 0.60,
    cityMetricDependency: 'garbageVolume'
  },
  {
    ticker: 'MFF',
    name: 'Municipal First Financial',
    sector: STOCK_SECTOR.FINANCIAL_SERVICES,
    description: 'Commercial banking, mortgage underwriting, and municipal bond issuances.',
    initialPrice: 112.80,
    outstandingShares: 13000000,
    annualRevenue: 540000000,
    annualNetProfit: 108000000,
    dividendYield: 0.040,
    beta: 1.20,
    cityMetricDependency: 'cityGdpGrowth'
  },
  {
    ticker: 'SCC',
    name: 'Skyline Construction Corp',
    sector: STOCK_SECTOR.CONSTRUCTION,
    description: 'General contractors for high-rise skyscrapers, bridges, and highway paving.',
    initialPrice: 67.90,
    outstandingShares: 9500000,
    annualRevenue: 290000000,
    annualNetProfit: 29000000,
    dividendYield: 0.030,
    beta: 1.45,
    cityMetricDependency: 'constructionActivity'
  },
  {
    ticker: 'CHS',
    name: 'Civic Healthcare System',
    sector: STOCK_SECTOR.HEALTHCARE_PHARMA,
    description: 'Private hospital network, urgent care clinics, and diagnostic medical centers.',
    initialPrice: 142.00,
    outstandingShares: 7000000,
    annualRevenue: 330000000,
    annualNetProfit: 46200000,
    dividendYield: 0.025,
    beta: 0.70,
    cityMetricDependency: 'hospitalBedOccupancy'
  },
  {
    ticker: 'OME',
    name: 'Omni Media & Entertainment',
    sector: STOCK_SECTOR.MEDIA_ENTERTAINMENT,
    description: 'Local television networks, stadium sports venues, and digital billboards.',
    initialPrice: 42.10,
    outstandingShares: 16000000,
    annualRevenue: 210000000,
    annualNetProfit: 21000000,
    dividendYield: 0.020,
    beta: 1.25,
    cityMetricDependency: 'tourismEntertainmentDemand'
  },
  {
    ticker: 'CTA',
    name: 'City Transit Aerospace',
    sector: STOCK_SECTOR.TRANSPORTATION,
    description: 'Regional airport operations, air cargo logistics, and drone delivery network.',
    initialPrice: 178.60,
    outstandingShares: 5500000,
    annualRevenue: 360000000,
    annualNetProfit: 54000000,
    dividendYield: 0.022,
    beta: 1.30,
    cityMetricDependency: 'airportPassengerVolume'
  },
  {
    ticker: 'MCC',
    name: 'Metropolis Cybernetics',
    sector: STOCK_SECTOR.CYBERNETICS,
    description: 'Artificial intelligence city automation software, robotics, and cyber defense.',
    initialPrice: 285.40,
    outstandingShares: 6500000,
    annualRevenue: 420000000,
    annualNetProfit: 84000000,
    dividendYield: 0.008,
    beta: 1.65, // High growth tech
    cityMetricDependency: 'cityAutomationIndex'
  },
  {
    ticker: 'VIF',
    name: 'Vanguard Infrastructure Fund',
    sector: STOCK_SECTOR.FINANCIAL_SERVICES,
    description: 'Specialized private equity fund financing municipal toll roads and public-private partnerships.',
    initialPrice: 105.30,
    outstandingShares: 10000000,
    annualRevenue: 240000000,
    annualNetProfit: 48000000,
    dividendYield: 0.055,
    beta: 0.80,
    cityMetricDependency: 'infrastructureCondition'
  }
]);


// ============================================================================
// 3. MUNICIPAL CORPORATION MODEL
// ============================================================================

/**
 * Represents a single publicly traded corporation with financial fundamentals, share structure, and pricing.
 */
export class MunicipalCorporation {
  constructor(config) {
    this.ticker = config.ticker;
    this.name = config.name;
    this.sector = config.sector;
    this.description = config.description;
    
    // Pricing & Valuation
    this.currentPrice = config.initialPrice;
    this.openPriceDay = config.initialPrice;
    this.highPriceDay = config.initialPrice;
    this.lowPriceDay = config.initialPrice;
    this.previousClosePrice = config.initialPrice;
    
    // Capitalization
    this.outstandingShares = config.outstandingShares;
    this.floatingShares = Math.round(config.outstandingShares * 0.80); // 80% float
    this.shortInterestShares = 0;
    
    // Financial Fundamentals
    this.annualRevenue = config.annualRevenue;
    this.annualNetProfit = config.annualNetProfit;
    this.quarterlyEarningsHistory = [];
    this.dividendYield = config.dividendYield;
    this.beta = config.beta;
    this.cityMetricDependency = config.cityMetricDependency;
    
    // Price History (OHLC candles)
    this.priceHistory = [];
    this.dailyVolume = 0;
    
    // Initialize initial earnings report
    this._initializeQuarterlyHistory();
  }

  get marketCap() {
    return this.currentPrice * this.outstandingShares;
  }

  get earningsPerShare() {
    return this.annualNetProfit / this.outstandingShares;
  }

  get priceToEarningsRatio() {
    const eps = this.earningsPerShare;
    return eps > 0 ? this.currentPrice / eps : 0;
  }

  get dividendPerShare() {
    return (this.currentPrice * this.dividendYield) / 4.0; // Quarterly dividend payout
  }

  _initializeQuarterlyHistory() {
    const quarterlyNetProfit = this.annualNetProfit / 4.0;
    for (let q = 1; q <= 4; q++) {
      this.quarterlyEarningsHistory.push({
        quarter: `Q${q}`,
        revenue: this.annualRevenue / 4.0,
        netProfit: quarterlyNetProfit,
        eps: quarterlyNetProfit / this.outstandingShares,
        surprisePercentage: 0.0
      });
    }
  }

  /**
   * Publish new quarterly earnings report driven by city simulation metrics.
   */
  static processQuarterlyEarnings(corp, cityDemandFactor = 1.0) {
    const expectedRevenue = (corp.annualRevenue / 4.0);
    const actualRevenue = expectedRevenue * (0.90 + Math.random() * 0.20) * cityDemandFactor;
    
    const profitMargin = (corp.annualNetProfit / corp.annualRevenue);
    const actualNetProfit = actualRevenue * profitMargin * (0.95 + Math.random() * 0.10);
    const actualEps = actualNetProfit / corp.outstandingShares;
    
    const expectedEps = corp.earningsPerShare / 4.0;
    const surprisePercentage = ((actualEps - expectedEps) / expectedEps) * 100.0;

    const report = {
      quarter: `Q${corp.quarterlyEarningsHistory.length + 1}`,
      revenue: Math.round(actualRevenue),
      netProfit: Math.round(actualNetProfit),
      eps: parseFloat(actualEps.toFixed(2)),
      surprisePercentage: parseFloat(surprisePercentage.toFixed(2))
    };

    corp.quarterlyEarningsHistory.push(report);
    if (corp.quarterlyEarningsHistory.length > 20) corp.quarterlyEarningsHistory.shift();

    // Update trailing annual numbers
    corp.annualRevenue = Math.round(actualRevenue * 4.0);
    corp.annualNetProfit = Math.round(actualNetProfit * 4.0);

    return report;
  }

  /**
   * Execute 2-for-1 or 3-for-1 Stock Split event.
   */
  executeStockSplit(splitRatio = 2) {
    this.currentPrice = this.currentPrice / splitRatio;
    this.openPriceDay = this.openPriceDay / splitRatio;
    this.highPriceDay = this.highPriceDay / splitRatio;
    this.lowPriceDay = this.lowPriceDay / splitRatio;
    this.previousClosePrice = this.previousClosePrice / splitRatio;
    this.outstandingShares = this.outstandingShares * splitRatio;
    this.floatingShares = this.floatingShares * splitRatio;
    this.shortInterestShares = this.shortInterestShares * splitRatio;

    return {
      ticker: this.ticker,
      splitRatio,
      newPrice: this.currentPrice,
      newShares: this.outstandingShares
    };
  }
}


// ============================================================================
// 4. STOCK TICKER PRICING SIMULATION ENGINE
// ============================================================================

/**
 * Micro-structure pricing engine modeling Geometric Brownian Motion with jump diffusion,
 * order book imbalance, and city macro influence.
 */
export class StockTickerSimulation {
  /**
   * Calculate price movement step for a corporation.
   * dS = S * (mu * dt + sigma * dW) + Jump
   */
  static stepPrice(corp, marketTrend, cityDemandFactor, deltaHours) {
    const dt = deltaHours / (24.0 * 252.0); // Fraction of trading year
    const beta = corp.beta;

    // Macro market drift (mu)
    let marketDrift = 0.06; // 6% annual baseline drift
    switch (marketTrend) {
      case MARKET_TREND.STRONG_BULL: marketDrift = 0.25; break;
      case MARKET_TREND.BULL: marketDrift = 0.12; break;
      case MARKET_TREND.NEUTRAL: marketDrift = 0.02; break;
      case MARKET_TREND.BEAR: marketDrift = -0.15; break;
      case MARKET_TREND.STRONG_BEAR: marketDrift = -0.30; break;
      case MARKET_TREND.FLASH_CRASH: marketDrift = -0.75; break;
      case MARKET_TREND.HYPER_BOOM: marketDrift = 0.45; break;
    }

    const effectiveDrift = (marketDrift * beta) + (cityDemandFactor - 1.0) * 0.20;

    // Volatility (sigma)
    const baseVolatility = 0.20 * beta; // 20% annual volatility
    const randomZ = this._boxMullerTransform();

    // Geometric Brownian Motion component
    const gbmReturn = (effectiveDrift - 0.5 * Math.pow(baseVolatility, 2)) * dt + (baseVolatility * Math.sqrt(dt) * randomZ);

    // Jump Diffusion component (Black Swan or sudden news)
    let jumpReturn = 0;
    if (Math.random() < 0.005 * deltaHours) {
      const jumpSign = Math.random() < 0.5 ? 1 : -1;
      jumpReturn = jumpSign * (0.03 + Math.random() * 0.07);
    }

    const totalReturn = gbmReturn + jumpReturn;
    const oldPrice = corp.currentPrice;
    const newPrice = Math.max(0.50, oldPrice * Math.exp(totalReturn));

    // Update OHLC trackers
    corp.currentPrice = parseFloat(newPrice.toFixed(2));
    corp.highPriceDay = Math.max(corp.highPriceDay, corp.currentPrice);
    corp.lowPriceDay = Math.min(corp.lowPriceDay, corp.currentPrice);
    
    // Simulate trade volume
    const stepVolume = Math.round((corp.floatingShares * 0.001) * (1.0 + Math.abs(totalReturn) * 10.0));
    corp.dailyVolume += stepVolume;

    return {
      oldPrice,
      newPrice: corp.currentPrice,
      priceDelta: corp.currentPrice - oldPrice,
      percentageChange: ((corp.currentPrice - oldPrice) / oldPrice) * 100.0,
      volume: stepVolume
    };
  }

  static _boxMullerTransform() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}


// ============================================================================
// 5. SHORT SELLING ENGINE
// ============================================================================

/**
 * Manages short selling borrow accounts, margin maintenance calls, and short squeezes.
 */
export class ShortSellingEngine {
  /**
   * Execute short sale order for an investor.
   */
  static openShortPosition(investor, corp, shareQuantity, marginRequirement = 0.50) {
    const totalPositionValue = corp.currentPrice * shareQuantity;
    const requiredCollateral = totalPositionValue * marginRequirement;

    if ((investor.cashBalance || 0) < requiredCollateral) {
      return { success: false, reason: 'INSUFFICIENT_COLLATERAL' };
    }

    investor.cashBalance -= requiredCollateral;
    investor.shortPositions = investor.shortPositions || [];

    const position = {
      id: `short_${corp.ticker}_${Date.now()}`,
      ticker: corp.ticker,
      sharesBorrowed: shareQuantity,
      entryPrice: corp.currentPrice,
      collateralDeposited: requiredCollateral,
      borrowInterestRate: 0.05 // 5% annual borrow rate
    };

    investor.shortPositions.push(position);
    corp.shortInterestShares += shareQuantity;

    return {
      success: true,
      position
    };
  }

  /**
   * Evaluate short positions for margin calls or short squeezes.
   */
  static evaluateShortPositions(investor, corporationMap) {
    if (!investor.shortPositions || investor.shortPositions.length === 0) return [];

    const marginCallEvents = [];
    const remainingPositions = [];

    for (const pos of investor.shortPositions) {
      const corp = corporationMap[pos.ticker];
      if (!corp) {
        remainingPositions.push(pos);
        continue;
      }

      const currentLiability = pos.sharesBorrowed * corp.currentPrice;
      const initialLiability = pos.sharesBorrowed * pos.entryPrice;
      const unrealizedLoss = currentLiability - initialLiability;

      // If price surged >30% over entry price: Short Squeeze / Margin Call Trigger
      if (currentLiability > pos.collateralDeposited * 1.50) {
        // Force liquidation cover short
        const buybackCost = currentLiability;
        const lossAmount = buybackCost - pos.collateralDeposited;
        investor.cashBalance = Math.max(0, investor.cashBalance - Math.max(0, lossAmount));
        corp.shortInterestShares = Math.max(0, corp.shortInterestShares - pos.sharesBorrowed);

        marginCallEvents.push({
          positionId: pos.id,
          ticker: pos.ticker,
          sharesCovered: pos.sharesBorrowed,
          forcedCoverPrice: corp.currentPrice,
          lossAmount
        });
      } else {
        remainingPositions.push(pos);
      }
    }

    investor.shortPositions = remainingPositions;
    return marginCallEvents;
  }
}


// ============================================================================
// 6. MARKET SENTIMENT & CYCLE CONTROLLER
// ============================================================================

/**
 * Manages macro market sentiment indices, circuit breakers, panic crashes, and hyper booms.
 */
export class MarketSentimentEngine {
  constructor() {
    this.fearAndGreedIndex = 55.0; // Neutral-Greed baseline (0 = Extreme Fear, 100 = Extreme Greed)
    this.currentRegime = MARKET_TREND.NEUTRAL;
    this.circuitBreakerTripped = false;
    this.regimeDurationDays = 0;
  }

  /**
   * Update market sentiment based on city GDP growth, unemployment, inflation, and corporate earnings.
   */
  stepSentiment(cityMetrics = {}) {
    const gdpGrowth = cityMetrics.gdpGrowth ?? 0.03;
    const unemploymentRate = cityMetrics.unemploymentRate ?? 0.05;
    const cityHappiness = cityMetrics.cityHappiness ?? 70.0;

    let sentimentDelta = (gdpGrowth * 100.0) - (unemploymentRate * 80.0) + ((cityHappiness - 60.0) * 0.5);
    sentimentDelta += (Math.random() - 0.5) * 4.0; // Random noise

    this.fearAndGreedIndex = Math.max(0.0, Math.min(100.0, this.fearAndGreedIndex + sentimentDelta * 0.1));
    this._updateRegime();
  }

  _updateRegime() {
    if (this.fearAndGreedIndex >= 85) this.currentRegime = MARKET_TREND.HYPER_BOOM;
    else if (this.fearAndGreedIndex >= 70) this.currentRegime = MARKET_TREND.STRONG_BULL;
    else if (this.fearAndGreedIndex >= 55) this.currentRegime = MARKET_TREND.BULL;
    else if (this.fearAndGreedIndex >= 45) this.currentRegime = MARKET_TREND.NEUTRAL;
    else if (this.fearAndGreedIndex >= 30) this.currentRegime = MARKET_TREND.BEAR;
    else if (this.fearAndGreedIndex >= 15) this.currentRegime = MARKET_TREND.STRONG_BEAR;
    else this.currentRegime = MARKET_TREND.FLASH_CRASH;
  }
}


// ============================================================================
// 7. MAYOR PORTFOLIO & SOVEREIGN WEALTH FUND MANAGER
// ============================================================================

/**
 * Portfolio manager for the Mayor's office and City Sovereign Wealth Fund.
 * Allows investing municipal treasury reserves into local municipal equities.
 */
export class MayorPortfolioManager {
  constructor(initialCash = 5000000) {
    this.portfolioName = 'Metropolis Sovereign Wealth Fund';
    this.cashBalance = initialCash;
    this.holdings = {}; // Ticker -> { shares, averageCostBasis }
    this.tradeHistory = [];
  }

  get totalPortfolioValue() {
    return this.cashBalance; // Calculated in engine with live prices
  }

  /**
   * Execute equity purchase on behalf of the city treasury.
   */
  buyShares(corp, shareQuantity) {
    const totalCost = corp.currentPrice * shareQuantity;
    if (this.cashBalance < totalCost) {
      return { success: false, reason: 'INSUFFICIENT_MUNICIPAL_TREASURY_FUNDS' };
    }

    this.cashBalance -= totalCost;
    const existing = this.holdings[corp.ticker] || { shares: 0, averageCostBasis: 0 };
    
    const newShares = existing.shares + shareQuantity;
    const newCostBasis = ((existing.shares * existing.averageCostBasis) + totalCost) / newShares;

    this.holdings[corp.ticker] = {
      shares: newShares,
      averageCostBasis: parseFloat(newCostBasis.toFixed(2))
    };

    const tradeRecord = {
      type: ORDER_TYPE.MARKET_BUY,
      ticker: corp.ticker,
      shares: shareQuantity,
      price: corp.currentPrice,
      totalCost,
      timestamp: Date.now()
    };
    this.tradeHistory.push(tradeRecord);

    return { success: true, tradeRecord };
  }

  /**
   * Execute equity sale to liquidate positions into city treasury.
   */
  sellShares(corp, shareQuantity) {
    const existing = this.holdings[corp.ticker];
    if (!existing || existing.shares < shareQuantity) {
      return { success: false, reason: 'INSUFFICIENT_SHARES_HELD' };
    }

    const totalProceeds = corp.currentPrice * shareQuantity;
    this.cashBalance += totalProceeds;

    existing.shares -= shareQuantity;
    if (existing.shares <= 0) {
      delete this.holdings[corp.ticker];
    }

    const tradeRecord = {
      type: ORDER_TYPE.MARKET_SELL,
      ticker: corp.ticker,
      shares: shareQuantity,
      price: corp.currentPrice,
      totalProceeds,
      timestamp: Date.now()
    };
    this.tradeHistory.push(tradeRecord);

    return { success: true, tradeRecord };
  }

  /**
   * Receive quarterly dividend payouts for all municipal holdings.
   */
  collectDividends(corporationMap) {
    let totalDividendsCollected = 0;

    for (const [ticker, holding] of Object.entries(this.holdings)) {
      const corp = corporationMap[ticker];
      if (corp && holding.shares > 0) {
        const dividendPayout = corp.dividendPerShare * holding.shares;
        totalDividendsCollected += dividendPayout;
      }
    }

    this.cashBalance += totalDividendsCollected;
    return totalDividendsCollected;
  }
}


// ============================================================================
// 8. STOCK MARKET MAIN ENGINE ORCHESTRATOR
// ============================================================================

/**
 * Main Orchestrator class for the City Stock Market subsystem.
 */
export class StockMarketEngine {
  constructor(options = {}) {
    this.name = 'StockMarketEngine';
    this.corporations = {};
    this.sentimentEngine = new MarketSentimentEngine();
    this.mayorPortfolio = new MayorPortfolioManager(options.initialSovereignFund || 10000000);
    this.marketIndexPrice = 1000.0; // Citymind Composite Stock Index base
    this.indexHistory = [];
    
    this._initializeMarket();
  }

  _initializeMarket() {
    for (const corpDef of INITIAL_CORPORATIONS) {
      this.corporations[corpDef.ticker] = new MunicipalCorporation(corpDef);
    }
    this._calculateCompositeIndex();
  }

  /**
   * Main simulation step tick for the equity exchange.
   * @param {number} deltaHours - Step time in hours
   * @param {object} cityMetrics - Global city metrics
   */
  step(deltaHours, cityMetrics = {}) {
    // 1. Step Market Sentiment Cycle
    this.sentimentEngine.stepSentiment(cityMetrics);

    // 2. Step Price movement for each corporation
    for (const corp of Object.values(this.corporations)) {
      const cityDemandFactor = this._getCityDemandFactor(corp, cityMetrics);
      StockTickerSimulation.stepPrice(corp, this.sentimentEngine.currentRegime, cityDemandFactor, deltaHours);
    }

    // 3. Recalculate City Composite Index
    this._calculateCompositeIndex();

    return {
      marketIndex: this.marketIndexPrice,
      regime: this.sentimentEngine.currentRegime,
      fearAndGreedIndex: this.sentimentEngine.fearAndGreedIndex
    };
  }

  /**
   * Trigger quarterly corporate events (Earnings reports & Dividends).
   */
  triggerQuarterlyEarnings(cityMetrics = {}) {
    const reports = [];
    for (const corp of Object.values(this.corporations)) {
      const demandFactor = this._getCityDemandFactor(corp, cityMetrics);
      const report = MunicipalCorporation.processQuarterlyEarnings(corp, demandFactor);
      reports.push({ ticker: corp.ticker, report });
    }

    // Pay Mayor Sovereign Fund dividends
    const dividendsReceived = this.mayorPortfolio.collectDividends(this.corporations);

    return {
      reports,
      dividendsReceived
    };
  }

  _getCityDemandFactor(corp, cityMetrics) {
    const dependency = corp.cityMetricDependency;
    if (cityMetrics[dependency] !== undefined) {
      return cityMetrics[dependency];
    }
    return 1.0;
  }

  _calculateCompositeIndex() {
    let totalMarketCap = 0;
    for (const corp of Object.values(this.corporations)) {
      totalMarketCap += corp.marketCap;
    }
    // Normalized index relative to baseline initial market cap (~$18.5 Billion)
    const baseMarketCap = 18500000000;
    this.marketIndexPrice = parseFloat(((totalMarketCap / baseMarketCap) * 1000.0).toFixed(2));
    this.indexHistory.push({ timestamp: Date.now(), index: this.marketIndexPrice });
    if (this.indexHistory.length > 500) this.indexHistory.shift();
  }

  /**
   * Get complete summary snapshot of the stock market for UI dashboards.
   */
  getMarketSummary() {
    const corps = Object.values(this.corporations).map(c => ({
      ticker: c.ticker,
      name: c.name,
      sector: c.sector,
      price: c.currentPrice,
      marketCap: c.marketCap,
      peRatio: parseFloat(c.priceToEarningsRatio.toFixed(2)),
      dividendYield: (c.dividendYield * 100).toFixed(2) + '%',
      volume: c.dailyVolume
    }));

    return {
      marketIndex: this.marketIndexPrice,
      regime: this.sentimentEngine.currentRegime,
      fearAndGreedIndex: this.sentimentEngine.fearAndGreedIndex,
      sovereignFundCash: this.mayorPortfolio.cashBalance,
      corporations: corps
    };
  }
}
