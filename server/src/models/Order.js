// 📦 Import mongoose to define schema and model
import mongoose from 'mongoose'

// 🧱 Create a schema (structure) for the "Order" collection
const orderSchema = mongoose.Schema(
  {
    // 👤 The user who placed the order (foreign key reference)
    user: {
      type: mongoose.Schema.Types.ObjectId,  // Store user's unique ID
      required: true,                        // Must always have a user
      ref: 'User',                           // Reference the 'User' collection
    },

    // 🛍️ List of items ordered (array of objects)
    orderItems: [
      {
        name: { type: String, required: true },          // Product name
        qty: { type: Number, required: true },           // Quantity ordered
        image: { type: String, required: true },         // Product image URL
        price: { type: Number, required: true },         // Product price
        product: {                                       // Reference to Product collection
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],

    // 📦 Shipping address for delivery
    shippingAddress: {
      address: { type: String, required: true },       // Street or house number
      city: { type: String, required: true },          // City name
      postalCode: { type: String, required: true },    // Zip code
      country: { type: String, required: true },       // Country
    },

    // 💳 Payment method used (e.g. PayPal, Credit Card)
/*     paymentMethod: {
      type: String,
      required: true,
    }, */

    // 💰 Payment result returned by payment gateway (optional)
    paymentResult: {
      id: { type: String },             // Payment transaction ID
      status: { type: String },         // Payment status (e.g. "Completed")
      update_time: { type: String },    // Last updated time from gateway
      email_address: { type: String },  // Email of payer
      merchant: { type: String }        // Merchant used for payment
    },

    // 💸 Tax applied to order
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // 🚚 Shipping cost
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // 💵 Total order amount (items + tax + shipping)
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // ✅ Whether payment is done
    isPaid: {
      type: Boolean,
      required: true,
      default: false,    // Initially false
    },

    // 🕒 Timestamp of payment
    paidAt: {
      type: Date,
    },

    // 📦 Whether order has been delivered
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    // 🕒 Timestamp of delivery
    deliveredAt: {
      type: Date,
    },
  },

  // 🕓 Automatically adds createdAt and updatedAt timestamps to each document
  {
    timestamps: true,
  }
)


// 🧩 Create a Mongoose model from the schema
// This creates a collection named "orders" in MongoDB
const Order = mongoose.model('Order', orderSchema)

// 🚀 Export the model so it can be used in routes/controllers
export default Order
