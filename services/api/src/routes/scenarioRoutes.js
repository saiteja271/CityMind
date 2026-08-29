import { Router } from 'express';
import {
  listScenarios,
  getScenarioById,
  startScenarioCity
} from '../controllers/scenarioController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', listScenarios);
router.get('/:id', getScenarioById);
router.post('/:id/start', startScenarioCity);

export default router;
