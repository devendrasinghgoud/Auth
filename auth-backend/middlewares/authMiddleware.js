import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import logger from "../utils/logger.js"; // ✅ Import the logger

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt - No token provided", {
        meta: { ip: req.ip, url: req.originalUrl },
      });
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    const { id, role } = decoded;

    let user = null;
    let userRole = null;

    const adminUser = await Admin.findById(id).select("-password -otp -otpExpires");
    if (adminUser) {
      user = adminUser;
      userRole = "admin";
      logger.info(`Admin authenticated: ${adminUser.email}`, {
        meta: { id: adminUser._id, role: userRole, url: req.originalUrl },
      });
    }

    if (!user) {
      const regularUser = await User.findById(id).select("-password -otp -otpExpires");
      if (regularUser) {
        user = regularUser;
        userRole = regularUser.role || "user";
        logger.info(`User authenticated: ${regularUser.email}`, {
          meta: { id: regularUser._id, role: userRole, url: req.originalUrl },
        });
      }
    }

  
    if (!user) {
      logger.warn("Token valid but user not found or deleted", {
        meta: { id, token },
      });
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }
    req.user = {
      ...user.toObject(),
      role: userRole,
    };

    next();
  } catch (err) {
    logger.error(`AUTH ERROR: ${err.message}`, {
      meta: {
        stack: err.stack,
        ip: req.ip,
        url: req.originalUrl,
      },
    });

    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Token has expired"
          : "Invalid or expired token",
    });
  }
};
