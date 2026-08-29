import History from '../models/History.js';
import Citizen from '../models/Citizen.js';
import Building from '../models/Building.js';
import City from '../models/City.js';

/**
 * GET /api/v1/analytics/time-series
 * Fetch time-series historical metrics for charts (treasury, population, happiness, pollution)
 */
export const getTimeSeriesAnalytics = async (req, res, next) => {
  try {
    const { cityId, resolution = '100', limit = 200 } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required.' });
    }

    const historyData = await History.find({ cityId })
      .sort({ tick: -1 })
      .limit(parseInt(limit, 10))
      .exec();

    // Reverse to chronological order for charts
    const timeSeries = historyData.reverse().map((item) => ({
      timestamp: item.timestamp,
      tick: item.tick,
      gameTime: item.gameTime,
      treasury: item.finance.treasury,
      income: item.finance.income,
      expenses: item.finance.expenses,
      population: item.demographics.totalPopulation,
      unemploymentRate: item.demographics.unemploymentRate,
      happiness: item.satisfaction.overallHappiness,
      healthRating: item.satisfaction.healthRating,
      educationRating: item.satisfaction.educationRating,
      safetyRating: item.satisfaction.safetyRating,
      pollution: item.environment.avgPollution,
      rciDemand: item.rciDemand
    }));

    res.status(200).json({
      success: true,
      cityId,
      dataPointsCount: timeSeries.length,
      timeSeries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/demographics
 * Demographic statistics breakdown (age distribution, education, job sectors)
 */
export const getDemographicBreakdown = async (req, res, next) => {
  try {
    const { cityId } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required.' });
    }

    const [ageGroups, educationLevels, occupations] = await Promise.all([
      // Age Groups aggregation
      Citizen.aggregate([
        { $match: { cityId: new mongoose.Types.ObjectId(cityId), isAlive: true } },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 18, 35, 55, 65, 100],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),
      // Education levels breakdown
      Citizen.aggregate([
        { $match: { cityId: new mongoose.Types.ObjectId(cityId), isAlive: true } },
        { $group: { _id: '$educationLevel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Occupation sectors breakdown
      Citizen.aggregate([
        { $match: { cityId: new mongoose.Types.ObjectId(cityId), isAlive: true } },
        { $group: { _id: '$occupation', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      cityId,
      demographics: {
        ageGroups,
        educationLevels,
        occupations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/analytics/financial
 * Financial breakdown auditing (income sources vs expense breakdown)
 */
export const getFinancialBreakdown = async (req, res, next) => {
  try {
    const { cityId } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required.' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    // Aggregate maintenance expenses by building category
    const maintenanceByCategory = await Building.aggregate([
      { $match: { cityId: new mongoose.Types.ObjectId(cityId), status: { isOperational: true } } },
      {
        $group: {
          _id: '$category',
          totalMaintenance: { $sum: '$resources.maintenanceCost' },
          totalTax: { $sum: '$resources.taxContribution' },
          buildingCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      cityId,
      treasury: city.economy.treasury,
      taxRates: city.economy.taxRates,
      budgetAllocations: city.economy.budgetAllocations,
      breakdown: maintenanceByCategory
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTimeSeriesAnalytics,
  getDemographicBreakdown,
  getFinancialBreakdown
};
