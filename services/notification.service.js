import admin, { initFirebase } from "../config/firebase.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

// Initialize once
initFirebase();

// ─── Send push to ONE user ──────────────────────────────────────────────────
export const sendToUser = async (userId, { title, body, type, data = {} }) => {
  try {
    // 1. Save notification record to DB
    const notification = await Notification.create({
      recipient: userId,
      title,
      body,
      type,
      data,
      deliveryStatus: "pending",
    });

    // 2. Get user's device tokens
    const user = await User.findById(userId);
    if (!user?.deviceTokens?.length) {
      notification.deliveryStatus = "failed";
      notification.failureReason = "No device tokens registered";
      await notification.save();
      return { success: false, reason: "No device tokens" };
    }

    // 3. Send via Firebase
    const tokens = user.deviceTokens.map((dt) => dt.token);
    const response = await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens,
    });

    // 4. Update delivery status
    notification.deliveryStatus =
      response.successCount > 0 ? "delivered" : "failed";
    await notification.save();

    // 5. Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === "messaging/invalid-registration-token" ||
            code === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });
      if (failedTokens.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $pull: { deviceTokens: { token: { $in: failedTokens } } } }
        );
      }
    }

    return {
      success: true,
      delivered: response.successCount,
      notificationId: notification._id,
    };
  } catch (error) {
    console.error("Push notification error:", error);
    return { success: false, reason: error.message };
  }
};

// ─── Send to MANY users ─────────────────────────────────────────────────────
export const sendToUsers = async (userIds, notification) => {
  return Promise.allSettled(
    userIds.map((id) => sendToUser(id, notification))
  );
};