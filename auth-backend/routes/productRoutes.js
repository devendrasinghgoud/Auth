import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../modules/products/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";


const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, isAdmin, upload.array("images", 5), createProduct);
router.put("/:id", protect, isAdmin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);
router.post("/", protect, upload.array("images"), createProduct);

export default router;
