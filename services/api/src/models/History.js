import mongoose from 'mongoose';

/**
 * History Time-Series Analytics Mongoose Schema
 * Stores periodic simulation state snapshots for high-resolution analytics charts,
 * financial trends, population demographics, and resource utilization.
 */
const HistorySchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    tick: {
      type: Number,
      required: true
    },
    gameTime: {
      year: Number,
      month: Number,
      day: Number,
      hour: Number
    },
    finance: {
      treasury: { type: Number, required: true },
      income: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      netProfit: { type: Number, default: 0 }
    },
    demographics: {
      totalPopulation: { type: Number, required: true },
      employedCount: { type: Number, default: 0 },
      unemployedCount: { type: Number, default: 0 },
      studentCount: { type: Number, default: 0 },
      retiredCount: { type: Number, default: 0 },
      unemploymentRate: { type: Number, default: 0 }
    },
    satisfaction: {
      overallHappiness: { type: Number, required: true },
      healthRating: { type: Number, default: 80 },
      educationRating: { type: Number, default: 70 },
      safetyRating: { type: Number, default: 85 }
    },
    rciDemand: {
      residential: { type: Number, default: 0 },
      commercial: { type: Number, default: 0 },
      industrial: { type: Number, default: 0 }
    },
    environment: {
      avgPollution: { type: Number, default: 0 },
      airQuality: { type: Number, default: 90 },
      garbageAccumulation: { type: Number, default: 0 }
    },
    utilities: {
      powerDemand: { type: Number, default: 0 },
      powerCapacity: { type: Number, default: 0 },
      waterDemand: { type: Number, default: 0 },
      waterCapacity: { type: Number, default: 0 }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

// Compound index for querying specific time ranges for a given city
HistorySchema.index({ cityId: 1, tick: -1 });
HistorySchema.index({ cityId: 1, timestamp: -1 });

const History = mongoose.model('History', HistorySchema);

export default History;
