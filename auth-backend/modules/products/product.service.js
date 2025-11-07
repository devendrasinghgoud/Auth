import Product from "../../models/Product.js";
import Image from "../../models/imageModel.js";
import cloudinary from "../../config/cloudinary.js";

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

  // Upload product images (if any)
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

  // Compute discount and price
  const discount = Number(discountPercentage) || 0;
  const discountedPrice =
    original_price - (original_price * discount) / 100;
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
    category, //  now stores ObjectId of category
    images: imageIds,
    trending: trending ?? false,
    createdBy: user?._id || null,
  });

  return {
    success: true,
    message: "Product created successfully",
    result: product,
  };
};

export const getAllProductsService = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 8;
  const search = query.search?.trim() || "";
  const sortOrder = query.sort === "oldest" ? 1 : -1;

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

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id)
    .populate("category", "category _id")
    .populate("images", "url public_id")
    .populate("createdBy", "name email");

  if (!product) throw new Error("Product not found");

  return {
    success: true,
    message: "Product fetched successfully",
    result: product,
  };
};

export const updateProductService = async (id, data, files) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  const updatableFields = [
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

  for (const field of updatableFields) {
    if (data[field] !== undefined) product[field] = data[field];
  }

  // Recalculate price and stock
  const discount = Number(product.discountPercentage) || 0;
  product.price =
    product.original_price - (product.original_price * discount) / 100;
  product.inStock = (product.stockQuantity || 0) > 0;

  // Handle new image uploads
  if (files?.length) {
    // Delete old images
    if (product.images?.length) {
      for (const imgId of product.images) {
        const imgDoc = await Image.findById(imgId);
        if (imgDoc) {
          await cloudinary.uploader.destroy(imgDoc.public_id);
          await imgDoc.deleteOne();
        }
      }
    }

    // Upload new images
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

  return {
    success: true,
    message: "Product updated successfully",
    result: product,
  };
};

// -----------------
// Delete Product
// -----------------
export const deleteProductService = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  // Delete product images from Cloudinary + DB
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

  return {
    success: true,
    message: "Product and its images deleted successfully",
  };
};
