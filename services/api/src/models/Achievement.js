import mongoose from 'mongoose';

/**
 * Achievement Definition Schema
 * Standard catalog of unlockable achievements in CITYMIND.
 */
const AchievementSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['population', 'economy', 'infrastructure', 'environment', 'happiness', 'disaster', 'special'],
      default: 'population',
      index: true
    },
    iconUrl: {
      type: String,
      default: 'trophy'
    },
    points: {
      type: Number,
      default: 10
    },
    reward: {
      treasuryBonus: { type: Number, default: 0 },
      specialBuildingUnlock: { type: String, default: null }
    },
    criteria: {
      metric: {
        type: String,
        required: true,
        enum: [
          'population',
          'treasury',
          'happiness',
          'buildings_count',
          'power_production',
          'clean_energy_percentage',
          'playtime_minutes',
          'disasters_survived'
        ]
      },
      targetValue: {
        type: Number,
        required: true
      },
      comparison: {
        type: String,
        enum: ['gte', 'lte', 'eq'],
        default: 'gte'
      }
    },
    isSecret: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * User Achievement Unlock Tracking Schema
 */
const UserAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null
    },
    achievementCode: {
      type: String,
      required: true,
      index: true
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    currentProgress: {
      type: Number,
      default: 0
    },
    targetProgress: {
      type: Number,
      default: 100
    },
    unlockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index so a user tracks progress per achievement
UserAchievementSchema.index({ userId: 1, achievementCode: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', AchievementSchema);
export const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

export default {
  Achievement,
  UserAchievement
};
