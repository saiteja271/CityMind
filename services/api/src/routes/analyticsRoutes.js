import { Router } from 'express';
import {
  getTimeSeriesAnalytics,
  getDemographicBreakdown,
  getFinancialBreakdown
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/time-series', getTimeSeriesAnalytics);
router.get('/demographics', getDemographicBreakdown);
router.get('/financial', getFinancialBreakdown);

export default router;
