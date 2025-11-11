import {
  createCategoriesService,
  getAllCategoriesService,
  deleteCategoryService,
  updateCategoryService,
} from "./categoryService.js";
import multer from "multer";
import logger from "../../utils/logger.js";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const createCategory = asyncHandler(async (req, res) => {
  try {
    let { categories } = req.body;
    if (!categories) {
      logger.warn("Category creation failed: No category names provided");
      return res.status(400).json({ success: false, message: "Please provide at least one category name" });
    }

    if (typeof categories === "string") {
      categories = categories.split(",").map(c => c.trim()).filter(Boolean);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      logger.warn("Category creation failed: Invalid categories array");
      return res.status(400).json({ success: false, message: "Please provide at least one category name" });
    }

    const file = req.file || null;
    const createdCategories = await createCategoriesService(categories, file, req.user);
    const statusCode = createdCategories.count > 0 ? 201 : 200;

    logger.info(`Categories created successfully by user ${req.user?._id}`);
    res.status(statusCode).json({
      success: true,
      message: createdCategories.message,
      results: createdCategories.results,
      count: createdCategories.count,
    });
  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    let statusCode = 400;
    if (error.message.includes("Image processing failed") || error.message.includes("validation")) {
      statusCode = 400;
    }
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create categories.",
    });
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file || null;

    if (!file) {
      logger.warn(`Update failed for category ${id}: No image provided`);
      return res.status(400).json({ success: false, message: "Image file is required for update." });
    }

    const updatedCategory = await updateCategoryService(id, file, req.user);
    logger.info(`Category ${id} updated successfully by user ${req.user?._id}`);

    res.status(200).json({
      success: true,
      message: updatedCategory.message,
      result: updatedCategory.result,
    });
  } catch (error) {
    logger.error(`Error updating category ${req.params.id}: ${error.message}`);
    let statusCode = 500;
    if (error.message.includes("Category not found")) statusCode = 404;
    else if (error.message.includes("Invalid category ID") || error.name === "CastError") statusCode = 400;
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

    logger.info(`Fetched categories successfully (page ${page})`);
    res.status(200).json({
      success: true,
      message: categories.message,
      results: categories.results,
      count: categories.pagination.totalCount,
      pagination: categories.pagination,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch categories" });
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await deleteCategoryService(id);
    logger.info(`Category ${id} deleted successfully by user ${req.user?._id}`);
    res.status(200).json({ success: true, message: deletedCategory.message });
  } catch (error) {
    logger.error(`Error deleting category ${req.params.id}: ${error.message}`);
    let statusCode = 500;
    let message = "Failed to delete category";

    if (error.name === "CastError" || error.message.includes("Invalid category ID")) {
      statusCode = 400;
      message = "Invalid category ID format";
    } else if (error.message.includes("Category not found")) {
      statusCode = 404;
      message = "Category not found";
    }

    res.status(statusCode).json({ success: false, message });
  }
});
