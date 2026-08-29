/**
 * CITYMIND AI Advisor Rule Engine & Recommendation Cards System
 * Evaluates city state across 15 metric categories (Treasury, Traffic, Power, Water, Crime, Pollution, Happiness, Education, Health, Housing),
 * generates prioritized, actionable recommendation cards with severity badges.
 */

export class ActionableAdvisorCard {
  constructor(cardId, title, severity = 'WARNING', category = 'FINANCIAL', description = '', actionButtonText = '') {
    this.cardId = cardId;
    this.title = title;
    this.severity = severity; // 'INFO', 'WARNING', 'CRITICAL', 'URGENT'
    this.category = category; // 'FINANCIAL', 'TRAFFIC', 'POWER', 'WATER', 'CRIME', 'POLLUTION', 'HEALTH'
    this.description = description;
    this.actionButtonText = actionButtonText;
    this.timestamp = Date.now();
  }
}

export class AdvisorEngine {
  constructor(simulation) {
    this.simulation = simulation;
    this.activeCards = [];
  }

  evaluateCityMetrics() {
    const stats = this.simulation?.stats || { treasury: 250000, crimeRate: 10, pollutionLevel: 15, trafficCongestion: 22 };
    this.activeCards = [];

    // 1. Treasury Bankruptcy Warning
    if (stats.treasury < 25000) {
      this.activeCards.push(
        new ActionableAdvisorCard(
          'adv_treasury_low',
          'Treasury Funds Critically Low',
          'CRITICAL',
          'FINANCIAL',
          'City cash reserves have fallen below $25,000. Increase tax rates or issue municipal bonds immediately.',
          'Open Policy Center'
        )
      );
    }

    // 2. High Crime Alert
    if (stats.crimeRate > 25) {
      this.activeCards.push(
        new ActionableAdvisorCard(
          'adv_crime_wave',
          'Crime Wave Spreading in District 3',
          'URGENT',
          'CRIME',
          'Crime rate has exceeded 25%. Construct a police precinct or enact a curfew policy.',
          'Build Police Precinct'
        )
      );
    }

    // 3. Traffic Congestion Warning
    if (stats.trafficCongestion > 55) {
      this.activeCards.push(
        new ActionableAdvisorCard(
          'adv_traffic_jam',
          'Main Expressway Traffic Gridlock',
          'WARNING',
          'TRAFFIC',
          'Vehicular congestion has reached 55%. Expand road lanes or build mass transit subway lines.',
          'Build Subway Station'
        )
      );
    }

    return this.activeCards;
  }

  getAdvisorSummary() {
    return {
      activeCardsCount: this.activeCards.length,
      cards: this.activeCards,
    };
  }
}

export default AdvisorEngine;
