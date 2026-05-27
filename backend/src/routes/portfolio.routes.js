import { Router } from 'express';
import {
  createPortfolioProject,
  deletePortfolioProject,
  listPortfolioProjects,
  replacePortfolioProjects,
  updatePortfolioProject
} from '../controllers/portfolio.controller.js';

const router = Router();

router.get('/projects', listPortfolioProjects);
router.post('/projects', createPortfolioProject);
router.put('/projects/bulk', replacePortfolioProjects);
router.put('/projects/:id', updatePortfolioProject);
router.delete('/projects/:id', deletePortfolioProject);

export default router;
