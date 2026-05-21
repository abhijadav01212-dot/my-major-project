import { Router } from 'express';
import { addVehicle, createComplaint, createRepairJob, markComplete, messageSupport, myComplaints, myJobs, myVehicles, sendFeedback } from '../controllers/customer.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('customer'));
router.post('/vehicles', addVehicle);
router.get('/vehicles', myVehicles);
router.post('/jobs', upload.array('photos', 5), createRepairJob);
router.get('/jobs', myJobs);
router.patch('/jobs/:id/complete', markComplete);
router.post('/complaints', createComplaint);
router.get('/complaints', myComplaints);
router.post('/feedback', sendFeedback);
router.post('/support-message', messageSupport);

export default router;
