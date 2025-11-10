import {
  createCategoriesService,
  getAllCategoriesService,
  deleteCategoryService,
  updateCategoryService,
} from "./categoryService.js";
import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory temporarily
export const upload = multer({ storage });

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const createCategory = asyncHandler(async (req, res) => {
  try {
    let { categories } = req.body;

    // Validate input
    if (!categories) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide at least one category name" });
    }

    // Convert comma-separated string to array
    if (typeof categories === "string") {
      categories = categories.split(",").map(c => c.trim()).filter(Boolean);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide at least one category name" });
    }

    const file = req.file || null; // optional image file
    const createdCategories = await createCategoriesService(categories, file, req.user);

    const statusCode = createdCategories.count > 0 ? 201 : 200;

    // Return created categories with message
    res.status(statusCode).json({
      success: true,
      message: createdCategories.message,
      results: createdCategories.results,
      count: createdCategories.count,
    });
  } catch (error) {
    // Handle specific errors
    let statusCode = 400;
    if (error.message.includes("Image processing failed")) {
      statusCode = 400;
    } else if (error.message.includes("Categories validation failed")) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create categories due to an unknown error.",
    });
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file || null;

    if (!file) {
      return res.status(400).json({ success: false, message: "Image file is required for update." });
    }

    const updatedCategory = await updateCategoryService(id, file, req.user);

    res.status(200).json({
      success: true,
      message: updatedCategory.message,
      result: updatedCategory.result,
    });
  } catch (error) {
    let statusCode = 500;

    // Determine proper status code based on error
    if (error.message.includes("Category not found")) statusCode = 404;
    else if (error.message.includes("Invalid category ID")) statusCode = 400;
    else if (error.message.includes("Image processing failed")) statusCode = 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update category image",
    });
  }
});

export const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;

    const categories = await getAllCategoriesService({
      search,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      message: categories.message,
      results: categories.results,
      count: categories.pagination.totalCount,
      pagination: categories.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch categories" });
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await deleteCategoryService(id);

    res.status(200).json({ success: true, message: deletedCategory.message });
  } catch (error) {
    let statusCode = 500;
    let message = "Failed to delete category";

    // Check for invalid ID
    if (error.name === "CastError" || error.message === "Invalid category ID") {
      statusCode = 400;
      message = "Invalid category ID format";
    } else if (error.message === "Category not found") {
      statusCode = 404;
      message = "Category not found";
    }

    res.status(statusCode).json({ success: false, message });
  }
});
