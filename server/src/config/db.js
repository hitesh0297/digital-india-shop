// 📦 Import mongoose (MongoDB ODM library for Node.js)
// It helps to connect to MongoDB and interact using schema & models
import mongoose from 'mongoose';

// ⚙️ Import configuration (your environment variables)
// It likely includes `mongoUri` which comes from `.env` file
import { config } from './env.js';

// 🚀 Export an async function to connect to MongoDB
export async function connectDB() {

  // 🧠 Optional setting (not required but helps avoid warnings)
  // "strictQuery: true" ensures Mongoose enforces schema filters strictly
  // For example, only fields defined in schema are used in queries
  mongoose.set('strictQuery', true);

  // 🔌 Connect to MongoDB using the URI from config
  // `config.mongoUri` = connection string from .env file (like mongodb://127.0.0.1:27017/shopdb)
  // `{ dbName: undefined }` → optional, MongoDB automatically picks db from URI
  await mongoose.connect(config.mongoUri, { dbName: undefined });

  // ✅ Log success once connected
  console.log('✅ MongoDB connected');
}
