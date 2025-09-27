// 📦 Import necessary packages and files
import mongoose from 'mongoose'         // Used to connect and interact with MongoDB
import dotenv from 'dotenv'             // Loads environment variables from .env file
import colors from 'colors'             // Adds color styles to console log outputs

// 📄 Import sample data (arrays of objects)
import users from './data/users.js'
import products from './data/products.js'

// 🧱 Import Mongoose models (used to perform DB operations)
import User from './models/userModel.js'
import Product from './models/productModel.js'
import Order from './models/orderModel.js'

// 🔌 Import function that connects to MongoDB
import connectDB from './config/db.js'

// 🧭 Load environment variables from .env file (so process.env.MONGO_URI works)
dotenv.config()

// 🚀 Connect to MongoDB before running any operations
await connectDB()

// 🌱 Function to insert (seed) sample data into the database
const importData = async () => {
  try {
    // 🧹 Step 1: Clear existing data from collections to avoid duplication
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()

    // 👥 Step 2: Insert all users from users.js into the User collection
    const createdUsers = await User.insertMany(users)

    // 🧑‍💼 Step 3: Get the ID of the first created user (assumed to be admin)
    const adminUser = createdUsers[0]?._id

    // 📦 Step 4: Add the adminUser ID as the "user" field in each product object
    const sampleProducts = products.map(p => ({ ...p, user: adminUser }))

    // 🛒 Step 5: Insert all updated product objects into Product collection
    if (sampleProducts.length) {
      await Product.insertMany(sampleProducts)
    }

   // ✅ Step 6: Log success message in green
    console.log('✅ Data Imported!'.green.inverse)

    // 🔚 Step 7: Exit the process successfully (0 = success)
    process.exit(0)
  } catch (error) {
    // ❌ If any error occurs, log it in red and exit with failure code
    console.error(`❌ ${error}`.red.inverse)
    process.exit(1)
  }
}

// 💣 Function to delete all data from database collections
const destroyData = async () => {
  try {
    // 🔥 Delete everything from these 3 collections
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()

    // 🧹 Log confirmation
    console.log('Data Destroy!'.red.inverse)

    // Exit successfully
    process.exit(0)

  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}


// ⚙️ Decide what to run based on command line argument
// Example: "node seeder.js" → import data
// Example: "node seeder.js -d" → destroy data
if (process.argv[2] === '-d') {
  await destroyData() // If "-d" passed, delete data

} else {
  await importData()  // Otherwise, import data
}
