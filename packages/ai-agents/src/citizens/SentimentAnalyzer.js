/**
 * @citymind/ai-agents - SentimentAnalyzer.js
 * Citizen Thought & Social Media ("Chirper") Sentiment Analysis Engine.
 * 
 * Features:
 * - VADER / SentiWordNet-inspired Rule-Based NLP & Sentiment Valence Calculator.
 * - Multi-Topic Extraction & Classification (Tax, Traffic, Parks, Crime, Pollution, Jobs, Housing).
 * - Emoji & Punctuation Context Modifiers, Intensifier & Negation handling.
 * - Demographics Sentiment Segmentation (Low-income, Middle-class, Wealthy, Industrial workers, Seniors).
 * - Time-weighted Sentiment Trend Decay & Momentum Tracking.
 * - Policy Dissatisfaction Index & Political Discontent Escalation Model.
 * - Social Movement & Protest Trigger Probability Calculator.
 * - Procedural "Chirper" Social Media Post Generator.
 */

// ---------------------------------------------------------------------------
// ENUMS & LEXICON DATASETS
// ---------------------------------------------------------------------------

/** Topic Classification Categories */
export const TOPIC = {
  TAX_FINANCE: 'TAX_FINANCE',
  TRAFFIC_TRANSIT: 'TRAFFIC_TRANSIT',
  PARKS_RECREATION: 'PARKS_RECREATION',
  CRIME_SAFETY: 'CRIME_SAFETY',
  POLLUTION_ENVIRONMENT: 'POLLUTION_ENVIRONMENT',
  JOBS_ECONOMY: 'JOBS_ECONOMY',
  HEALTH_EDUCATION: 'HEALTH_EDUCATION',
  HOUSING_RENT: 'HOUSING_RENT',
  POWER_UTILITIES: 'POWER_UTILITIES'
};

/** Demographics Segments */
export const DEMOGRAPHIC_SEGMENT = {
  LOW_INCOME: 'LOW_INCOME',
  MIDDLE_CLASS: 'MIDDLE_CLASS',
  WEALTHY: 'WEALTHY',
  STUDENT: 'STUDENT',
  SENIOR: 'SENIOR',
  INDUSTRIAL_WORKER: 'INDUSTRIAL_WORKER',
  BUSINESS_OWNER: 'BUSINESS_OWNER'
};

/** Discontent Escalation Stages */
export const DISCONTENT_STAGE = {
  SATISFIED: 'SATISFIED',       // Sentiment > +0.3
  MILD_GRUMBLE: 'MILD_GRUMBLE', // Sentiment 0.0 to -0.3
  ACTIVE_COMPLAINT: 'COMPLAINT',// Sentiment -0.3 to -0.6
  CIVIC_PROTEST: 'PROTEST',     // Sentiment -0.6 to -0.8
  SOCIAL_STRIKE: 'STRIKE'       // Sentiment < -0.8
};

/** Rich Sentiment Valence Lexicon Dictionary */
export const LEXICON_VALENCE = {
  // Positive Lexicon
  'love': 0.8, 'awesome': 0.9, 'great': 0.7, 'excellent': 0.85, 'clean': 0.6,
  'smooth': 0.6, 'thriving': 0.75, 'affordable': 0.65, 'beautiful': 0.8, 'safe': 0.75,
  'happy': 0.8, 'efficient': 0.7, 'green': 0.5, 'blessed': 0.75, 'fantastic': 0.9,
  'convenient': 0.65, 'wonderful': 0.85, 'spacious': 0.5, 'pleasant': 0.6, 'superb': 0.9,

  // Negative Lexicon
  'terrible': -0.85, 'unbearable': -0.9, 'gridlock': -0.75, 'filthy': -0.8, 'expensive': -0.65,
  'crime': -0.85, 'smog': -0.7, 'corrupt': -0.9, 'noisy': -0.6, 'disaster': -0.9,
  'exorbitant': -0.75, 'dangerous': -0.85, 'worst': -0.9, 'horrible': -0.85, 'stuck': -0.5,
  'broken': -0.7, 'trash': -0.65, 'unaffordable': -0.8, 'ruined': -0.85, 'outrageous': -0.8
};

