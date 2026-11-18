import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createGroupSchema } from "../validators/group.validator.js";
import {
  createGroup,
  getGroupByEvent,
  listMessages,
  joinGroup,
} from "../controllers/group.controller.js";

const router = Router();

router.use(protect); // all group routes need login

router.post("/", restrictTo("organizer", "admin"), validate(createGroupSchema), createGroup);
router.get("/event/:eventId", getGroupByEvent);
router.get("/:id/messages", listMessages);
router.post("/:id/join", joinGroup);

export default router;