import { Router } from 'express';
import { protect } from '../middlewear/authMiddlewear.js';
import { addOrderItems, getMyOrders, getSellerOrders, getOrderById, getOrders } from '../controllers/OrderControllers.js'

const router = Router();

// Customer's orders
router.get('/myorders', getMyOrders);

// Selller's orders
router.get('/seller', getSellerOrders);

// Create order
router.post('/', addOrderItems);

// Get all orders for admin
router.get('/', getOrders);

// Get order detail
router.get('/:orderId', getOrderById);


export default router;
