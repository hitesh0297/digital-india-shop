// 📦 Importing all required modules
import path from 'path';                  // Helps work with file and directory paths (used for static file serving)
import express from 'express';            // Web framework for Node.js to handle routes and API requests
import dotenv from 'dotenv';              // Loads environment variables from a .env file into process.env
import colors from 'colors';              // Adds color styling to console logs
import morgan from 'morgan';              // HTTP request logger middleware (used for debugging)
import cors from 'cors';                  // Enables Cross-Origin Resource Sharing (to allow frontend to access backend)

// 🧩 Importing local files
import connectDB from './config/db.js';                   // Function that connects to MongoDB
import productsRoutes from './routes/productRoutes.js';   // Routes handling product-related APIs
import userRoutes from './src/routes/userRoutes.js';          // Routes handling user-related APIs
import orderRoutes from './routes/OrderRoutes.js';        // Routes handling order-related APIs
import uploadRoutes from './routes/uploadRoutes.js';      // Routes handling file uploads
import authRoutes from './src/routes/auth.js';      // Routes handling file uploads
import { notFound, errorHandler } from './middlewear/errorMiddlewear.js';  // Custom error middlewares
import { config } from './src/config/env.js';             // Custom config file for environment variables (optional)

// 🧭 Load environment variables from .env file
dotenv.config();

// 🔌 Connect to MongoDB database
connectDB();

// 🚀 Create an Express application
const app = express();

// 🧠 Use morgan logger only in development mode for better debugging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));   // Logs HTTP method, URL, response time, etc.
}

// 📦 Middleware to parse incoming JSON requests (req.body)
app.use(express.json());

// 🔓 Enable CORS (Cross-Origin Resource Sharing) to allow frontend requests
app.use(cors({ 
  origin: config.corsOrigin,    // Allowed frontend origin(s)
  credentials: true             // Allow sending cookies or authorization headers
}));

// Authentication routes
app.use('/api/auth', authRoutes);

// 🛍️ All product-related APIs (e.g., GET /api/products)
app.use('/api/products', productsRoutes);

// 👤 All user-related APIs (e.g., POST /api/users/login)
app.use('/api/users', userRoutes);

// 📦 All order-related APIs (e.g., POST /api/orders)
app.use('/api/orders', orderRoutes);

// 📤 Upload-related APIs (e.g., image uploads)
app.use('/api/upload', uploadRoutes);


// 💳 Endpoint to send PayPal client ID to frontend
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID || '')
);


// 🗂️ Get current directory name
const __dirname = path.resolve();

// 📤 Make "uploads" folder publicly accessible
app.use('/uploads', express.static(path.join(__dirname, '/server/uploads')));

if (process.env.NODE_ENV === 'production') {
  // Serve built frontend files (React build)
  app.use(express.static(path.join(__dirname, '/client/dist')));

  // For any other route, return index.html (for React Router)
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  );
} else {
  // For development mode, just return a simple message
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}


// 🧱 If route not found → trigger custom "notFound" middleware
app.use(notFound);

// 💥 Handle any server errors with a proper JSON response
app.use(errorHandler);

// Define port (use PORT from .env or default 4000)
const PORT = process.env.PORT || 4000;

// Start server and log the environment + port
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
});
