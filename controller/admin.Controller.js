import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalAdmins, totalOrganizers, bannedUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "organizer" }),
    User.countDocuments({ isBanned: true }),
  ]);

  res.status(200).json({
    success: true,
    data: { stats: { totalUsers, totalAdmins, totalOrganizers, bannedUsers } },
  });
});

// ─── GET /api/admin/users ────────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { matricNumber: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
  });
});

// ─── GET /api/admin/users/:id ────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new ApiError(404, "User not found.");
  res.status(200).json({ success: true, data: { user } });
});

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (req.params.id === req.user.id.toString() && role !== "admin") {
    throw new ApiError(400, "You cannot demote yourself.");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found.");

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}.`,
    data: { user },
  });
});

// ─── PATCH /api/admin/users/:id/ban ──────────────────────────────────────────
export const banUser = asyncHandler(async (req, res) => {
  const { banned } = req.body;

  if (req.params.id === req.user.id.toString()) {
    throw new ApiError(400, "You cannot ban yourself.");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: banned },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(404, "User not found.");

  res.status(200).json({
    success: true,
    message: banned ? "User banned." : "User unbanned.",
    data: { user },
  });
});

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    throw new ApiError(400, "You cannot delete your own account.");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");

  res.status(200).json({ success: true, message: "User deleted." });
});