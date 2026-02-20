import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import insightsController from '../controllers/insights.controller.js';

const router = express.Router();

router.get('/', authMiddleware, insightsController.getInsights);

export default router;
