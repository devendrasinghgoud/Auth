import fs from "fs";
import Image from "../../models/imageModel.js";
import Product from "../../models/Product.js";

export const uploadImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: "No files uploaded" });

    const imageDocs = await Promise.all(
      req.files.map(async (file) => {
        const image = await Image.create({
          filename: file.filename,
          path: file.path,
          product: productId,
          uploadedBy: req.user._id,
        });
        return image._id;
      })
    );

    product.images.push(...imageDocs);
    await product.save();

    res.status(201).json({ success: true, message: "Images uploaded", imageIds: imageDocs });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findById(imageId);

    if (!image)
      return res.status(404).json({ success: false, message: "Image not found" });

    if (fs.existsSync(image.path)) fs.unlinkSync(image.path);

    await Product.findByIdAndUpdate(image.product, {
      $pull: { images: imageId },
    });

    await image.deleteOne();

    res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findById(imageId);

    if (!image)
      return res.status(404).json({ success: false, message: "Image not found" });

    if (!req.file)
      return res.status(400).json({ success: false, message: "No new image uploaded" });

    if (fs.existsSync(image.path)) fs.unlinkSync(image.path);

    image.filename = req.file.filename;
    image.path = req.file.path;
    await image.save();

    res.status(200).json({ success: true, message: "Image updated", image });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
