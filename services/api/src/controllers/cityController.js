import City from '../models/City.js';
import Citizen from '../models/Citizen.js';
import Building from '../models/Building.js';
import History from '../models/History.js';
import User from '../models/User.js';

/**
 * Helper: Generate initial procedural tile grid array
 */
const generateDefaultGrid = (width = 100, height = 100) => {
  const tiles = [];
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let terrain = 'grass';
      
      // Simple procedural river cutting through map
      const distanceToRiver = Math.abs(x - (centerX + Math.sin(y / 8) * 12));
      if (distanceToRiver < 2) {
        terrain = 'water';
      } else if (distanceToRiver < 4) {
        terrain = 'sand';
      } else if ((x % 17 === 0 || y % 19 === 0) && x > 10 && y > 10) {
        terrain = 'forest';
      }

      tiles.push({
        x,
        y,
        terrain,
        zone: 'none',
        buildingId: null,
        buildingType: null,
        elevation: terrain === 'water' ? -2 : 0,
        pollution: 0,
        landValue: terrain === 'water' ? 80 : 50,
        hasPower: false,
        hasWater: false
      });
    }
  }
  return tiles;
};

/**
 * POST /api/v1/cities
 * Create a new city simulation session
 */
export const createCity = async (req, res, next) => {
  try {
    const { name, description, gameMode, scenarioId, dimensions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'City name is required.' });
    }

    const width = dimensions?.width || 100;
    const height = dimensions?.height || 100;
    const tiles = generateDefaultGrid(width, height);

    const city = new City({
      name,
      description: description || '',
      owner: req.user.id,
      gameMode: gameMode || 'sandbox',
      scenarioId: scenarioId || null,
      dimensions: { width, height },
      grid: tiles,
      stats: {
        population: 0,
        overallHappiness: 75,
        housingCapacity: 0,
        jobCapacity: 0
      }
    });

    await city.save();

    // Add reference to User's savedCities list
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        savedCities: {
          cityId: city._id,
          name: city.name,
          lastSavedAt: new Date(),
          population: 0,
          mode: city.gameMode
        }
      },
      $inc: { 'statistics.citiesCreatedCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'City created successfully.',
      city: {
        id: city._id,
        name: city.name,
        gameMode: city.gameMode,
        dimensions: city.dimensions,
        economy: city.economy,
        stats: city.stats,
        createdAt: city.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/cities/:id
 * Retrieve city details and full grid state
 */
export const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeGrid } = req.query;

    const query = City.findById(id).populate('owner', 'username email avatarUrl');
    
    if (includeGrid === 'false') {
      query.select('-grid -compressedGridData');
    }

    const city = await query.exec();

    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    res.status(200).json({
      success: true,
      city
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/cities
 * Query list of cities (user's owned cities or public showcase cities)
 */
export const listCities = async (req, res, next) => {
  try {
    const { owned, search, page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    const filter = {};

    if (owned === 'true') {
      filter.owner = req.user.id;
    } else {
      filter.isPublic = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOption = {};
    sortOption[sortBy] = -1;

    const [cities, total] = await Promise.all([
      City.find(filter)
        .select('-grid -compressedGridData -historyMetrics')
        .populate('owner', 'username')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      City.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      cities,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/cities/:id
 * Update city simulation state, budget, tax rates, or policies
 */
export const updateCityState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { economy, timeState, activePolicies, stats, environment, tilesDelta } = req.body;

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    // Verify ownership or collaborator rights
    if (city.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this city.' });
    }

    if (economy) {
      if (economy.treasury !== undefined) city.economy.treasury = economy.treasury;
      if (economy.taxRates) city.economy.taxRates = { ...city.economy.taxRates, ...economy.taxRates };
      if (economy.budgetAllocations) city.economy.budgetAllocations = { ...city.economy.budgetAllocations, ...economy.budgetAllocations };
    }

    if (timeState) {
      city.timeState = { ...city.timeState, ...timeState };
    }

    if (stats) {
      city.stats = { ...city.stats, ...stats };
    }

    if (environment) {
      city.environment = { ...city.environment, ...environment };
    }

    if (activePolicies) {
      city.activePolicies = activePolicies;
    }

    // Process partial grid updates efficiently
    if (Array.isArray(tilesDelta) && tilesDelta.length > 0) {
      const gridMap = new Map();
      city.grid.forEach((tile) => gridMap.set(`${tile.x},${tile.y}`, tile));

      tilesDelta.forEach((delta) => {
        const key = `${delta.x},${delta.y}`;
        const existing = gridMap.get(key);
        if (existing) {
          Object.assign(existing, delta);
        }
      });
    }

    city.lastSavedAt = new Date();
    city.recordHistorySnapshot();

    await city.save();

    res.status(200).json({
      success: true,
      message: 'City state updated.',
      city: {
        id: city._id,
        timeState: city.timeState,
        economy: city.economy,
        stats: city.stats,
        lastSavedAt: city.lastSavedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cities/:id
 * Delete city and clean up related buildings, citizens, and history logs
 */
export const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    if (city.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this city.' });
    }

    // Cascade delete associated entities
    await Promise.all([
      City.findByIdAndDelete(id),
      Citizen.deleteMany({ cityId: id }),
      Building.deleteMany({ cityId: id }),
      History.deleteMany({ cityId: id }),
      User.findByIdAndUpdate(req.user.id, {
        $pull: { savedCities: { cityId: id } }
      })
    ]);

    res.status(200).json({
      success: true,
      message: `City "${city.name}" and all associated data were deleted.`
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createCity,
  getCityById,
  listCities,
  updateCityState,
  deleteCity
};