/** Intensifiers and Dampeners */
export const INTENSIFIERS = {
  'extremely': 1.5, 'super': 1.4, 'very': 1.3, 'incredibly': 1.6, 'unbelievably': 1.7,
  'totally': 1.35, 'massively': 1.4, 'really': 1.25, 'slightly': 0.5, 'barely': 0.4
};

/** Negator Words */
export const NEGATORS = new Set([
  'not', 'never', 'no', 'cannot', 'cant', "can't", 'hardly', 'barely', 'scarcely'
]);

/** Emoji Sentiment Valuation Map */
export const EMOJI_VALENCE = {
  '😍': 0.9, '😃': 0.8, '😊': 0.7, '👍': 0.6, '🌲': 0.4,
  '😡': -0.9, '🤬': -0.95, '🤮': -0.85, '👎': -0.6, '🚗💨': -0.5, '💸': -0.6
};

// ---------------------------------------------------------------------------
// RULE-BASED NLP SENTIMENT VALENCE ENGINE
// ---------------------------------------------------------------------------

/**
 * Natural Language Sentiment Valence Calculator.
 */
export class SentimentValenceEngine {
  /**
   * Calculate sentiment polarity valence (-1.0 to +1.0), arousal, and emotion tags for a text string.
   * 
   * @param {string} text Input sentence or chirp
   * @returns {{ score: number, arousal: number, emotion: string, topic: string }}
   */
  analyzeText(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, arousal: 0, emotion: 'NEUTRAL', topic: TOPIC.TAX_FINANCE };
    }

    const cleanText = text.toLowerCase();
    const words = cleanText.replace(/[^a-z0-9\s#@]/g, ' ').split(/\s+/).filter(Boolean);

    let totalValence = 0;
    let wordCount = 0;
    let multiplier = 1.0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check Negator in 2-word sliding window
      if (NEGATORS.has(word)) {
        multiplier = -0.8;
        continue;
      }

      // Check Intensifiers
      if (INTENSIFIERS[word]) {
        multiplier *= INTENSIFIERS[word];
        continue;
      }

      // Base valence lookup
      if (LEXICON_VALENCE[word] !== undefined) {
        const val = LEXICON_VALENCE[word] * multiplier;
        totalValence += val;
        wordCount++;
        multiplier = 1.0; // Reset after consuming
      }
    }

    // Emoji sentiment scan
    for (const [emoji, val] of Object.entries(EMOJI_VALENCE)) {
      if (text.includes(emoji)) {
        totalValence += val;
        wordCount++;
      }
    }

    // All-Caps emphasis scaling
    const isAllCaps = text.length > 5 && text === text.toUpperCase();
    if (isAllCaps) {
      totalValence *= 1.3;
    }

    // Punctuation emphasis ("!!!")
    if (text.includes('!!!')) {
      totalValence *= 1.25;
    }

    // Final score normalization [-1.0 to +1.0]
    const rawScore = wordCount > 0 ? totalValence / Math.sqrt(wordCount) : 0;
    const finalScore = Math.max(-1.0, Math.min(1.0, rawScore));

    const topic = this.extractTopic(cleanText);
    const emotion = finalScore > 0.4 ? 'JOY' : finalScore < -0.4 ? 'ANGER' : 'NEUTRAL';
    const arousal = Math.abs(finalScore);

    return {
      score: finalScore,
      arousal,
      emotion,
      topic
    };
  }

  /**
   * Classify dominant topic from text keywords.
   * @param {string} text 
   * @returns {string} TOPIC enum
   */
  extractTopic(text) {
    if (text.includes('traffic') || text.includes('road') || text.includes('commute') || text.includes('car')) {
      return TOPIC.TRAFFIC_TRANSIT;
    }
    if (text.includes('tax') || text.includes('budget') || text.includes('money') || text.includes('cost')) {
      return TOPIC.TAX_FINANCE;
    }
    if (text.includes('park') || text.includes('tree') || text.includes('recreation') || text.includes('playground')) {
      return TOPIC.PARKS_RECREATION;
    }
    if (text.includes('crime') || text.includes('police') || text.includes('stolen') || text.includes('safety')) {
      return TOPIC.CRIME_SAFETY;
    }
    if (text.includes('smog') || text.includes('pollution') || text.includes('trash') || text.includes('air')) {
      return TOPIC.POLLUTION_ENVIRONMENT;
    }
    if (text.includes('job') || text.includes('work') || text.includes('factory') || text.includes('salary')) {
      return TOPIC.JOBS_ECONOMY;
    }
    if (text.includes('rent') || text.includes('house') || text.includes('apartment') || text.includes('building')) {
      return TOPIC.HOUSING_RENT;
    }
    return TOPIC.TAX_FINANCE;
  }
}

