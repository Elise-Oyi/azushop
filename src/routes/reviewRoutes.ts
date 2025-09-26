import { Router } from "express";
import { 
    addReview, 
    getReviewsByProductId, 
    getReviewById,
    markReviewHelpful 
} from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import router from "./productRoutes.js";

const reviewRouter = Router();

// Public routes
reviewRouter.get("/product/:productId", getReviewsByProductId);
reviewRouter.get("/:id", getReviewById);
reviewRouter.post("/", addReview)
reviewRouter.post("/:id/helpful", markReviewHelpful);
;


// Protected routes - require authentication
// reviewRouter.post("/", requireAuth, addReview);
// reviewRouter.post("/:id/helpful", requireAuth, markReviewHelpful);

export default reviewRouter;