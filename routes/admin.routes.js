import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateRoleSchema, banUserSchema } from "../validators/admin.validator.js";
import {
  getDashboardStats, listUsers, getUserById,
  updateUserRole, banUser, deleteUser,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(protect, restrictTo("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", validate(updateRoleSchema), updateUserRole);
router.patch("/users/:id/ban", validate(banUserSchema), banUser);
router.delete("/users/:id", deleteUser);

export default router;