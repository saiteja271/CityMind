import { Router } from 'express';
import authRoutes from './authRoutes.js';
import cityRoutes from './cityRoutes.js';
import citizenRoutes from './citizenRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import achievementRoutes from './achievementRoutes.js';
import scenarioRoutes from './scenarioRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cities', cityRoutes);
router.use('/citizens', citizenRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/achievements', achievementRoutes);
router.use('/scenarios', scenarioRoutes);
router.use('/admin', adminRoutes);

export default router;
