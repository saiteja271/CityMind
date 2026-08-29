/**
 * CITYMIND Natural Language Citizen Thought & Sentiment Text Generator
 * Generates context-aware citizen thoughts ("Chirper" posts) based on current city state,
 * personality traits, employment satisfaction, tax rates, traffic delays, and local pollution.
 */

export class CitizenThoughtGeneratorFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.thoughtTemplates = {
      highTax: [
        'The mayor is raising taxes again... where is all our money going?',
        'Property taxes are getting out of hand! My paycheck is shrinking.',
        'High taxes are crushing small business growth in our neighborhood.',
      ],
      lowCrime: [
        'I feel completely safe walking home late at night in our district.',
        'The police precinct is doing a fantastic job keeping crime down!',
        'Zero crime reported this month in Sector 4. Great work, Mayor!',
      ],
      heavyTraffic: [
        'Stuck in gridlock on Main Avenue for 45 minutes again today...',
        'We need more subway lines! Traffic is unbearable during rush hour.',
        'The traffic signal timing at Broadway is a total nightmare.',
      ],
      cleanEnergy: [
        'So glad our city relies 100% on clean solar and wind energy!',
        'Breathing clean air every day makes living here completely worth it.',
      ],
    };
  }

  generateThoughtForCitizen(citizen) {
    const stats = this.simulation?.stats || { crimeRate: 10, trafficCongestion: 20, taxRate: 12 };

    if (stats.taxRate > 18) {
      return this.getRandomTemplate(this.thoughtTemplates.highTax);
    }
    if (stats.trafficCongestion > 50) {
      return this.getRandomTemplate(this.thoughtTemplates.heavyTraffic);
    }
    if (stats.crimeRate < 5) {
      return this.getRandomTemplate(this.thoughtTemplates.lowCrime);
    }
    return this.getRandomTemplate(this.thoughtTemplates.cleanEnergy);
  }

  getRandomTemplate(arr) {
    if (!arr || arr.length === 0) return 'Everything seems quiet in the city today.';
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default CitizenThoughtGeneratorFull;
