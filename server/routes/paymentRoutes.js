import { createPayment, verifyAndSavePayment } from "../controllers/paymentController.js";
import { Router } from "express";

const router = Router()

// TODO: Depracate
router.post('/create', createPayment);

// Verify and save payment
router.put('/:orderId/pay', verifyAndSavePayment)

export default router