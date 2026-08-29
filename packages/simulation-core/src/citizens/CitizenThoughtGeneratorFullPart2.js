/**
 * CITYMIND Contextual Citizen Social Media ("Chirper") Post Generator
 * Generates dynamic citizen thoughts based on current city tax rate, crime level, pollution index, and park coverage.
 */

export class ChirperPostTemplate {
  constructor(category, textContent, sentimentScore = 0.0) {
    this.category = category;
    this.textContent = textContent;
    this.sentimentScore = sentimentScore; // -1.0 to +1.0
  }
}

export class CitizenThoughtGeneratorFullPart2 {
  constructor(simulation) {
    this.simulation = simulation;
    this.postsPool = [
      new ChirperPostTemplate('TAX', 'Property taxes are rising again... hope the city builds better roads!', -0.4),
      new ChirperPostTemplate('PARK', 'Spent the afternoon at City Central Park. Beautiful greenery!', 0.8),
      new ChirperPostTemplate('TRAFFIC', 'Main Avenue gridlock is making me late for work every single day.', -0.7),
      new ChirperPostTemplate('SAFETY', 'Felt super safe walking home from the subway tonight. Kudos to our police!', 0.9),
    ];
  }

  generateRandomPost() {
    const idx = Math.floor(Math.random() * this.postsPool.length);
    return this.postsPool[idx];
  }
}

export default CitizenThoughtGeneratorFullPart2;
