import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import userRoutes from '../routes/userRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import { responseMiddleware } from '../middleware/responseMiddleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import productRoutes from '../routes/productRoutes.js';
import reviewRouter from '../routes/reviewRoutes.js';
import cartRoutes from '../routes/cartRoutes.js';
import wishlistRoutes from '../routes/wishlistRoutes.js';
import orderRoutes from '../routes/orderRoutes.js'; // Placeholder for order routes

const app = express()
const PORT = 4000

app.use(express.json())
// app.use(rateLimiter); // Temporarily disabled for debugging

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log("📦 Body:", req.body);
  console.log("🏷️ Headers:", req.headers);
  next();
});

app.use(responseMiddleware);

// Homepage route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to AzuShop API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      reviews: '/api/reviews',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders'
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRouter)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes) // Placeholder for wishlist routes
app.use("/api/orders", orderRoutes) // Placeholder for order routes

app.use(errorHandler);

export default app; 