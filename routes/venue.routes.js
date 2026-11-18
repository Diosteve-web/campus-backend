import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createVenueSchema } from "../validators/venue.validator.js";
import { listVenues, createVenue, searchPlacesForVenue } from "../controllers/venue.controller.js";

const router = Router();

router.get("/", listVenues);
router.get("/search-places", protect, searchPlacesForVenue);
router.post("/", protect, restrictTo("organizer", "admin"), validate(createVenueSchema), createVenue);

export default router;