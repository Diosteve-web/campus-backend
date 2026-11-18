import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken, attachTokenCookie, clearTokenCookie } from "../config/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const register = asyncHandler(async (req, res) => {
  const { fullname, matricNumber, email, password } = req.body;

  const existingMatric = await User.findOne({ matricNumber });
  if (existingMatric) throw new ApiError(409, "A user with this matric number already exists.");

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError(409, "A user with this email already exists.");
  }

  const user = await User.create({ fullname, matricNumber, email, password });
  const token = generateToken(user._id);
  attachTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: { user: user.toSafeObject(), token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
  const query = isEmail
    ? { email: identifier.toLowerCase() }
    : { matricNumber: identifier.toUpperCase() };

  const user = await User.findOne(query).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, "Invalid credentials.");

  if (user.isBanned) throw new ApiError(403, "Your account has been banned.");

  const token = generateToken(user._id);
  attachTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: { user: user.toSafeObject(), token },
  });
});

export const logout = (_req, res) => {
  clearTokenCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});

export const becomeOrganizer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found.");

  if (user.role === "organizer" || user.role === "admin") {
    throw new ApiError(400, "You are already an organizer.");
  }

  const { organizationName, description, socialHandle } = req.body;

  user.role = "organizer";
  user.organizerProfile = {
    organizationName: organizationName || "Individual",
    description: description || "",
    socialHandle: socialHandle || "",
    becameOrganizerAt: new Date(),
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "🎉 You are now an organizer. You can start creating events!",
    data: { user: user.toSafeObject() },
  });
});