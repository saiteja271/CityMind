import Scenario from '../models/Scenario.js';
import City from '../models/City.js';
import User from '../models/User.js';

/**
 * GET /api/v1/scenarios
 * List all scenario challenges available
 */
export const listScenarios = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({ isActive: true }).sort({ difficulty: 1 });

    res.status(200).json({
      success: true,
      scenarios
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/scenarios/:id
 * Retrieve details for a single scenario
 */
export const getScenarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scenario = await Scenario.findById(id);

    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario challenge not found.' });
    }

    res.status(200).json({
      success: true,
      scenario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/scenarios/:id/start
 * Initialize a new city based on scenario parameters
 */
export const startScenarioCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cityName } = req.body;

    const scenario = await Scenario.findById(id);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario challenge not found.' });
    }

    const name = cityName || `Challenge: ${scenario.title}`;
    const width = scenario.initialState.mapSize.width;
    const height = scenario.initialState.mapSize.height;

    // Generate basic grid
    const grid = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid.push({
          x,
          y,
          terrain: 'grass',
          zone: 'none',
          buildingId: null,
          pollution: 0,
          landValue: 50
        });
      }
    }

    const city = new City({
      name,
      owner: req.user.id,
      gameMode: 'scenario',
      scenarioId: scenario._id,
      dimensions: { width, height },
      economy: {
        treasury: scenario.initialState.startingTreasury,
        taxRates: { residential: 0.15, commercial: 0.15, industrial: 0.15 }
      },
      stats: {
        population: scenario.initialState.startingPopulation,
        overallHappiness: 70
      },
      grid
    });

    await city.save();

    res.status(201).json({
      success: true,
      message: `Scenario challenge "${scenario.title}" started.`,
      city: {
        id: city._id,
        name: city.name,
        scenario: scenario.title,
        objectives: scenario.objectives,
        timeLimit: scenario.timeLimit
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listScenarios,
  getScenarioById,
  startScenarioCity
};
