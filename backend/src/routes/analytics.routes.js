import { Router } from 'express';
import { dashboardAnalytics } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/dashboard', requireAuth, dashboardAnalytics);

export default router;
