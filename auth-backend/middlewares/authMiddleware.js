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

    // The token should ideally contain the role, but we'll re-verify it here.
    const { id, role } = decoded;

    let user = null;
    let userRole = null;
    
    // 1. Check Admin Model (Admin should have role: 'admin')
    const adminUser = await Admin.findById(id).select("-password -otp -otpExpires");

    if (adminUser) {
      user = adminUser;
      // CRITICAL FIX: Ensure the role is explicitly set on the user object
      // (Assuming your Admin model has a default role of 'admin' or it was added during login/register)
      userRole = 'admin'; 
    } 
    
    // 2. If not found in Admin, check User Model (User should have role: 'user')
    if (!user) {
      const regularUser = await User.findById(id).select("-password -otp -otpExpires");
      if (regularUser) {
        user = regularUser;
        // CRITICAL FIX: Ensure the role is explicitly set for a regular user
        userRole = regularUser.role || 'user'; // Use existing role or default to 'user'
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    // Attach the full user object AND the role to the request
    // This ensures req.user.role is available for roleMiddleware.js
    req.user = {
        ...user.toObject(), // Convert Mongoose document to plain object
        role: userRole
    };
    
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

