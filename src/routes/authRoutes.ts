import { Router } from "express";
import { register, login, updateAuthUser } from "../controllers/authController.ts";
import { testRegister, testLogin } from "../controllers/testAuthController.ts";

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

// Protected routes (will need auth middleware later)
router.put("/user/:uid", updateAuthUser);

export default router;