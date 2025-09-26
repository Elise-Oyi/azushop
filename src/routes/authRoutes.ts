import { Router } from "express";
import { register, login, updateAuthUser } from "../controllers/authController.js";
import { testRegister, testLogin } from "../controllers/testAuthController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Test routes (no Firebase)
router.get("/ping", (req, res) => {
  res.json({ message: "Auth routes are working!", timestamp: new Date().toISOString() });
});
router.post("/test", (req, res) => {
  res.success("Test endpoint works!", req.body);
});
router.post("/test-register", testRegister);
router.post("/test-login", testLogin);

// Public routes (with Firebase)
router.post("/register", register);
router.post("/login", login);

// Protected routes (require authentication)
router.put("/user/:uid", requireAuth, updateAuthUser);

export default router;