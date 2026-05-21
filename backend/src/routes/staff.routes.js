import { Router } from 'express';
import { acceptJob, myStaffJobs, openJobs, updateJob } from '../controllers/staff.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('staff'));
router.get('/jobs/open', openJobs);
router.get('/jobs/mine', myStaffJobs);
router.patch('/jobs/:id/accept', acceptJob);
router.patch('/jobs/:id', upload.array('proofPhotos', 5), updateJob);

export default router;
