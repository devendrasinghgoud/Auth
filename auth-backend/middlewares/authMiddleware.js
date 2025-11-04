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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");

    let user;

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password -otp -otpExpires");
    } else {
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

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};
