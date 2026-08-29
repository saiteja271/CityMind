/**
 * CITYMIND Multi-City Commodity Trading & Global Supply Chain Engine
 * Simulates inter-city trade agreements, cargo transport logistics (Seaport, Cargo Airport, Rail Freight),
 * import/export tariffs, and supply chain bottleneck detection.
 */

export class TradeRouteOrder {
  constructor(id, commoditySymbol, orderType, unitQuantity, pricePerUnit, partnerCity) {
    this.id = id;
    this.commoditySymbol = commoditySymbol;
    this.orderType = orderType; // 'BUY' (Import) or 'SELL' (Export)
    this.unitQuantity = unitQuantity;
    this.pricePerUnit = pricePerUnit;
    this.partnerCity = partnerCity;
    this.status = 'Pending'; // 'Pending', 'InTransit', 'Completed', 'Cancelled'
    this.createdTimestamp = Date.now();
  }

  calculateTotalValue() {
    return Math.round(this.unitQuantity * this.pricePerUnit);
  }
}

export class TradeMarketEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeOrders = [];
    this.completedTradeHistory = [];
    this.totalMonthlyImportsValue = 0;
    this.totalMonthlyExportsValue = 0;
    this.tariffRatePct = 5.0; // 5% default import tariff
  }

  createTradeOrder(commoditySymbol, orderType, quantity, pricePerUnit, partnerCity = 'Regional Hub') {
    const id = `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = new TradeRouteOrder(id, commoditySymbol, orderType, quantity, pricePerUnit, partnerCity);
    this.activeOrders.push(order);
    return order;
  }

  update(deltaMonths) {
    let monthlyImports = 0;
    let monthlyExports = 0;

    const remainingOrders = [];
    this.activeOrders.forEach((order) => {
      // Simulate transit fulfillment probability
      if (Math.random() < 0.8) {
        order.status = 'Completed';
        const val = order.calculateTotalValue();
        if (order.orderType === 'BUY') {
          monthlyImports += val;
        } else {
          monthlyExports += val;
        }
        this.completedTradeHistory.push(order);
      } else {
        remainingOrders.push(order);
      }
    });

    this.activeOrders = remainingOrders;
    this.totalMonthlyImportsValue = monthlyImports;
    this.totalMonthlyExportsValue = monthlyExports;

    if (this.completedTradeHistory.length > 100) {
      this.completedTradeHistory = this.completedTradeHistory.slice(-50);
    }
  }

  getTradeSummary() {
    const tradeBalance = this.totalMonthlyExportsValue - this.totalMonthlyImportsValue;
    return {
      activeOrdersCount: this.activeOrders.length,
      totalMonthlyImportsValue: this.totalMonthlyImportsValue,
      totalMonthlyExportsValue: this.totalMonthlyExportsValue,
      tradeBalance,
      isTradeSurplus: tradeBalance >= 0,
      tariffRatePct: this.tariffRatePct,
    };
  }
}

export default TradeMarketEngine;
