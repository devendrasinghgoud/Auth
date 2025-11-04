import express from "express";
import { uploadImages, deleteImage, updateImage } from "../modules/images/imageController.js";
import upload from "../utils/multerConfig.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/:productId",
  protect,
  isAdmin,
  upload.array("images", 5),
  uploadImages
);

router.put(
  "/:imageId",
  protect,
  isAdmin,
  upload.single("image"),
  updateImage
);

router.delete("/:imageId", protect, isAdmin, deleteImage);

export default router;
