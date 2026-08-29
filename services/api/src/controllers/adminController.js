import User from '../models/User.js';
import City from '../models/City.js';
import Citizen from '../models/Citizen.js';
import Building from '../models/Building.js';
import History from '../models/History.js';
import { getDBStatus } from '../config/db.js';

/**
 * GET /api/v1/admin/metrics
 * Global system diagnostics and resource monitoring
 */
export const getServerMetrics = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const dbStatus = getDBStatus();

    const [userCount, cityCount, citizenCount, activeSessions] = await Promise.all([
      User.countDocuments({}),
      City.countDocuments({}),
      Citizen.countDocuments({ isAlive: true }),
      User.countDocuments({ 'statistics.lastActiveAt': { $gte: new Date(Date.now() - 15 * 60 * 1000) } })
    ]);

    res.status(200).json({
      success: true,
      timestamp: new Date(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          rssMB: Math.round(memory.rss / 1024 / 1024),
          heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
          externalMB: Math.round(memory.external / 1024 / 1024)
        },
        cpuUsageMicroseconds: cpuUsage
      },
      database: dbStatus,
      platformStats: {
        totalUsers: userCount,
        active15MinUsers: activeSessions,
        totalCities: cityCount,
        totalSimulatedCitizens: citizenCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users
 * Manage user accounts (list, filter, inspect)
 */
export const listUsersAdmin = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      users,
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
 * PATCH /api/v1/admin/users/:id/status
 * Ban, unban, or update user permissions
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBanned, banReason, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (isBanned !== undefined) user.isBanned = isBanned;
    if (banReason !== undefined) user.banReason = banReason;
    if (role && ['player', 'admin', 'moderator'].includes(role)) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status for "${user.username}" updated.`,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/cities/:id/trigger-disaster
 * Debug trigger environmental disaster in target city
 */
export const triggerDisasterAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { disasterType = 'tornado', intensity = 5 } = req.body;

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    // Apply disaster effects
    city.stats.overallHappiness = Math.max(0, city.stats.overallHappiness - intensity * 5);
    city.environment.avgPollution = Math.min(100, city.environment.avgPollution + intensity * 4);
    
    await city.save();

    res.status(200).json({
      success: true,
      message: `Disaster "${disasterType}" (intensity ${intensity}) triggered in city "${city.name}".`,
      cityStats: city.stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/cities/:id/inject-funds
 * Administrative debug command: inject treasury cash
 */
export const injectFundsAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount = 1000000 } = req.body;

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found.' });
    }

    city.economy.treasury += parseInt(amount, 10);
    await city.save();

    res.status(200).json({
      success: true,
      message: `Added $${amount.toLocaleString()} to treasury of city "${city.name}".`,
      newTreasury: city.economy.treasury
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getServerMetrics,
  listUsersAdmin,
  updateUserStatus,
  triggerDisasterAdmin,
  injectFundsAdmin
};
