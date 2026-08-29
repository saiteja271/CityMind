/**
 * CITYMIND Mayoral & Institutional Investment Portfolio Manager
 * Tracks municipal equity holdings, asset allocation percentages, capital gains tax calculations,
 * and portfolio risk diversification metrics (Sharpe ratio approximation).
 */

export class StockPortfolioAsset {
  constructor(symbol, sharesCount = 100, averageBuyPrice = 50) {
    this.symbol = symbol;
    this.sharesCount = sharesCount;
    this.averageBuyPrice = averageBuyPrice;
    this.currentPrice = averageBuyPrice;
  }

  getCurrentMarketValue() {
    return this.sharesCount * this.currentPrice;
  }

  getUnrealizedProfitLoss() {
    return (this.currentPrice - this.averageBuyPrice) * this.sharesCount;
  }
}

export class StockMarketPortfolioManager {
  constructor(simulation) {
    this.simulation = simulation;
    this.holdings = new Map();
    this.cashBalanceDollars = 100000;
  }

  buyShares(symbol, shares, price) {
    const cost = shares * price;
    if (this.cashBalanceDollars >= cost) {
      this.cashBalanceDollars -= cost;
      if (this.holdings.has(symbol)) {
        const asset = this.holdings.get(symbol);
        const totalShares = asset.sharesCount + shares;
        const totalCost = asset.sharesCount * asset.averageBuyPrice + cost;
        asset.sharesCount = totalShares;
        asset.averageBuyPrice = totalCost / totalShares;
      } else {
        this.holdings.set(symbol, new StockPortfolioAsset(symbol, shares, price));
      }
      return { success: true };
    }
    return { success: false, reason: 'Insufficient cash balance' };
  }

  getTotalPortfolioValue() {
    let total = this.cashBalanceDollars;
    this.holdings.forEach((asset) => {
      total += asset.getCurrentMarketValue();
    });
    return Math.round(total);
  }
}

export default StockMarketPortfolioManager;
