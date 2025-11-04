import Product from "../../models/Product.js";
import Image from "../../models/imageModel.js";
import cloudinary from "../../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      createdBy: req.user._id,
    });

    if (req.files && req.files.length > 0) {
      const imageDocs = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ecommerce_products",
          });

          const image = await Image.create({
            filename: file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            product: product._id,
            uploadedBy: req.user._id,
          });

          return image._id;
        })
      );

      product.images = imageDocs;
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: await product.populate("images"),
    });
  } catch (error) {
    console.error(" Product creation failed:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email")
      .populate("images");

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(" Fetch all products failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("images");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(" Fetch product by ID failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    Object.assign(product, req.body);

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ecommerce_products",
          });

          const image = await Image.create({
            filename: file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            product: product._id,
            uploadedBy: req.user._id,
          });

          return image._id;
        })
      );

      product.images.push(...newImages);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: await product.populate("images"),
    });
  } catch (error) {
    console.error(" Product update failed:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("images");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    for (const img of product.images) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        await Image.findByIdAndDelete(img._id);
      } catch (err) {
        console.warn("⚠ Error deleting image:", err);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product and its images deleted",
    });
  } catch (error) {
    console.error(" Product deletion failed:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
