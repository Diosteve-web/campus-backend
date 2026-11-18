import Notification from "../models/Notification.model.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ─── POST /api/notifications/register-device ────────────────────────────────
export const registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body;

  if (!token || !platform) {
    throw new ApiError(400, "Token and platform are required.");
  }
  if (!["ios", "android"].includes(platform)) {
    throw new ApiError(400, "Platform must be 'ios' or 'android'.");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found.");

  // Remove this token if already exists (prevent duplicates)
  user.deviceTokens = user.deviceTokens.filter((dt) => dt.token !== token);

  // Add new token
  user.deviceTokens.push({
    token,
    platform,
    lastUsedAt: new Date(),
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Device registered for push notifications.",
  });
});

// ─── POST /api/notifications/unregister-device ──────────────────────────────
export const unregisterDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, "Token is required.");

  await User.updateOne(
    { _id: req.user.id },
    { $pull: { deviceTokens: { token } } }
  );

  res.status(200).json({
    success: true,
    message: "Device unregistered from push notifications.",
  });
});

// ─── GET /api/notifications ─────────────────────────────────────────────────
export const listNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;

  const filter = { recipient: req.user.id };
  if (unreadOnly === "true") filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: { notifications, unreadCount },
  });
});

// ─── PATCH /api/notifications/:id/read ──────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) throw new ApiError(404, "Notification not found.");

  res.status(200).json({ success: true, data: { notification } });
});

// ─── PATCH /api/notifications/read-all ──────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
});

// ─── DELETE /api/notifications/:id ──────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });

  if (!notification) throw new ApiError(404, "Notification not found.");

  res.status(200).json({
    success: true,
    message: "Notification deleted.",
  });
});