import { Router } from 'express';
import {
  getServerMetrics,
  listUsersAdmin,
  updateUserStatus,
  triggerDisasterAdmin,
  injectFundsAdmin
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { adminRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Protect all admin endpoints
router.use(authenticateToken);
router.use(requireAdmin);
router.use(adminRateLimiter);

router.get('/metrics', getServerMetrics);
router.get('/users', listUsersAdmin);
router.patch('/users/:id/status', updateUserStatus);
router.post('/cities/:id/trigger-disaster', triggerDisasterAdmin);
router.post('/cities/:id/inject-funds', injectFundsAdmin);

export default router;
