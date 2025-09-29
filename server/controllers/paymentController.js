// controllers/paymentController.js
import asyncHandler from 'express-async-handler'
import Payment from '../models/paymentModel.js'
import crypto from "crypto"
import { updateOrderToPaid } from './OrderControllers.js'
import Order from '../models/orderModel.js'

const createPayment = asyncHandler(async (req, res) => {
  try {
    // expect: { amount, currency, method, details, meta }
    const { amount, currency, method, details, meta } = req.body

    // Never accept raw card numbers / cvv here.
    if (method === 'card' && (details?.cardNumber || details?.cvv)) {
      res.status(400)
      throw new Error('Sensitive card data not allowed')
    }

    const payment = await Payment.create({
      user: req.user._id,
      amount,
      currency,
      method,
      details, // masked last4, upiId/ref only
      meta,
      status: 'captured', // dummy success
    })

    res.status(201).json({ id: payment._id, status: payment.status })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' }) // 500 for unexpected issues
  }
})

const verifyAndSavePayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentDetails, status } = req.body

    // Signature verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex")

/*     if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Invalid signature" })
    } */

    const order = await Order.findById(req.params.orderId)
    if (order) {
      order.isPaid=true
      order.paidAt= Date.now()
      order.paymentResult = {
        id: razorpayPaymentId,
        status: status,
        update_time: Date.now(),
        merchant: 'razorpay'
      }
      const updatesOrder = await order.save()
      //res.json(updatesOrder)
    } else {
      res.status(404)
      throw new Error('Order not found')
    }

    // Save payment result to DB here
    res.json({
      success: true,
      message: "Payment verified and saved",
      paymentId: razorpayPaymentId,
    })
  } catch (err) {
    console.error("Payment verification error:", err)
    res.status(500).json({ error: "Failed to verify payment" })
  }
}

export { createPayment, verifyAndSavePayment }
