import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'citymind-super-secret-jwt-key-change-in-production-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'citymind-refresh-token-secret-key-2026';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generates JWT Access Token & Refresh Token pair
 */
const generateTokens = (user, req) => {
  const payload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id: user._id.toString() }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    userAgent: req ? req.headers['user-agent'] : '',
    ipAddress: req ? req.ip : ''
  };
};

/**
 * POST /api/v1/auth/register
 * Register a new player or admin user account
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username, email, and password.'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists.'
      });
    }

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: role && ['player', 'admin'].includes(role) ? role : 'player'
    });

    const tokenData = generateTokens(newUser, req);
    newUser.refreshTokens.push({
      token: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      userAgent: tokenData.userAgent,
      ipAddress: tokenData.ipAddress
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user: newUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * User login with credentials
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: `Account suspended. Reason: ${user.banReason || 'Violation of terms.'}`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.'
      });
    }

    // Clean up expired refresh tokens
    user.cleanExpiredTokens();

    const tokenData = generateTokens(user, req);
    user.refreshTokens.push({
      token: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      userAgent: tokenData.userAgent,
      ipAddress: tokenData.ipAddress
    });

    await user.recordActivity();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh expired access token using valid refresh token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Refresh token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id);

    if (!user || user.isBanned) {
      return res.status(401).json({ success: false, error: 'User unavailable or banned.' });
    }

    const tokenIndex = user.refreshTokens.findIndex((t) => t.token === token);
    if (tokenIndex === -1) {
      return res.status(401).json({ success: false, error: 'Refresh token not recognized.' });
    }

    // Rotate refresh token
    user.refreshTokens.splice(tokenIndex, 1);

    const tokenData = generateTokens(user, req);
    user.refreshTokens.push({
      token: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt,
      userAgent: tokenData.userAgent,
      ipAddress: tokenData.ipAddress
    });

    await user.save();

    res.status(200).json({
      success: true,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Fetch authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/auth/profile
 * Update user preferences and profile bio
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { bio, avatarUrl, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (bio !== undefined) user.profile.bio = bio;
    if (avatarUrl !== undefined) user.profile.avatarUrl = avatarUrl;
    if (preferences) {
      user.profile.preferences = { ...user.profile.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Revoke active refresh token
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user.id);

    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  logout
};
