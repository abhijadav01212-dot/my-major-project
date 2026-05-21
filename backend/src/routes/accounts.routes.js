import { Router } from 'express';
import { accountPayments, accountsSummary, approvePayment, createSmartBill } from '../controllers/accounts.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('accounts'));
router.get('/summary', accountsSummary);
router.get('/payments', accountPayments);
router.post('/bills', upload.single('screenshot'), createSmartBill);
router.patch('/payments/:id/approve', approvePayment);

export default router;
