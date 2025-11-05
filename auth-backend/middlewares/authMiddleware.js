import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    let user = await Admin.findById(decoded.id).select("-password -otp -otpExpires");

    if (!user) {
      user = await User.findById(decoded.id).select("-password -otp -otpExpires");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Token has expired"
          : "Invalid or expired token",
    });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    // Check if the current authenticated user is in the Admin collection
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    next();
  } catch (err) {
    console.error("ADMIN AUTH ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};
