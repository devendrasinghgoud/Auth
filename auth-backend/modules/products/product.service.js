import Product from "../../models/Product.js";
import Image from "../../models/imageModel.js";
import cloudinary from "../../config/cloudinary.js";

export const createProductService = async (user, data, files) => {
  const { name, description, price, category, stock } = data;

  if (!name || !description || !price || !category) {
    throw new Error("All required fields must be filled");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    createdBy: user._id,
  });

  if (files && files.length > 0) {
    const imageDocs = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecommerce_products",
        });

        const image = await Image.create({
          filename: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          product: product._id,
          uploadedBy: user._id,
        });

        return image._id;
      })
    );

    product.images = imageDocs;
    await product.save();
  }

  return await product.populate("images");
};

export const getAllProductsService = async () => {
  return await Product.find()
    .populate("createdBy", "name email")
    .populate("images");
};

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id)
    .populate("createdBy", "name email")
    .populate("images");
  if (!product) throw new Error("Product not found");
  return product;
};

export const updateProductService = async (id, data, files, user) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  Object.assign(product, data);

  if (files && files.length > 0) {
    const newImages = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecommerce_products",
        });

        const image = await Image.create({
          filename: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          product: product._id,
          uploadedBy: user._id,
        });

        return image._id;
      })
    );

    product.images.push(...newImages);
  }

  await product.save();
  return await product.populate("images");
};

export const deleteProductService = async (id) => {
  const product = await Product.findById(id).populate("images");
  if (!product) throw new Error("Product not found");

  for (const img of product.images) {
    try {
      await cloudinary.uploader.destroy(img.public_id);
      await Image.findByIdAndDelete(img._id);
    } catch (err) {
      console.warn("⚠ Error deleting image:", err);
    }
  }

  await product.deleteOne();
  return true;
};
