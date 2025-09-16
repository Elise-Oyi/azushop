import { Router } from "express";
import { registerUser, getUsers } from "../controllers/userController.ts";

const router = Router();

router.post("/register", registerUser);
router.get("/", getUsers);

export default router;
