import Product from "../../models/Product.js";
import Image from "../../models/imageModel.js";
import cloudinary from "../../config/cloudinary.js";
import logger from "../../utils/logger.js";

// ---------------------------
// Create Product
// ---------------------------
export const createProductService = async (user, data, files) => {
  const {
    title,
    description,
    original_price,
    discountPercentage,
    rating,
    stockQuantity,
    brand,
    category,
    trending,
  } = data;

  if (!title || !description || !original_price || !category || !brand) {
    throw new Error(
      "All required fields (title, description, original_price, category, brand) must be filled."
    );
  }

  logger.info("Creating new product", { title, userId: user?._id });

  const imageIds = [];
  if (files?.length) {
    for (const file of files) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "ecommerce_products",
      });

      const imgDoc = await Image.create({
        filename: file.originalname,
        url: upload.secure_url,
        public_id: upload.public_id,
        uploadedBy: user?._id || null,
      });

      imageIds.push(imgDoc._id);
    }
  }

  const discount = Number(discountPercentage) || 0;
  const discountedPrice = original_price - (original_price * discount) / 100;
  const quantity = Number(stockQuantity) || 0;

  const product = await Product.create({
    title: title.trim(),
    description: description.trim(),
    original_price,
    discountPercentage: discount,
    price: discountedPrice,
    rating: rating || 0,
    stockQuantity: quantity,
    inStock: quantity > 0,
    brand: brand.trim(),
    category,
    images: imageIds,
    trending: trending ?? false,
    createdBy: user?._id || null,
  });

  logger.info("Product created successfully", {
    productId: product._id,
    title: product.title,
  });

  return {
    success: true,
    message: "Product created successfully",
    result: product,
  };
};

// ---------------------------
// Get All Products
// ---------------------------
export const getAllProductsService = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;
  const search = query.search?.trim() || "";
  const sortOrder = query.sort === "oldest" ? 1 : -1;

  logger.info("Fetching products", { page, limit, search, sortOrder });

  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const total = await Product.countDocuments(filter);

  const results = await Product.find(filter)
    .populate("category", "category _id")
    .populate("images", "url public_id")
    .populate("createdBy", "name email")
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  logger.info("Products fetched", {
    count: results.length,
    total,
    totalPages: Math.ceil(total / limit),
  });

  return {
    success: true,
    message: "Products fetched successfully",
    results,
    count: results.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};

// ---------------------------
// Get Product By ID
// ---------------------------
export const getProductByIdService = async (id) => {
  logger.info("Fetching product by ID", { productId: id });

  const product = await Product.findById(id)
    .populate("category", "category _id")
    .populate("images", "url public_id")
    .populate("createdBy", "name email");

  if (!product) {
    logger.warn("Product not found", { productId: id });
    throw new Error("Product not found");
  }

  logger.info("Product fetched successfully", { productId: id });

  return {
    success: true,
    message: "Product fetched successfully",
    result: product,
  };
};

// ---------------------------
// Update Product
// ---------------------------
export const updateProductService = async (id, data, files) => {
  logger.info("Updating product", { productId: id });

  const product = await Product.findById(id);
  if (!product) {
    logger.warn("Product not found for update", { productId: id });
    throw new Error("Product not found");
  }

  const fields = [
    "title",
    "description",
    "original_price",
    "discountPercentage",
    "rating",
    "stockQuantity",
    "brand",
    "category",
    "trending",
  ];

  for (const field of fields) {
    if (data[field] !== undefined) product[field] = data[field];
  }

  const discount = Number(product.discountPercentage) || 0;
  product.price =
    product.original_price - (product.original_price * discount) / 100;
  product.inStock = (product.stockQuantity || 0) > 0;

  if (files?.length) {
    if (product.images?.length) {
      for (const imgId of product.images) {
        const imgDoc = await Image.findById(imgId);
        if (imgDoc) {
          await cloudinary.uploader.destroy(imgDoc.public_id);
          await imgDoc.deleteOne();
        }
      }
    }

    const newImageIds = [];
    for (const file of files) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "ecommerce_products",
      });

      const imgDoc = await Image.create({
        filename: file.originalname,
        url: upload.secure_url,
        public_id: upload.public_id,
        uploadedBy: product.createdBy || null,
      });

      newImageIds.push(imgDoc._id);
    }

    product.images = newImageIds;
  }

  await product.save();

  logger.info("Product updated successfully", { productId: id });

  return {
    success: true,
    message: "Product updated successfully",
    result: product,
  };
};

// ---------------------------
// Delete Product
// ---------------------------
export const deleteProductService = async (id) => {
  logger.info("Deleting product", { productId: id });

  const product = await Product.findById(id);
  if (!product) {
    logger.warn("Product not found for deletion", { productId: id });
    throw new Error("Product not found");
  }

  if (product.images?.length) {
    for (const imgId of product.images) {
      const imgDoc = await Image.findById(imgId);
      if (imgDoc) {
        await cloudinary.uploader.destroy(imgDoc.public_id);
        await imgDoc.deleteOne();
      }
    }
  }

  await product.deleteOne();

  logger.info("Product deleted successfully", { productId: id });

  return {
    success: true,
    message: "Product and its images deleted successfully",
  };
};
