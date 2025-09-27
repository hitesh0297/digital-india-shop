// 📦 Import mongoose to define schemas and models
import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema(
  {
    // 🧍 Name of the reviewer
    name: { type: String, required: true },

    // ⭐ Rating given by the user (e.g. 4 or 5)
    rating: { type: Number, required: true },

    // 💬 Comment provided by the user
    comment: { type: String, required: true },

    // 👤 The user who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,  // Store the user's ID
      required: true,
      ref: 'User',                           // Link to User collection
    },
  },
  {
    // 🕒 Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
)

const productSchema = mongoose.Schema(
  {
    // 👤 The user (admin or seller) who created this product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    // 🏷️ Product name
    name: { type: String, required: true },

    // 🖼️ Image URL or path
    image: { type: String, required: true },

    // 🏢 Brand name
    brand: { type: String, required: true },

    // 📂 Product category
    category: { type: String, required: true },

    // 📄 Description of product
    description: { type: String, required: true },

    // ⭐ Array of reviews (embedded documents)
    reviews: [reviewSchema],

    // 📊 Average rating across reviews
    rating: { type: Number, required: true, default: 0 },

    // 🧾 Number of reviews
    numReviews: { type: Number, required: true, default: 0 },

    // 💰 Price of the product
    price: { type: Number, required: true, default: 0 },

    // 📦 Available stock count
    countInStock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true, // 🕓 createdAt, updatedAt fields
  }
)



// 🧩 Compile schema into a MongoDB model
const Product = mongoose.model('Product', productSchema)

// 🚀 Export model to use in routes/controllers
export default Product

