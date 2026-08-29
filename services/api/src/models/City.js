import mongoose from 'mongoose';

/**
 * Tile Schema within City grid
 */
const TileSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    terrain: {
      type: String,
      enum: ['grass', 'dirt', 'sand', 'water', 'rock', 'forest', 'swamp'],
      default: 'grass'
    },
    zone: {
      type: String,
      enum: ['none', 'residential', 'commercial', 'industrial', 'public', 'park', 'infrastructure'],
      default: 'none'
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      default: null
    },
    buildingType: {
      type: String,
      default: null
    },
    elevation: {
      type: Number,
      default: 0
    },
    pollution: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    landValue: {
      type: Number,
      default: 50,
      min: 0,
      max: 1000
    },
    crimeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    fireHazard: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    hasPower: {
      type: Boolean,
      default: false
    },
    hasWater: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

/**
 * Historical Metric Snapshot Schema embedded inside City
 */
const MetricSnapshotSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    tick: { type: Number, required: true },
    population: { type: Number, required: true },
    treasury: { type: Number, required: true },
    happiness: { type: Number, required: true },
    pollution: { type: Number, required: true },
    unemploymentRate: { type: Number, required: true },
    rciDemand: {
      residential: Number,
      commercial: Number,
      industrial: Number
    }
  },
  { _id: false }
);

/**
 * City Mongoose Schema
 * Represents the complete simulation state, tiles layout, budget, policies,
 * metrics history, and environment settings.
 */
const CitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      minlength: [2, 'City name must be at least 2 characters'],
      maxlength: [50, 'City name cannot exceed 50 characters'],
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    description: {
      type: String,
      maxlength: 500,
      default: ''
    },
    gameMode: {
      type: String,
      enum: ['sandbox', 'scenario', 'challenge'],
      default: 'sandbox'
    },
    scenarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario',
      default: null
    },
    dimensions: {
      width: { type: Number, default: 100, min: 32, max: 256 },
      height: { type: Number, default: 100, min: 32, max: 256 }
    },
    timeState: {
      tick: { type: Number, default: 0 },
      hour: { type: Number, default: 8 },
      day: { type: Number, default: 1 },
      month: { type: Number, default: 1 },
      year: { type: Number, default: 2026 },
      speed: { type: Number, default: 1, enum: [0, 1, 2, 4, 8] },
      isPaused: { type: Boolean, default: false }
    },
    economy: {
      treasury: { type: Number, default: 5000000 },
      monthlyIncome: { type: Number, default: 0 },
      monthlyExpenses: { type: Number, default: 0 },
      netCashflow: { type: Number, default: 0 },
      taxRates: {
        residential: { type: Number, default: 0.15, min: 0.01, max: 0.5 },
        commercial: { type: Number, default: 0.15, min: 0.01, max: 0.5 },
        industrial: { type: Number, default: 0.15, min: 0.01, max: 0.5 }
      },
      budgetAllocations: {
        healthcare: { type: Number, default: 1.0 },
        education: { type: Number, default: 1.0 },
        safety: { type: Number, default: 1.0 },
        infrastructure: { type: Number, default: 1.0 },
        environment: { type: Number, default: 1.0 }
      }
    },
    stats: {
      population: { type: Number, default: 0 },
      employedCount: { type: Number, default: 0 },
      unemployedCount: { type: Number, default: 0 },
      studentCount: { type: Number, default: 0 },
      retiredCount: { type: Number, default: 0 },
      overallHappiness: { type: Number, default: 75, min: 0, max: 100 },
      healthRating: { type: Number, default: 80, min: 0, max: 100 },
      educationRating: { type: Number, default: 70, min: 0, max: 100 },
      safetyRating: { type: Number, default: 85, min: 0, max: 100 },
      housingCapacity: { type: Number, default: 0 },
      jobCapacity: { type: Number, default: 0 }
    },
    rciDemand: {
      residential: { type: Number, default: 50, min: -100, max: 100 },
      commercial: { type: Number, default: 30, min: -100, max: 100 },
      industrial: { type: Number, default: 40, min: -100, max: 100 }
    },
    environment: {
      airQuality: { type: Number, default: 90, min: 0, max: 100 },
      avgPollution: { type: Number, default: 5, min: 0, max: 100 },
      weather: {
        type: String,
        enum: ['clear', 'cloudy', 'rain', 'storm', 'snow', 'fog'],
        default: 'clear'
      },
      temperatureCelsius: { type: Number, default: 22 }
    },
    activePolicies: [
      {
        id: String,
        name: String,
        category: String,
        costPerMonth: Number,
        enabledAt: { type: Date, default: Date.now }
      }
    ],
    // High performance grid data structure
    grid: [TileSchema],
    // Compact raw binary/json buffer representation if compressed grid is used
    compressedGridData: {
      type: String,
      default: null
    },
    historyMetrics: {
      type: [MetricSnapshotSchema],
      default: []
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    lastSavedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Indexes for query speed
CitySchema.index({ owner: 1, createdAt: -1 });
CitySchema.index({ isPublic: 1, 'stats.population': -1 });
CitySchema.index({ gameMode: 1 });

/**
 * Virtual: Calculate unemployment percentage rate
 */
CitySchema.virtual('unemploymentRate').get(function () {
  const laborForce = this.stats.employedCount + this.stats.unemployedCount;
  if (laborForce === 0) return 0;
  return Number(((this.stats.unemployedCount / laborForce) * 100).toFixed(1));
});

/**
 * Method: Append time-series historical snapshot
 */
CitySchema.methods.recordHistorySnapshot = function () {
  const snapshot = {
    timestamp: new Date(),
    tick: this.timeState.tick,
    population: this.stats.population,
    treasury: this.economy.treasury,
    happiness: this.stats.overallHappiness,
    pollution: this.environment.avgPollution,
    unemploymentRate: this.unemploymentRate,
    rciDemand: {
      residential: this.rciDemand.residential,
      commercial: this.rciDemand.commercial,
      industrial: this.rciDemand.industrial
    }
  };

  this.historyMetrics.push(snapshot);
  
  // Cap historical data array to 1000 data points to manage document size
  if (this.historyMetrics.length > 1000) {
    this.historyMetrics.shift();
  }
};

const City = mongoose.model('City', CitySchema);

export default City;
