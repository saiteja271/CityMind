/**
 * TaxationEngine.js - Multi-tiered progressive tax collection and enforcement engine.
 * Controls 6 tax channels: Residential Income, Commercial Revenue, Industrial Production,
 * Carbon Emissions, Property/Land Value, and Wealth/Capital Tax.
 * Implements tax evasion dynamics, underground shadow economy modeling, and audit enforcement.
 */

import { clamp } from '@citymind/utilities';

export const TAX_CHANNEL = {
  RESIDENTIAL_INCOME: 'RESIDENTIAL_INCOME',
  COMMERCIAL_REVENUE: 'COMMERCIAL_REVENUE',
  INDUSTRIAL_OUTPUT: 'INDUSTRIAL_OUTPUT',
  CARBON_EMISSION: 'CARBON_EMISSION',
  PROPERTY_LAND: 'PROPERTY_LAND',
  WEALTH_CAPITAL: 'WEALTH_CAPITAL'
};

export const RESIDENTIAL_TAX_BRACKETS = [
  { min: 0, max: 15000, rate: 0.05 },
  { min: 15000, max: 40000, rate: 0.12 },
  { min: 40000, max: 80000, rate: 0.20 },
  { min: 80000, max: 150000, rate: 0.28 },
  { min: 150000, max: Infinity, rate: 0.35 }
];

export class TaxationEngine {
  /**
   * @param {Object} [ratesOverride] - Base tax rates for channels
   */
  constructor(ratesOverride = {}) {
    // Channel Tax Rates (0.0 to 0.50)
    this.rates = {
      [TAX_CHANNEL.RESIDENTIAL_INCOME]: ratesOverride.residential ?? 0.15,
      [TAX_CHANNEL.COMMERCIAL_REVENUE]: ratesOverride.commercial ?? 0.12,
      [TAX_CHANNEL.INDUSTRIAL_OUTPUT]: ratesOverride.industrial ?? 0.10,
      [TAX_CHANNEL.CARBON_EMISSION]: ratesOverride.carbon ?? 0.08,
      [TAX_CHANNEL.PROPERTY_LAND]: ratesOverride.property ?? 0.03,
      [TAX_CHANNEL.WEALTH_CAPITAL]: ratesOverride.wealth ?? 0.02
    };

    // Compliance & Enforcement Audit Settings
    this.auditRate = 0.05; // 5% audit probability per cycle
    this.penaltyMultiplier = 1.8; // 180% back-tax penalty for evasion
    this.corruptionIndex = 0.05; // 5% leakage due to tax corruption

    // Historical Tax Collection Ledger
    this.collectionLedger = {
      residential: 0,
      commercial: 0,
      industrial: 0,
      carbon: 0,
      property: 0,
      wealth: 0,
      totalCollected: 0,
      totalEvaded: 0,
      penaltiesCollected: 0
    };
  }

  /**
   * Set tax rate for a specific tax channel.
   *
   * @param {string} channel - TAX_CHANNEL key
   * @param {number} rate - Decimal percentage (0.00 to 0.60)
   */
  setTaxRate(channel, rate) {
    if (this.rates[channel] !== undefined) {
      this.rates[channel] = clamp(rate, 0.0, 0.60);
    }
  }