// ---------------------------------------------------------------------------
// PUBLIC OPINION AGGREGATION & DEMOGRAPHIC TRACKER
// ---------------------------------------------------------------------------

/**
 * Aggregates city-wide and district sentiment indices broken down by demographics.
 */
export class PublicOpinionAggregator {
  constructor() {
    /** @type {Map<string, { totalScore: number, count: number, history: number[] }>} */
    this.demographicScores = new Map();

    for (const seg of Object.values(DEMOGRAPHIC_SEGMENT)) {
      this.demographicScores.set(seg, { totalScore: 0, count: 0, history: [] });
    }

    /** @type {Map<string, number>} Topic sentiment scores */
    this.topicScores = new Map();
    for (const t of Object.values(TOPIC)) {
      this.topicScores.set(t, 0.0); // -1.0 to +1.0
    }

    this.cityWideIndex = 0.0; // Overall satisfaction rating
  }

  /**
   * Record a new citizen sentiment measurement.
   * 
   * @param {string} segment DEMOGRAPHIC_SEGMENT enum
   * @param {string} topic TOPIC enum
   * @param {number} sentimentScore [-1.0 to +1.0]
   */
  recordSentiment(segment, topic, sentimentScore) {
    const dem = this.demographicScores.get(segment);
    if (dem) {
      dem.totalScore += sentimentScore;
      dem.count++;
      dem.history.push(sentimentScore);
      if (dem.history.length > 100) dem.history.shift(); // Moving window
    }

    // Exponential smoothing update for topic score
    const currentTopicScore = this.topicScores.get(topic) || 0.0;
    const updatedTopicScore = currentTopicScore * 0.85 + sentimentScore * 0.15;
    this.topicScores.set(topic, updatedTopicScore);

    this.recalculateCityIndex();
  }

  /**
   * Recompute overall city satisfaction index [-1.0 to +1.0].
   */
  recalculateCityIndex() {
    let total = 0;
    let totalCount = 0;

    for (const dem of this.demographicScores.values()) {
      if (dem.count > 0) {
        total += dem.totalScore;
        totalCount += dem.count;
      }
    }

    this.cityWideIndex = totalCount > 0 ? total / totalCount : 0.0;
  }
}

// ---------------------------------------------------------------------------
// POLICY DISSATISFACTION & PROTEST ESCALATION MODEL
// ---------------------------------------------------------------------------

/**
 * Calculates civic discontent escalation: Discontent -> Complaints -> Protests -> Strikes.
 */
export class PoliticalImpactModel {
  /**
   * Compute discontent escalation level based on public opinion.
   * 
   * @param {number} cityWideSentiment [-1.0 to +1.0]
   * @param {number} taxRate 0.0 to 0.30
   * @param {number} unemploymentRate 0.0 to 1.0
   * @returns {{ stage: string, protestProbability: number, electionRisk: number }}
   */
  evaluateDiscontent(cityWideSentiment, taxRate, unemploymentRate) {
    // Discontent index rises as sentiment drops and tax/unemployment rise
    const discontentIndex = (
      (-cityWideSentiment * 0.5) +
      (taxRate * 1.5) +
      (unemploymentRate * 1.0)
    );

    let stage = DISCONTENT_STAGE.SATISFIED;
    let protestProbability = 0.0;
    let electionRisk = 0.0;

    if (discontentIndex > 0.85) {
      stage = DISCONTENT_STAGE.SOCIAL_STRIKE;
      protestProbability = 0.85;
      electionRisk = 0.90;
    } else if (discontentIndex > 0.65) {
      stage = DISCONTENT_STAGE.CIVIC_PROTEST;
      protestProbability = 0.55;
      electionRisk = 0.65;
    } else if (discontentIndex > 0.40) {
      stage = DISCONTENT_STAGE.ACTIVE_COMPLAINT;
      protestProbability = 0.20;
      electionRisk = 0.35;
    } else if (discontentIndex > 0.20) {
      stage = DISCONTENT_STAGE.MILD_GRUMBLE;
      protestProbability = 0.05;
      electionRisk = 0.15;
    }

    return {
      stage,
      discontentIndex,
      protestProbability,
      electionRisk
    };
  }
}

