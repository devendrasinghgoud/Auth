import {
  uploadImagesService,
  deleteImageService,
  updateImageService,
} from "./imageService.js";

export const uploadImages = async (req, res) => {
  try {
    const imageIds = await uploadImagesService(req.user, req.params.productId, req.files);
    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      imageIds,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    await deleteImageService(req.params.imageId);
    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const image = await updateImageService(req.params.imageId, req.file);
    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image,
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
