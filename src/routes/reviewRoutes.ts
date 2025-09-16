import { Router } from "express";
import { 
    addReview, 
    getReviewsByProductId, 
    getReviewById,
    markReviewHelpful 
} from "../controllers/reviewController.ts";
import { requireAuth } from "../middleware/authMiddleware.ts";
import router from "./productRoutes.ts";

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