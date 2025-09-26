import { Router } from "express";
import { 
    createCategory,
    getCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getProductsByCategory
} from "../controllers/categoryController.ts";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.ts";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/slug/:slug/products", getProductsByCategory);

// Admin routes - require authentication and admin privileges
router.post("/", requireAuth, requireAdmin, createCategory);
router.put("/:id", requireAuth, requireAdmin, updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

export default router;