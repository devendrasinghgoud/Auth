import Category from "../../models/Category.js";
import Image from "../../models/imageModel.js";
import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.js";
import logger from "../../utils/logger.js"; //  Import logger

// Upload & create image doc
const uploadAndCreateImageDoc = async (file, user, categoryId = null) => {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const uploadedImage = await cloudinary.uploader.upload(dataURI, {
      folder: "categories",
    });

    const imageDoc = await Image.create({
      filename: file.originalname,
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
      uploadedBy: user?._id || null,
      category: categoryId,
    });

    logger.info(" Image uploaded successfully", {
      user: user?._id,
      imageId: imageDoc._id,
      categoryId,
    });

    return imageDoc;
  } catch (uploadError) {
    logger.error(" Image upload failed", {
      error: uploadError.message,
      user: user?._id,
    });
    throw new Error(`Image processing failed: ${uploadError.message || "Unknown error during file upload."}`);
  }
};

// Create multiple categories
export const createCategoriesService = async (categories, file = null, user = null) => {
  try {
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error("At least one category name is required");
    }

    let imageDoc = null;
    let categoryToLinkImage = null;

    if (file) {
      imageDoc = await uploadAndCreateImageDoc(file, user);
    }

    const newCategories = [];

    for (let name of categories) {
      name = name.trim();
      if (!name) continue;

      const existing = await Category.findOne({ category: name });
      if (!existing) {
        const created = await Category.create({
          category: name,
          image: imageDoc?._id || null,
        });
        newCategories.push(created);

        if (imageDoc && !categoryToLinkImage) {
          imageDoc.category = created._id;
          await imageDoc.save();
          categoryToLinkImage = created;
        }
      }
    }

    logger.info(" Categories created successfully", {
      user: user?._id,
      count: newCategories.length,
    });

    return {
      success: true,
      message:
        newCategories.length > 0
          ? "Categories created successfully"
          : "All provided categories already exist",
      results: newCategories,
      count: newCategories.length,
    };
  } catch (error) {
    logger.error(" Error creating categories", {
      error: error.message,
      user: user?._id,
    });
    throw error;
  }
};

// Update category image
export const updateCategoryService = async (id, file, user) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID format");
    }

    const category = await Category.findById(id).populate("image");
    if (!category) {
      throw new Error("Category not found");
    }

    if (!file) {
      throw new Error("No image file provided for update");
    }

    if (category.image) {
      await cloudinary.uploader.destroy(category.image.public_id);
      await Image.deleteOne({ _id: category.image._id });
    }

    const newImageDoc = await uploadAndCreateImageDoc(file, user, category._id);

    category.image = newImageDoc._id;
    await category.save();

    const updatedCategory = await Category.findById(id).populate("image", "url public_id");

    logger.info(" Category updated successfully", {
      categoryId: id,
      user: user?._id,
    });

    return {
      success: true,
      message: "Category image updated successfully",
      result: updatedCategory,
    };
  } catch (error) {
    logger.error(" Error updating category", {
      categoryId: id,
      error: error.message,
      user: user?._id,
    });
    throw error;
  }
};

// Get all categories
export const getAllCategoriesService = async (query = {}) => {
  try {
    const { search, sort, page = 1, limit = 10 } = query;
    const filter = {};

    if (search && search.trim()) {
      filter.category = { $regex: search.trim(), $options: "i" };
    }

    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "z-a":
        sortOption = { category: -1 };
        break;
      default:
        sortOption = { category: 1 };
    }

    const totalCount = await Category.countDocuments(filter);
    const categories = await Category.find(filter)
      .populate("image", "url public_id")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    logger.info(" Categories fetched", {
      total: categories.length,
      search,
      page,
    });

    return {
      success: true,
      results: categories,
      message: "Categories fetched successfully",
      pagination: {
        totalCount,
        count: categories.length,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  } catch (error) {
    logger.error(" Error fetching categories", { error: error.message });
    throw error;
  }
};

// Delete category
export const deleteCategoryService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid category ID");
    }

    const category = await Category.findById(id).populate("image");
    if (!category) throw new Error("Category not found");

    if (category.image) {
      await cloudinary.uploader.destroy(category.image.public_id);
      await category.image.deleteOne();
    }

    await category.deleteOne();

    logger.info(" Category deleted successfully", { categoryId: id });

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    logger.error(" Error deleting category", { categoryId: id, error: error.message });
    throw error;
  }
};
