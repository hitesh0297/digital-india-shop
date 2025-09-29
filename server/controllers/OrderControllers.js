import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import mongoose from 'mongoose'
// import { getUserInfoFromAuthHeader } from '../middlewear/authMiddlewear.js'
// @desc Create new order
// @route POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    //paymentMethod: paymentMethod || 'razorPay',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false,
    isDelivered: false
  })
  const createdOrder = await order.save()
  res.status(201).json(createdOrder)
})
// @desc Get Order by id
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate(
    'user',
    'name email'
  )
  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})
// @desc Update to Order paid
// @route GET /api/orders/:id/pay
// @access Private
const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.orderId)
  if (order) {
    order.isPaid=true
    order.paidAt= Date.now()
    order.paymentResult = {
      paymentId: req.body.razorpayPaymentId,
      status: req.body.status,
      update_time: Date.now(),
      merchant: 'razorpay'
    }
    const updatesOrder = await order.save()
    //res.json(updatesOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
}

// @desc Update order to delivered
// @route GET /api/orders/:id/deliver
// @access Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})
// @desc Get logged in user orders
// @route GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    //getUserInfoFromAuthHeader(req)
    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
  } catch (e) {
    console.error('Internal server error: ', e)
    res.status(500).json({ message: 'Server error' }) // 500 for unexpected issues
  }
})

// @desc Get all orders
// @route GET /api/orders
// @access Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name')
  res.json(orders)
})

/**
 * GET /api/orders/seller?pageNumber=1
 * Requires: req.user set by auth middleware.
 * Only role 'seller' (or 'admin' acting as seller via ?sellerId=...) should call this.
 */
const getSellerOrders = async (req, res) => {
  try {
    const pageSize = 10
    const page = Number(req.query.pageNumber) || 1

    // who are we scoping by?
    const isAdmin = req.user?.role === 'admin'
    const sellerIdParam = req.user._id // optional: let admin fetch for a specific seller
    const sellerId = new mongoose.Types.ObjectId(
      (isAdmin && sellerIdParam) ? sellerIdParam : req.user._id
    )

    // only sellers or admins can access this
    if (!isAdmin && req.user?.role !== 'seller') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Aggregate: find orders where ANY orderItems.product belongs to sellerId
    const pipeline = [
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',                 // collection name
          localField: 'orderItems.product', // order item product id
          foreignField: '_id',
          as: 'prod',
        },
      },
      { $unwind: '$prod' },
      { $match: { 'prod.user': sellerId } }, // product.owner == seller
      // group back to distinct orders
      {
        $group: {
          _id: '$_id',
          order: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$order' } },
      // attach lightweight buyer info for UI
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      {
        $addFields: {
          user: {
            $let: {
              vars: { b: { $arrayElemAt: ['$buyer', 0] } },
              in: { _id: '$$b._id', name: '$$b.name', email: '$$b.email' },
            },
          },
        },
      },
      { $project: { buyer: 0 } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          items: [
            { $skip: pageSize * (page - 1) },
            { $limit: pageSize },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]

    const agg = await Order.aggregate(pipeline)
    const items = agg[0]?.items || []
    const total = agg[0]?.total?.[0]?.count || 0

    return res.json({
      products: undefined,               // keep client happy if it expects only orders
      orders: items,                     // your SellerProductListScreen expects array; adjust if needed
      page,
      pages: Math.ceil(total / pageSize) || 1,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}

export {addOrderItems , getOrderById , updateOrderToPaid ,getMyOrders , getOrders, getSellerOrders, updateOrderToDelivered}
