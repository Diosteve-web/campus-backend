import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    error = new ApiError(409, `An account with this ${field} already exists.`);
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    error = new ApiError(400, messages[0]);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token. Please log in again.");
  }
  if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Session expired. Please log in again.");
  }

  const status = error.statusCode || 500;
  const message = error.message || "Something went wrong.";

  if (process.env.NODE_ENV === "development" && status === 500) {
    console.error("❌", err);
  }

  res.status(status).json({ success: false, message });
};