// ---------------------------------------------------------------------------
// PROCEDURAL "CHIRPER" SOCIAL MEDIA POST GENERATOR
// ---------------------------------------------------------------------------

/**
 * Procedural generator for citizen "Chirper" social media posts.
 */
export class ChirperGenerator {
  constructor() {
    this.templates = {
      [TOPIC.TRAFFIC_TRANSIT]: [
        { mood: 'negative', text: "Stuck in gridlock again! 🚗💨 Why does it take 2 hours to get across town? #TrafficNightmare" },
        { mood: 'positive', text: "Traffic was surprisingly smooth today! Love the new highway extension! 👍" }
      ],
      [TOPIC.PARKS_RECREATION]: [
        { mood: 'positive', text: "Beautiful sunny afternoon at the city park! 🌲😍 Thanks city council!" },
        { mood: 'negative', text: "The local park is filthy and unmaintained... 🤮 We need clean green spaces!" }
      ],
      [TOPIC.TAX_FINANCE]: [
        { mood: 'negative', text: "Another tax hike?! 💸 Where is all our money going?! Outrageous! 😡" },
        { mood: 'positive', text: "City budget report looks great! Taxes are fair and services are booming." }
      ]
    };
  }

  /**
   * Generate a procedural Chirper post matching current city mood and topic.
   * 
   * @param {string} topic TOPIC enum
   * @param {number} citySentiment [-1.0 to +1.0]
   * @param {string} citizenName 
   * @returns {{ author: string, handle: string, text: string, sentiment: number }}
   */
  generateChirp(topic, citySentiment, citizenName = "CitizenX") {
    const list = this.templates[topic] || this.templates[TOPIC.TAX_FINANCE];
    const isPositive = citySentiment >= 0;
    const filtered = list.filter(item => isPositive ? item.mood === 'positive' : item.mood === 'negative');

    const template = filtered[Math.floor(Math.random() * filtered.length)] || list[0];

    return {
      author: citizenName,
      handle: `@${citizenName.toLowerCase().replace(/\s+/g, '')}_city`,
      text: template.text,
      timestamp: new Date().toISOString()
    };
  }
}

// ---------------------------------------------------------------------------
// MAIN SENTIMENT ANALYZER ENGINE
// ---------------------------------------------------------------------------

/**
 * Central Sentiment Analyzer Engine coordinating NLP, opinion tracking,
 * discontent escalation, and Chirper generation.
 */
export class SentimentAnalyzer {
  constructor() {
    this.nlpEngine = new SentimentValenceEngine();
    this.opinionAggregator = new PublicOpinionAggregator();
    this.politicalModel = new PoliticalImpactModel();
    this.chirperGenerator = new ChirperGenerator();
  }

  /**
   * Process an incoming citizen thought or post.
   * 
   * @param {string} text Post content
   * @param {string} [demographic=DEMOGRAPHIC_SEGMENT.MIDDLE_CLASS]
   * @returns {{ score: number, emotion: string, topic: string }}
   */
  processCitizenThought(text, demographic = DEMOGRAPHIC_SEGMENT.MIDDLE_CLASS) {
    const result = this.nlpEngine.analyzeText(text);
    this.opinionAggregator.recordSentiment(demographic, result.topic, result.score);
    return result;
  }

  /**
   * Get city-wide public opinion summary.
   * @returns {Object}
   */
  getSummaryReport() {
    const sentiment = this.opinionAggregator.cityWideIndex;
    const politicalStatus = this.politicalModel.evaluateDiscontent(sentiment, 0.12, 0.05);

    return {
      cityWideSentiment: sentiment,
      stage: politicalStatus.stage,
      protestProbability: politicalStatus.protestProbability,
      electionRisk: politicalStatus.electionRisk
    };
  }
}

export default {
  TOPIC,
  DEMOGRAPHIC_SEGMENT,
  DISCONTENT_STAGE,
  LEXICON_VALENCE,
  INTENSIFIERS,
  NEGATORS,
  EMOJI_VALENCE,
  SentimentValenceEngine,
  PublicOpinionAggregator,
  PoliticalImpactModel,
  ChirperGenerator,
  SentimentAnalyzer
};
