import {
  uploadImagesService,
  deleteImageService,
  updateImageService,
} from "./imageService.js";
import logger from "../../utils/logger.js";

export const uploadImages = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ success: false, message: "No images provided for upload" });

    const { productId } = req.params;
    if (!productId)
      return res.status(400).json({ success: false, message: "Product ID is required" });

    const imageIds = await uploadImagesService(req.user, productId, req.files);
    logger.info(" Images uploaded successfully", { user: req.user?._id, productId, count: imageIds.length });

    res.status(201).json({ success: true, message: "Images uploaded successfully", imageIds });
  } catch (error) {
    logger.error(" Upload failed", { error: error.message, user: req.user?._id });
    res.status(400).json({ success: false, message: error.message || "Failed to upload images" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    if (!imageId)
      return res.status(400).json({ success: false, message: "Image ID is required" });

    await deleteImageService(imageId, req.user);
    logger.info("🗑️ Image deleted successfully", { imageId, user: req.user?._id });

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    logger.error(" Delete failed", { error: error.message, imageId: req.params.imageId, user: req.user?._id });
    res.status(400).json({ success: false, message: error.message || "Failed to delete image" });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    if (!imageId)
      return res.status(400).json({ success: false, message: "Image ID is required" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "No image file provided for update" });

    const updatedImage = await updateImageService(imageId, req.file, req.user);
    logger.info(" Image updated successfully", { imageId, user: req.user?._id });

    res.status(200).json({ success: true, message: "Image updated successfully", image: updatedImage });
  } catch (error) {
    logger.error(" Update failed", { error: error.message, imageId: req.params.imageId, user: req.user?._id });
    res.status(400).json({ success: false, message: error.message || "Failed to update image" });
  }
};
