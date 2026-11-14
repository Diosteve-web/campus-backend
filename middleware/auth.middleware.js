import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

/**
 * Protect middleware — verifies JWT from Authorization header or cookie.
 * Attaches the decoded user to req.user on success.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fall back to HTTP-only cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid token. Please log in again.";

      return res.status(401).json({ success: false, message });
    }

    // 4. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during authentication.",
    });
  }
};