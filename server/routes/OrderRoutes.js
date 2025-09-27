import { Router } from 'express';
import { protect } from '../middlewear/authMiddlewear.js';
import { getMyOrders } from '../controllers/OrderControllers.js'

const router = Router();

// Stub endpoints to keep integration working
router.get('/myorders', protect, getMyOrders);
router.post('/', (req, res) => res.status(201).json({ ok: true }));

export default router;
