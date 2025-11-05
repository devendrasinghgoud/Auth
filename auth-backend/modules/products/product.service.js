import Product from "../../models/Product.js";
import Image from "../../models/imageModel.js";
import cloudinary from "../../config/cloudinary.js";


export const createProductService = async (user, data, files) => {
  const { name, description, price, category, stock } = data;

  if (!name || !description || !price || !category) {
    throw new Error(
      "All required fields (name, description, price, category) must be filled."
    );
  }

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    stock: stock || 0,
    createdBy: user._id,
  });

  if (files?.length) {
    const imageIds = await Promise.all(
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
    product.images = imageIds;
    await product.save();
  }

  return await product.populate("images");
};


export const getAllProductsService = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const search = query.search?.trim() || "";
  const sortOrder = query.sort === "oldest" ? 1 : -1;

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("createdBy", "firstName lastName email")
    .populate("images", "url filename")
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    message: "Products fetched successfully",
    products,
    count: products.length,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
  };
};


export const getProductByIdService = async (id) => {
  const product = await Product.findById(id)
    .populate("createdBy", "firstName lastName email")
    .populate("images", "url filename public_id");

  if (!product) throw new Error("Product not found");
  return product;
};


export const updateProductService = async (id, data, files, user) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  Object.assign(product, data);

  if (typeof data.stock !== "undefined") {
    product.stock = Number(data.stock);
  }

  if (files?.length) {
    const newImageIds = await Promise.all(
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

    product.images.push(...newImageIds);
  }

  await product.save();
  return await product.populate("images");
};


export const deleteProductService = async (id) => {
  const product = await Product.findById(id).populate("images");
  if (!product) throw new Error("Product not found");

  // Delete images from Cloudinary and DB
  if (product.images?.length) {
    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      await Image.findByIdAndDelete(img._id);
    }
  }

  await product.deleteOne();
  return { success: true, message: "Product and its images deleted successfully" };
};
