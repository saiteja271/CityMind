import mongoose from 'mongoose';

/**
 * Memory Event Schema embedded within Citizen
 */
const MemorySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    category: {
      type: String,
      enum: ['job', 'home', 'life', 'disaster', 'social', 'health', 'financial'],
      default: 'life'
    },
    sentiment: { type: Number, min: -1, max: 1, default: 0 },
    importance: { type: Number, min: 1, max: 10, default: 5 },
    timestamp: { type: Date, default: Date.now },
    tick: { type: Number, required: true }
  },
  { _id: false }
);

/**
 * Citizen Mongoose Schema
 * Represents an individual simulated agent with OCEAN personality traits,
 * real-time psychological/biological needs, job, residence, and memory trace.
 */
const CitizenSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true }
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
      index: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary'],
      default: 'female'
    },
    educationLevel: {
      type: Number,
      min: 0,
      max: 6,
      default: 2 // 0: None, 1: Primary, 2: Secondary, 3: Vocational, 4: Bachelor, 5: Master, 6: Doctorate
    },
    occupation: {
      type: String,
      default: 'unemployed',
      index: true
    },
    salary: {
      type: Number,
      default: 0
    },
    savings: {
      type: Number,
      default: 5000
    },
    oceanTraits: {
      openness: { type: Number, min: 0, max: 1, default: 0.5 },
      conscientiousness: { type: Number, min: 0, max: 1, default: 0.5 },
      extraversion: { type: Number, min: 0, max: 1, default: 0.5 },
      agreeableness: { type: Number, min: 0, max: 1, default: 0.5 },
      neuroticism: { type: Number, min: 0, max: 1, default: 0.5 }
    },
    needs: {
      energy: { type: Number, min: 0, max: 100, default: 100 },
      hunger: { type: Number, min: 0, max: 100, default: 100 },
      social: { type: Number, min: 0, max: 100, default: 80 },
      health: { type: Number, min: 0, max: 100, default: 90 },
      happiness: { type: Number, min: 0, max: 100, default: 75 }
    },
    home: {
      buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', default: null },
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    work: {
      buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', default: null },
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      targetX: { type: Number, default: 0 },
      targetY: { type: Number, default: 0 }
    },
    currentActivity: {
      type: String,
      enum: [
        'sleeping',
        'waking',
        'preparing',
        'traveling',
        'working',
        'studying',
        'shopping',
        'socializing',
        'eating',
        'resting',
        'seeking_job',
        'seeking_home',
        'idle',
        'emergency'
      ],
      default: 'idle'
    },
    schedule: [
      {
        hour: { type: Number, min: 0, max: 23 },
        activity: String,
        targetLocationType: String
      }
    ],
    memories: [MemorySchema],
    isAlive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Indexes
CitizenSchema.index({ cityId: 1, isAlive: 1 });
CitizenSchema.index({ cityId: 1, occupation: 1 });
CitizenSchema.index({ cityId: 1, 'needs.happiness': 1 });

/**
 * Virtual: Full name string
 */
CitizenSchema.virtual('fullName').get(function () {
  return `${this.name.first} ${this.name.last}`;
});

/**
 * Method: Add life memory to citizen
 */
CitizenSchema.methods.addMemory = function (event, category = 'life', sentiment = 0, tick = 0, importance = 5) {
  this.memories.push({
    event,
    category,
    sentiment,
    importance,
    tick,
    timestamp: new Date()
  });

  // Limit memory stack to 50 significant memories
  if (this.memories.length > 50) {
    this.memories.shift();
  }
};

/**
 * Method: Apply decay to citizen vital needs
 */
CitizenSchema.methods.decayNeeds = function (decayRate = 1.0) {
  this.needs.energy = Math.max(0, this.needs.energy - 0.15 * decayRate);
  this.needs.hunger = Math.max(0, this.needs.hunger - 0.25 * decayRate);
  this.needs.social = Math.max(0, this.needs.social - 0.08 * decayRate);
  
  // Calculate aggregate happiness based on needs balance
  const avgNeeds = (this.needs.energy + this.needs.hunger + this.needs.social + this.needs.health) / 4;
  this.needs.happiness = Math.round(avgNeeds * (1 - this.oceanTraits.neuroticism * 0.2));
};

const Citizen = mongoose.model('Citizen', CitizenSchema);

export default Citizen;
