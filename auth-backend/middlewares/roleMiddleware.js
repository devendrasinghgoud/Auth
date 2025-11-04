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
