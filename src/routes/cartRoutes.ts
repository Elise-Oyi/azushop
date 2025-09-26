import { Router } from "express";
import { 
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// All cart routes require authentication
router.get("/:userId", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/:userId/item/:productId", removeFromCart);
router.delete("/:userId/clear", clearCart);

export default router;