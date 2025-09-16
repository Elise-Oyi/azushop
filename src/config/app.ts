import express from 'express';
import { errorHandler } from '../middleware/errorHandler.ts';
import userRoutes from '../routes/userRoutes.ts';
import authRoutes from '../routes/authRoutes.ts';
import { responseMiddleware } from '../middleware/responseMiddleware.ts';
import { rateLimiter } from '../middleware/rateLimiter.ts';
import productRoutes from '../routes/productRoutes.ts';
import reviewRouter from '../routes/reviewRoutes.ts';

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRouter)

app.use(errorHandler);

export default app;