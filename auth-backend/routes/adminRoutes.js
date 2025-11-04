import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAllUsers,
  deleteUser,
} from "../modules/admin/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import Admin from "../models/Admin.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/users", protect, isAdmin, getAllUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

router.get("/all", protect, isAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
