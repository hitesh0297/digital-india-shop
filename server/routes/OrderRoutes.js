import { Router } from 'express';
import { protect } from '../middlewear/authMiddlewear.js';
import { addOrderItems, getMyOrders, getOrderById, getOrders } from '../controllers/OrderControllers.js'

const router = Router();

// Stub endpoints to keep integration working
router.get('/myorders', getMyOrders);

// Create order
router.post('/', addOrderItems);

router.get('/', getOrders);

router.get('/:orderId', getOrderById);


export default router;
