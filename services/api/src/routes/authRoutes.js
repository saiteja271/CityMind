import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public auth endpoints
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refreshToken);

// Protected user profile endpoints
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;
