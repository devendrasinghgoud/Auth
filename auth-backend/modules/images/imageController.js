import {
  uploadImagesService,
  deleteImageService,
  updateImageService,
} from "./imageService.js";

// Upload multiple images for a product
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided for upload",
      });
    }

    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const imageIds = await uploadImagesService(req.user, productId, req.files);

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      imageIds,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to upload images",
    });
  }
};

// Delete a single image by ID
export const deleteImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    await deleteImageService(imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete image",
    });
  }
};

// Update a single image by replacing the file
export const updateImage = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided for update",
      });
    }

    const updatedImage = await updateImageService(imageId, req.file);

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update image",
    });
  }
};
