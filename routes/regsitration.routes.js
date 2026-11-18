import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  registerForEvent, cancelRegistration, getMyRegistrations, getEventAttendees,
} from "../controllers/registration.controller.js";

const router = Router();

router.use(protect);

router.get("/my", getMyRegistrations);
router.post("/event/:eventId", restrictTo("student", "organizer", "admin"), registerForEvent);
router.delete("/event/:eventId", cancelRegistration);
router.get("/event/:eventId/attendees", restrictTo("organizer", "admin"), getEventAttendees);

export default router;