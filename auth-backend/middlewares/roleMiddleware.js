// middlewares/roleMiddleware.js

export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: Please login to gain access" });
      }

      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access denied: You do not have the required permissions" });
      }

      next();
    } catch (error) {
      console.error("Authorize Middleware Error:", error.message);
      res.status(500).json({ success: false, message: "Server error during role validation" });
    }
  };
};

/**
 * Specific middleware to check for the 'admin' role.
 * This acts as a wrapper for the generic authorize function.
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user information found in request" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    next();
  } catch (error) {
    console.error("isAdmin Middleware Error:", error.message);
    res.status(500).json({ success: false, message: "Server error in role validation" });
  }
};