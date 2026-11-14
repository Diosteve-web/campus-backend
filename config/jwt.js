import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT token for a user.
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} Signed JWT
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Attach the JWT as an HTTP-only cookie on the response.
 * @param {object} res - Express response object
 * @param {string} token - Signed JWT string
 */
export const attachTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

/**
 * Clear the auth cookie on logout.
 * @param {object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
};