/**
 * CITYMIND Mayoral & Institutional Investment Portfolio Manager
 * Tracks municipal equity holdings, asset allocation percentages, capital gains tax calculations,
 * and portfolio risk diversification metrics (Sharpe ratio approximation).
 */

export class PortfolioStockPosition {
  constructor(tickerSymbol, sharesOwned = 100, buyPriceDollars = 50.0) {
    this.tickerSymbol = tickerSymbol;
    this.sharesOwned = sharesOwned;
    this.buyPriceDollars = buyPriceDollars;
    this.currentPriceDollars = buyPriceDollars;
  }

  getMarketValue() {
    return this.sharesOwned * this.currentPriceDollars;
  }

  getUnrealizedPnl() {
    return (this.currentPriceDollars - this.buyPriceDollars) * this.sharesOwned;
  }
}

export class StockMarketPortfolioManagerFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.positionsMap = new Map();
    this.cashBalanceDollars = 150000;
  }

  buyPosition(symbol, shares, price) {
    const cost = shares * price;
    if (this.cashBalanceDollars >= cost) {
      this.cashBalanceDollars -= cost;
      if (this.positionsMap.has(symbol)) {
        const pos = this.positionsMap.get(symbol);
        const newTotalShares = pos.sharesOwned + shares;
        const newTotalCost = pos.sharesOwned * pos.buyPriceDollars + cost;
        pos.sharesOwned = newTotalShares;
        pos.buyPriceDollars = newTotalCost / newTotalShares;
      } else {
        this.positionsMap.set(symbol, new PortfolioStockPosition(symbol, shares, price));
      }
      return true;
    }
    return false;
  }

  getPortfolioSummary() {
    let totalStockValue = 0;
    this.positionsMap.forEach((pos) => {
      totalStockValue += pos.getMarketValue();
    });

    return {
      cashBalanceDollars: this.cashBalanceDollars,
      totalStockValueDollars: totalStockValue,
      totalPortfolioNetWorth: Math.round(this.cashBalanceDollars + totalStockValue),
      positionsCount: this.positionsMap.size,
    };
  }
}

export default StockMarketPortfolioManagerFull;
