// CineGo / Server / middlewares / auth.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
        error: `Auth Middleware Token Error: ${error.message}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
      error: `Auth Middleware Server Error: ${error.message}`,
    });
  }
}
