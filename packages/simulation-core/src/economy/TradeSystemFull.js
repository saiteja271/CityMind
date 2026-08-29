/**
 * CITYMIND Inter-City Commodity Trade & Tariff Engine
 * External trade connections (import/export resources: raw ore, food, energy, high-tech components), tariff calculations, trade deficit/surplus tracking.
 */

export class TradeCommodityOrder {
  constructor(commodity = 'RAW_ORE', quantityUnits = 500, pricePerUnitDollars = 45) {
    this.commodity = commodity;
    this.quantityUnits = quantityUnits;
    this.pricePerUnitDollars = pricePerUnitDollars;
    this.tariffRatePct = 5.0;
  }

  getGrossValue() {
    return this.quantityUnits * this.pricePerUnitDollars;
  }

  getTariffDuty() {
    return this.getGrossValue() * (this.tariffRatePct / 100.0);
  }
}

export class TradeSystemFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.tradeOrdersList = [];
  }

  getTradeSummary() {
    return {
      activeTradeOrdersCount: this.tradeOrdersList.length,
    };
  }
}

export default TradeSystemFull;
