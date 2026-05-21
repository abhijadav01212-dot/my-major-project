import { Router } from 'express';
import { predict, recommendations } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/predict-repair', predict);
router.get('/recommendations/:vehicleId', recommendations);

export default router;
