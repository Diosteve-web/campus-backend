import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import venueRoutes from "./venue.routes.js";
import eventRoutes from "./event.routes.js";
import registrationRoutes from "./registration.routes.js";
import groupRoutes from "./group.routes.js";
import navigationRoutes from "./navigation.routes.js";
import notificationRoutes from "./notification.routes.js";
import aiRoutes from "./ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/venues", venueRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/groups", groupRoutes);
router.use("/navigation", navigationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);

export default router;