import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, becomeOrganizerSchema } from "../validators/auth.validator.js";
import { register, login, logout, getCurrentUser, becomeOrganizer } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.post("/become-organizer", protect, validate(becomeOrganizerSchema), becomeOrganizer);

export default router;