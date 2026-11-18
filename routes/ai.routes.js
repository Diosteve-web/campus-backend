import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { aiSearchSchema, aiDescribeSchema } from "../validators/ai.validator.js";
import {
  aiSearch,
  aiDescribe,
} from "../controllers/ai.controller.js";

const router = Router();

// Any logged-in user can search with natural language
router.post(
  "/search",
  protect,
  validate(aiSearchSchema),
  aiSearch
);

// Only organizers/admins can use the description helper
router.post(
  "/describe",
  protect,
  restrictTo("organizer", "admin"),
  validate(aiDescribeSchema),
  aiDescribe
);

export default router;