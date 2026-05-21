import { Router } from 'express';
import { inbox, sendMessage } from '../controllers/message.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', inbox);
router.post('/', sendMessage);

export default router;
