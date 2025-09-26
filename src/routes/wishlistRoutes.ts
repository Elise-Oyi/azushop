import { Router } from "express";
import { 
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistStatus
} from "../controllers/wishlistController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// All wishlist routes require authentication
router.get("/:userId", requireAuth, getWishlist);
router.post("/add", requireAuth, addToWishlist);
router.delete("/:userId/item/:productId", requireAuth, removeFromWishlist);
router.delete("/:userId/clear", requireAuth, clearWishlist);
router.get("/:userId/status/:productId", requireAuth, checkWishlistStatus);

export default router;