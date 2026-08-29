import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Mongoose Schema
 * Represents player and admin accounts, authentication credentials, settings,
 * owned cities list, and unlocked achievements tracking.
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['player', 'admin', 'moderator'],
      default: 'player',
      index: true
    },
    profile: {
      avatarUrl: {
        type: String,
        default: ''
      },
      bio: {
        type: String,
        maxlength: [250, 'Bio cannot exceed 250 characters'],
        default: ''
      },
      preferences: {
        theme: {
          type: String,
          enum: ['dark', 'light', 'system'],
          default: 'dark'
        },
        autoSaveIntervalMinutes: {
          type: Number,
          default: 5,
          min: 1,
          max: 60
        },
        soundEnabled: {
          type: Boolean,
          default: true
        },
        notificationsEnabled: {
          type: Boolean,
          default: true
        },
        tutorialCompleted: {
          type: Boolean,
          default: false
        }
      }
    },
    savedCities: [
      {
        cityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'City'
        },
        name: String,
        lastSavedAt: Date,
        population: Number,
        mode: String
      }
    ],
    achievements: [
      {
        achievementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Achievement'
        },
        code: String,
        unlockedAt: {
          type: Date,
          default: Date.now
        },
        progress: {
          type: Number,
          default: 100
        }
      }
    ],
    refreshTokens: [
      {
        token: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        expiresAt: {
          type: Date,
          required: true
        },
        userAgent: String,
        ipAddress: String
      }
    ],
    statistics: {
      totalPlayTimeMinutes: {
        type: Number,
        default: 0
      },
      citiesCreatedCount: {
        type: Number,
        default: 0
      },
      maxPopulationReached: {
        type: Number,
        default: 0
      },
      totalBuildingsConstructed: {
        type: Number,
        default: 0
      },
      lastActiveAt: {
        type: Date,
        default: Date.now
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: {
      type: String,
      default: null
    },
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexing for search and performance
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'savedCities.cityId': 1 });

/**
 * Pre-save hook: Hash user password before saving to MongoDB
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: Compare candidate password against stored hash
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Clean expired refresh tokens from user document
 */UserSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter((item) => item.expiresAt > now);
};

/**
 * Instance Method: Record activity heartbeat
 */
UserSchema.methods.recordActivity = async function (playTimeDeltaMinutes = 0) {
  this.statistics.lastActiveAt = new Date();
  if (playTimeDeltaMinutes > 0) {
    this.statistics.totalPlayTimeMinutes += playTimeDeltaMinutes;
  }
  return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', UserSchema);

export default User;
