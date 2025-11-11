// middlewares/roleMiddleware.js
import Logger from "../utils/logger.js";

export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        Logger.error("Unauthorized: Please login to gain access");
        return res.status(401).json({ success: false, message: "Unauthorized: Please login to gain access" });
      }

      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(req.user.role)) {
        Logger.warn(`Access denied for user ${req.user._id || "unknown"}: role ${req.user.role}`);
        return res.status(403).json({ success: false, message: "Access denied: You do not have the required permissions" });
      }

      next();
    } catch (error) {
      Logger.error("Authorize Middleware Error", error);
      res.status(500).json({ success: false, message: "Server error during role validation" });
    }
  };
};

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      Logger.error("Unauthorized: No user found in request");
      return res.status(401).json({ success: false, message: "Unauthorized: No user information found in request" });
    }

    if (req.user.role !== "admin") {
      Logger.warn(`Access denied for user ${req.user._id || "unknown"}: not an admin`);
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    next();
  } catch (error) {
    Logger.error("isAdmin Middleware Error", error);
    res.status(500).json({ success: false, message: "Server error in role validation" });
  }
};
