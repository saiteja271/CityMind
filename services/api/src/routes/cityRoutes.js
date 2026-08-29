import { Router } from 'express';
import {
  createCity,
  getCityById,
  listCities,
  updateCityState,
  deleteCity
} from '../controllers/cityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// All city endpoints require authentication
router.use(authenticateToken);

router.post('/', createCity);
router.get('/', listCities);
router.get('/:id', getCityById);
router.patch('/:id', updateCityState);
router.delete('/:id', deleteCity);

export default router;
