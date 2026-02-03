import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import transactionsController from '../controllers/transactions.controller.js';

const router = express.Router();

router.post('/', authMiddleware, transactionsController.createTransaction);
router.get('/', authMiddleware, transactionsController.listTransactions);
router.delete('/:id', authMiddleware, transactionsController.deleteTransaction);

export default router;
