import { Achievement, UserAchievement } from '../models/Achievement.js';
import City from '../models/City.js';
import User from '../models/User.js';

/**
 * GET /api/v1/achievements
 * List all standard achievement definitions
 */
export const listAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({}).sort({ points: 1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/achievements/user
 * Get current user's unlocked achievements and progress tracking
 */
export const getUserAchievements = async (req, res, next) => {
  try {
    const userAchievements = await UserAchievement.find({ userId: req.user.id })
      .populate('achievementId')
      .sort({ unlockedAt: -1 });

    res.status(200).json({
      success: true,
      count: userAchievements.length,
      userAchievements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/achievements/check
 * Evaluate city milestones and unlock any newly achieved achievements
 */
export const evaluateCityAchievements = async (req, res, next) => {
  try {
    const { cityId } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required.' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    const achievements = await Achievement.find({});
    const unlockedNow = [];

    for (const achievement of achievements) {
      let isMet = false;
      const { metric, targetValue, comparison } = achievement.criteria;

      let currentValue = 0;
      if (metric === 'population') currentValue = city.stats.population;
      if (metric === 'treasury') currentValue = city.economy.treasury;
      if (metric === 'happiness') currentValue = city.stats.overallHappiness;

      if (comparison === 'gte' && currentValue >= targetValue) isMet = true;
      if (comparison === 'lte' && currentValue <= targetValue) isMet = true;
      if (comparison === 'eq' && currentValue === targetValue) isMet = true;

      if (isMet) {
        const existing = await UserAchievement.findOne({
          userId: req.user.id,
          achievementCode: achievement.code
        });

        if (!existing || !existing.unlocked) {
          await UserAchievement.findOneAndUpdate(
            { userId: req.user.id, achievementCode: achievement.code },
            {
              userId: req.user.id,
              cityId: city._id,
              achievementCode: achievement.code,
              unlocked: true,
              currentProgress: 100,
              unlockedAt: new Date()
            },
            { upsert: true, new: true }
          );

          // Update user achievements summary
          await User.findByIdAndUpdate(req.user.id, {
            $push: {
              achievements: {
                achievementId: achievement._id,
                code: achievement.code,
                unlockedAt: new Date(),
                progress: 100
              }
            }
          });

          unlockedNow.push(achievement);
        }
      }
    }

    res.status(200).json({
      success: true,
      newlyUnlockedCount: unlockedNow.length,
      unlockedAchievements: unlockedNow
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listAchievements,
  getUserAchievements,
  evaluateCityAchievements
};
