import mongoose from 'mongoose';

/**
 * Scenario Challenge Mongoose Schema
 * Defines structured city simulation challenges with initial state presets,
 * objective criteria, time limits, and reward definitions.
 */
const ScenarioSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert', 'nightmare'],
      default: 'medium',
      index: true
    },
    author: {
      type: String,
      default: 'CITYMIND Design Team'
    },
    initialState: {
      mapSize: {
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 }
      },
      startingTreasury: { type: Number, default: 1000000 },
      startingPopulation: { type: Number, default: 0 },
      terrainSeed: { type: String, default: 'default' },
      presetBuildings: [
        {
          buildingType: String,
          x: Number,
          y: Number,
          level: { type: Number, default: 1 }
        }
      ]
    },
    objectives: [
      {
        id: String,
        title: String,
        description: String,
        metric: {
          type: String,
          enum: ['population', 'treasury', 'happiness', 'pollution', 'unemployment', 'revenue']
        },
        targetValue: Number,
        comparison: { type: String, enum: ['gte', 'lte', 'eq'], default: 'gte' },
        isOptional: { type: Boolean, default: false }
      }
    ],
    timeLimit: {
      maxTicks: { type: Number, default: 30000 }, // 0 = unlimited
      maxMonths: { type: Number, default: 24 }
    },
    rewards: {
      badgeTitle: String,
      experiencePoints: { type: Number, default: 500 },
      unlockedBuilding: { type: String, default: null }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Scenario = mongoose.model('Scenario', ScenarioSchema);

export default Scenario;
