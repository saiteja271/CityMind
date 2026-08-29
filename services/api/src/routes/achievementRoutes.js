import { Router } from 'express';
import {
  listAchievements,
  getUserAchievements,
  evaluateCityAchievements
} from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', listAchievements);
router.get('/user', getUserAchievements);
router.post('/check', evaluateCityAchievements);

export default router;
