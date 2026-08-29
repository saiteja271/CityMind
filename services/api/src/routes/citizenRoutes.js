import { Router } from 'express';
import {
  getCitizens,
  getCitizenDetails,
  forceUpdateCitizen,
  batchSpawnCitizens
} from '../controllers/citizenController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCitizens);
router.get('/:id', getCitizenDetails);
router.patch('/:id', forceUpdateCitizen);
router.post('/spawn', batchSpawnCitizens);

export default router;
