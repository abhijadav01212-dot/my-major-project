import { Router } from 'express';
import { createPayment, myPayments } from '../controllers/payment.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.get('/mine', requireAuth, requireRole('customer'), myPayments);
router.post('/', requireAuth, requireRole('customer'), upload.single('screenshot'), createPayment);

export default router;
