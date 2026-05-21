import { Router } from 'express';
import { allComplaints, allCustomers, allUsers, analyticsReports, changeBossPassword, loginHistory, manageStaff, overview, paymentHistory, setStaffStatus, systemReset, updateComplaint } from '../controllers/boss.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('boss'));
router.get('/overview', overview);
router.get('/complaints', allComplaints);
router.patch('/complaints/:id', updateComplaint);
router.get('/staff', manageStaff);
router.get('/customers', allCustomers);
router.get('/users', allUsers);
router.get('/login-history', loginHistory);
router.get('/payments', paymentHistory);
router.get('/analytics-reports', analyticsReports);
router.patch('/staff/:id/status', setStaffStatus);
router.patch('/password', changeBossPassword);
router.post('/system-reset', systemReset);

export default router;
