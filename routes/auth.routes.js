import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getCurrentUser);

export default router;