  /**
   * Primary Tax Collection Tick.
   * Computes tax liability across citizens and businesses, applies evasion logic, and conducts audits.
   *
   * @param {Array<Object>} citizens - Array of citizen instances
   * @param {Array<Object>} businesses - Array of commercial/industrial business entities
   * @param {Object} cityMetrics - Environmental & police enforcement metadata
   * @returns {Object} Tax collection summary payload
   */
  collectTaxes(citizens = [], businesses = [], cityMetrics = {}) {
    const periodLedger = {
      residential: 0,
      commercial: 0,
      industrial: 0,
      carbon: 0,
      property: 0,
      wealth: 0,
      totalCollected: 0,
      totalEvaded: 0,
      penaltiesCollected: 0
    };

    const policeEnforcement = cityMetrics.policePresence || 50;

    // 1. Process Citizen Taxes (Residential Income & Wealth)
    citizens.forEach((citizen) => {
      if (!citizen.alive) return;

      // Progressive Residential Income Tax Calculation
      const incomeTaxLiability = this._calculateProgressiveIncomeTax(citizen.income || 0);

      // Wealth Tax Calculation
      const wealthTaxLiability = (citizen.wealth || 0) > 100000
        ? (citizen.wealth - 100000) * this.rates[TAX_CHANNEL.WEALTH_CAPITAL]
        : 0;

      const totalLiability = incomeTaxLiability + wealthTaxLiability;
      if (totalLiability <= 0) return;

      // Evaluate Evasion Propensity for Citizen
      const evasionChance = this._calculateCitizenEvasionPropensity(citizen, policeEnforcement);

      if (Math.random() < evasionChance) {
        // Tax Evaded
        const evadedAmount = totalLiability * randomRange(0.4, 0.9);
        const paidAmount = totalLiability - evadedAmount;

        citizen.wealth = Math.max(0, citizen.wealth - paidAmount);
        periodLedger.residential += paidAmount;
        periodLedger.totalEvaded += evadedAmount;

        // Perform Audit Check
        if (Math.random() < this.auditRate) {
          const penalty = evadedAmount * this.penaltyMultiplier;
          citizen.wealth = Math.max(0, citizen.wealth - penalty);
          periodLedger.penaltiesCollected += penalty;
          if (citizen.psychology) {
            citizen.psychology.addMemory('TAX_AUDIT', 'Fined for tax evasion audit', -40, Date.now());
          }
        }
      } else {
        // Fully Compliant Payment
        citizen.wealth = Math.max(0, citizen.wealth - totalLiability);
        periodLedger.residential += incomeTaxLiability;
        periodLedger.wealth += wealthTaxLiability;
      }
    });

    // 2. Process Business Taxes (Commercial Revenue, Industrial Output, Carbon & Property)
    businesses.forEach((business) => {
      const revenue = business.revenue || 0;
      const emissions = business.carbonOutput || 0;
      const landValue = business.propertyValue || 50000;

      let taxLiability = 0;

      if (business.category === 'commercial') {
        taxLiability += revenue * this.rates[TAX_CHANNEL.COMMERCIAL_REVENUE];
        periodLedger.commercial += taxLiability;
      } else if (business.category === 'industrial') {
        const prodTax = revenue * this.rates[TAX_CHANNEL.INDUSTRIAL_OUTPUT];
        const carbonTax = emissions * 50 * this.rates[TAX_CHANNEL.CARBON_EMISSION];
        taxLiability += prodTax + carbonTax;
        periodLedger.industrial += prodTax;
        periodLedger.carbon += carbonTax;
      }

      const propTax = landValue * this.rates[TAX_CHANNEL.PROPERTY_LAND];
      taxLiability += propTax;
      periodLedger.property += propTax;

      // Deduct tax from business treasury
      business.treasury = (business.treasury || 10000) - taxLiability;
    });

    // 3. Apply Corruption Revenue Leakage
    const grossCollected =
      periodLedger.residential +
      periodLedger.commercial +
      periodLedger.industrial +
      periodLedger.carbon +
      periodLedger.property +
      periodLedger.wealth +
      periodLedger.penaltiesCollected;

    const netCollected = grossCollected * (1 - this.corruptionIndex);
    periodLedger.totalCollected = netCollected;

    // Accumulate into main engine ledger
    this.collectionLedger.residential += periodLedger.residential;
    this.collectionLedger.commercial += periodLedger.commercial;
    this.collectionLedger.industrial += periodLedger.industrial;
    this.collectionLedger.carbon += periodLedger.carbon;
    this.collectionLedger.property += periodLedger.property;
    this.collectionLedger.wealth += periodLedger.wealth;
    this.collectionLedger.totalCollected += periodLedger.totalCollected;
    this.collectionLedger.totalEvaded += periodLedger.totalEvaded;
    this.collectionLedger.penaltiesCollected += periodLedger.penaltiesCollected;

    return periodLedger;
  }

  /**
   * Calculate progressive income tax based on tiered brackets.
   *
   * @param {number} annualIncome
   * @returns {number} Tax liability
   */
  _calculateProgressiveIncomeTax(annualIncome) {
    let tax = 0;
    const baseRateMultiplier = this.rates[TAX_CHANNEL.RESIDENTIAL_INCOME] / 0.15; // Scale brackets by base rate

    for (const bracket of RESIDENTIAL_TAX_BRACKETS) {
      if (annualIncome > bracket.min) {
        const taxableChunk = Math.min(annualIncome, bracket.max) - bracket.min;
        tax += taxableChunk * (bracket.rate * baseRateMultiplier);
      }
    }

    return Math.max(0, tax);
  }

  /**
   * Calculate tax evasion probability based on citizen personality and police deterrence.
   */
  _calculateCitizenEvasionPropensity(citizen, policeEnforcement) {
    const psych = citizen.psychology;
    const agreeableness = psych?.traits.agreeableness ?? 50;
    const conscientiousness = psych?.traits.conscientiousness ?? 50;

    const effectiveTaxRate = this.rates[TAX_CHANNEL.RESIDENTIAL_INCOME];

    // High tax rates increase desire to evade; High Conscientiousness & Police deterrence suppress evasion
    const baseDesire = (effectiveTaxRate - 0.10) * 1.5;
    const moralDeterrence = (agreeableness * 0.4 + conscientiousness * 0.6) / 100;
    const policeDeterrence = (policeEnforcement / 100) * 0.5;

    const evasionChance = baseDesire - moralDeterrence * 0.3 - policeDeterrence;
    return clamp(evasionChance, 0.01, 0.60);
  }

  /**
   * Summary overview of tax rates and collection stats.
   */
  getTaxSummary() {
    return {
      rates: { ...this.rates },
      auditRate: `${(this.auditRate * 100).toFixed(1)}%`,
      collectionLedger: { ...this.collectionLedger }
    };
  }
}
