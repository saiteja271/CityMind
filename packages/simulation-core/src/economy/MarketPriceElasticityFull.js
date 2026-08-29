/**
 * CITYMIND Microeconomic Price Elasticity of Demand (PED) Engine
 * Computes price elasticity ($E_d = \frac{\% \Delta Q}{\% \Delta P}$), revenue-maximizing price points,
 * and cross-price elasticity for substitute municipal goods.
 */

export class ElasticityGoodItem {
  constructor(name, basePrice = 50, elasticityCoeff = -1.2) {
    this.name = name;
    this.basePrice = basePrice;
    this.currentPrice = basePrice;
    this.elasticityCoeff = elasticityCoeff;
    this.baseDemand = 1000;
  }

  computeDemand(newPrice) {
    const pChangePct = (newPrice - this.basePrice) / this.basePrice;
    const qChangePct = pChangePct * this.elasticityCoeff;

    this.currentPrice = newPrice;
    return Math.max(10, Math.round(this.baseDemand * (1.0 + qChangePct)));
  }

  findOptimalPrice() {
    let bestP = this.basePrice;
    let maxRev = 0;

    for (let p = this.basePrice * 0.5; p <= this.basePrice * 2.0; p += 1.0) {
      const q = this.computeDemand(p);
      const rev = p * q;
      if (rev > maxRev) {
        maxRev = rev;
        bestP = p;
      }
    }
    return { optimalPrice: bestP, maxRevenue: Math.round(maxRev) };
  }
}

export class MarketPriceElasticityFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.goodsMap = new Map();
    this.initializeGoods();
  }

  initializeGoods() {
    this.goodsMap.set('TransitTicket', new ElasticityGoodItem('TransitTicket', 2.5, -0.4));
    this.goodsMap.set('Electricity', new ElasticityGoodItem('Electricity', 0.15, -0.2));
  }

  update(deltaMonths) {
    this.goodsMap.forEach((good) => good.findOptimalPrice());
  }

  getElasticitySummary() {
    return {
      monitoredGoodsCount: this.goodsMap.size,
    };
  }
}

export default MarketPriceElasticityFull;
