import { Router } from 'express';
import { addInventory, listInventory, removeInventory, updateInventory } from '../controllers/inventory.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.get('/', requireAuth, listInventory);
router.post('/', requireAuth, requireRole('boss'), upload.array('photos', 8), addInventory);
router.patch('/:id', requireAuth, requireRole('boss'), upload.array('photos', 8), updateInventory);
router.delete('/:id', requireAuth, requireRole('boss'), removeInventory);

export default router;
