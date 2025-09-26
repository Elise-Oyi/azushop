import { Router } from "express";
import { 
    addProduct, 
    getProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    getRelatedProducts 
} from "../controllers/productController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


// Admin-only routes
// router.post("/", requireAuth, requireAdmin, addProduct);
// router.put("/:id", requireAuth, requireAdmin, updateProduct);
// router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;