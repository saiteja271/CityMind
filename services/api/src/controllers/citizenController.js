import Citizen from '../models/Citizen.js';
import City from '../models/City.js';

/**
 * GET /api/v1/citizens
 * Query citizen agents list with filtering and pagination
 */
export const getCitizens = async (req, res, next) => {
  try {
    const {
      cityId,
      occupation,
      minAge,
      maxAge,
      activity,
      minHappiness,
      page = 1,
      limit = 20,
      sortBy = 'createdAt'
    } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId query parameter is required.' });
    }

    const filter = { cityId, isAlive: true };

    if (occupation) filter.occupation = occupation;
    if (activity) filter.currentActivity = activity;
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge, 10);
      if (maxAge) filter.age.$lte = parseInt(maxAge, 10);
    }
    if (minHappiness) {
      filter['needs.happiness'] = { $gte: parseInt(minHappiness, 10) };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOption = {};
    sortOption[sortBy] = -1;

    const [citizens, total] = await Promise.all([
      Citizen.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Citizen.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      citizens,
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
 * GET /api/v1/citizens/:id
 * Retrieve detailed citizen profile including OCEAN traits, memories, job, home
 */
export const getCitizenDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const citizen = await Citizen.findById(id)
      .populate('home.buildingId', 'name category location')
      .populate('work.buildingId', 'name category location');

    if (!citizen) {
      return res.status(404).json({ success: false, error: 'Citizen not found.' });
    }

    res.status(200).json({
      success: true,
      citizen
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/citizens/:id
 * Force update citizen stats, position, job, or needs
 */
export const forceUpdateCitizen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { needs, occupation, position, currentActivity, addMemory } = req.body;

    const citizen = await Citizen.findById(id);

    if (!citizen) {
      return res.status(404).json({ success: false, error: 'Citizen not found.' });
    }

    if (needs) {
      citizen.needs = { ...citizen.needs, ...needs };
    }
    if (occupation) {
      citizen.occupation = occupation;
    }
    if (position) {
      citizen.position = { ...citizen.position, ...position };
    }
    if (currentActivity) {
      citizen.currentActivity = currentActivity;
    }
    if (addMemory) {
      citizen.addMemory(
        addMemory.event,
        addMemory.category || 'life',
        addMemory.sentiment || 0,
        addMemory.tick || 0,
        addMemory.importance || 5
      );
    }

    await citizen.save();

    res.status(200).json({
      success: true,
      message: 'Citizen updated.',
      citizen
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/citizens/spawn
 * Batch spawn random citizens into a city
 */
export const batchSpawnCitizens = async (req, res, next) => {
  try {
    const { cityId, count = 10 } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, error: 'cityId is required.' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Pat', 'Riley', 'Casey', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const occupations = ['shop_worker', 'office_worker', 'factory_worker', 'teacher', 'unemployed', 'service'];

    const newCitizens = [];
    const spawnCount = Math.min(Math.max(parseInt(count, 10), 1), 100);

    for (let i = 0; i < spawnCount; i++) {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = Math.floor(Math.random() * 50) + 18;
      const occupation = occupations[Math.floor(Math.random() * occupations.length)];

      newCitizens.push({
        cityId,
        name: { first, last },
        age,
        gender: Math.random() > 0.5 ? 'female' : 'male',
        occupation,
        salary: occupation === 'unemployed' ? 0 : Math.floor(Math.random() * 30000) + 20000,
        oceanTraits: {
          openness: Number(Math.random().toFixed(2)),
          conscientiousness: Number(Math.random().toFixed(2)),
          extraversion: Number(Math.random().toFixed(2)),
          agreeableness: Number(Math.random().toFixed(2)),
          neuroticism: Number(Math.random().toFixed(2))
        },
        needs: {
          energy: Math.floor(Math.random() * 30) + 70,
          hunger: Math.floor(Math.random() * 30) + 70,
          social: Math.floor(Math.random() * 40) + 60,
          health: 90,
          happiness: 75
        },
        position: {
          x: Math.floor(Math.random() * city.dimensions.width),
          y: Math.floor(Math.random() * city.dimensions.height)
        }
      });
    }

    const inserted = await Citizen.insertMany(newCitizens);

    // Update City population count
    await City.findByIdAndUpdate(cityId, {
      $inc: { 'stats.population': spawnCount }
    });

    res.status(201).json({
      success: true,
      message: `Successfully spawned ${spawnCount} citizens.`,
      spawnedCount: inserted.length
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCitizens,
  getCitizenDetails,
  forceUpdateCitizen,
  batchSpawnCitizens
};
