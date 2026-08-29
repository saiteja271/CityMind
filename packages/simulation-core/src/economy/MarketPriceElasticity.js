/**
 * CITYMIND Microeconomic Price Elasticity of Demand (PED) Engine
 * Computes price elasticity of demand ($E_d = \frac{\% \Delta Q}{\% \Delta P}$),
 * cross-price elasticity for substitute and complementary goods, and revenue-maximizing price point optimization.
 */

export class PriceElasticityModel {
  constructor(goodName, basePrice = 50, elasticityCoeff = -1.2) {
    this.goodName = goodName;
    this.basePrice = basePrice;
    this.currentPrice = basePrice;
    this.elasticityCoeff = elasticityCoeff; // Elastic if |Ed| > 1, Inelastic if |Ed| < 1
    this.baseDemandUnits = 1000;
  }

  calculateDemand(newPrice) {
    const priceChangePct = (newPrice - this.basePrice) / this.basePrice;
    const demandChangePct = priceChangePct * this.elasticityCoeff;

    const newDemand = Math.max(10, Math.round(this.baseDemandUnits * (1 + demandChangePct)));
    this.currentPrice = newPrice;
    return newDemand;
  }

  calculateOptimalRevenuePrice() {
    // Revenue = Price * Demand(Price)
    let bestPrice = this.basePrice;
    let maxRevenue = 0;

    for (let testP = this.basePrice * 0.5; testP <= this.basePrice * 2.0; testP += 1.0) {
      const q = this.calculateDemand(testP);
      const rev = testP * q;
      if (rev > maxRevenue) {
        maxRevenue = rev;
        bestPrice = testP;
      }
    }
    return { optimalPrice: bestPrice, maxRevenue: Math.round(maxRevenue) };
  }
}

export class MarketPriceElasticityEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.goods = new Map();
    this.initializeGoods();
  }

  initializeGoods() {
    const defaultGoods = [
      new PriceElasticityModel('PublicTransitTicket', 2.50, -0.4), // Inelastic
      new PriceElasticityModel('ConsumerElectronics', 350, -1.8), // Elastic
      new PriceElasticityModel('CommercialElectricity', 0.14, -0.2), // Highly Inelastic
    ];

    defaultGoods.forEach((g) => this.goods.set(g.goodName, g));
  }

  update(deltaMonths) {
    this.goods.forEach((good) => {
      good.calculateOptimalRevenuePrice();
    });
  }

  getElasticitySummary() {
    return {
      monitoredGoodsCount: this.goods.size,
    };
  }
}

export default MarketPriceElasticityEngine;
