import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createEventSchema } from "../validators/event.validator.js";
import {
  createEvent, listEvents, getEvent, getMyEvents, updateEvent, deleteEvent,
} from "../controllers/event.controller.js";

const router = Router();

// Public
router.get("/", listEvents);
router.get("/my-events", protect, restrictTo("organizer", "admin"), getMyEvents);
router.get("/:slug", getEvent);

// Organizer/admin
router.post("/", protect, restrictTo("organizer", "admin"), validate(createEventSchema), createEvent);
router.patch("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;