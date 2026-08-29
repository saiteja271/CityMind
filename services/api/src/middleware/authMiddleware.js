import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'citymind-super-secret-jwt-key-change-in-production-2026';

/**
 * Express Middleware: Authenticates HTTP Bearer JWT Token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided in Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.'
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User associated with this token no longer exists.'
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: `Account suspended. Reason: ${user.banReason || 'Violation of terms.'}`
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Express Middleware: Authorizes specific roles (e.g., 'admin', 'moderator')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Requires one of roles: [${roles.join(', ')}]`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

export default {
  authenticateToken,
  requireRole,
  requireAdmin
};
