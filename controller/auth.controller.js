import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generateToken, attachTokenCookie, clearTokenCookie } from "../config/jwt.js";

// ─── Register ────────────────────────────────────────────────────────────────


export const register = async (req, res) => {
  try {
    const { fullname, matricNumber, email, password } = req.body;

    // --- Validation ---
    if (!fullname || !matricNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, matric number, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // --- Check for duplicates ---
    const existingMatric = await User.findOne({
      matricNumber: matricNumber.toUpperCase(),
    });
    if (existingMatric) {
      return res.status(409).json({
        success: false,
        message: "A user with this matric number already exists.",
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists.",
        });
      }
    }


    // --- Create user ---
    const user = await User.create({
      fullname: fullname.trim(),
      matricNumber: matricNumber.trim().toUpperCase(),
      email: email ? email.trim().toLowerCase() : undefined,
      password,
    });

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    // Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }


    // Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────


export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Identifier (email or matric number) and password are required.",
      });
    }

    const isEmail = /^\S+@\S+\.\S+$/.test(identifier.trim());

    const query = isEmail
      ? { email: identifier.trim().toLowerCase() }
      : { matricNumber: identifier.trim().toUpperCase() };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // ✅ using bcrypt directly — no instance method
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user._id);
    attachTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = (_req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// ─── Get Current User ─────────────────────────────────────────────────────────


export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
};