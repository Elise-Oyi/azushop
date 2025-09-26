import { Router } from "express";
import { 
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getOrderByOrderId,
    cancelOrder
} from "../controllers/orderController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/track/:orderId", getOrderByOrderId); // Order tracking for customers

// Protected routes - require authentication
router.post("/checkout", requireAuth, createOrder);
router.get("/user/:userId", requireAuth, getUserOrders);
router.get("/:id", requireAuth, getOrderById);
router.put("/:id/cancel", requireAuth, cancelOrder);

// Admin routes - require admin privileges
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

export default router;