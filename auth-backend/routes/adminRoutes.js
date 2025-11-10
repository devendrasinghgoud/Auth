import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  getOrdersByUserId,
  deleteOrder,
} from "../modules/admin/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import Admin from "../models/Admin.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// --- Admin-Protected Routes ---

router.get("/users", protect, isAdmin, getAllUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

router.get("/products", protect, isAdmin, getAllProducts);
router.delete("/products/:id", protect, isAdmin, deleteProduct);

router.get("/orders", protect, isAdmin, getAllOrders);
router.delete("/orders/:id", protect, isAdmin, deleteOrder);
router.get("/users/:userId/orders", protect, isAdmin, getOrdersByUserId);

router.get("/admins", protect, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const totalAdmins = await Admin.countDocuments(filter);
    const admins = await Admin.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(totalAdmins / limit),
      totalAdmins,
      admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching admins",
    });
  }
});

export default router;