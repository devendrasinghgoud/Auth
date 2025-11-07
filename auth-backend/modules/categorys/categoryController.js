import {
  createCategoriesService,
  getAllCategoriesService,
  deleteCategoryService,
} from "./categoryService.js";

export const createCategory = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one category name",
      });
    }

    const createdCategories = await createCategoriesService(categories);

    res.status(201).json({
      success: true,
      message: createdCategories.message,
      results: createdCategories.results, // only the new categories
      count: createdCategories.count,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create categories",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const categories = await getAllCategoriesService({ search, sort });

    res.status(200).json({
      success: true,
      message: categories.message,
      results: categories.results,
      count: categories.count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await deleteCategoryService(id);

    res.status(200).json({
      success: true,
      message: deletedCategory.message,
    });
  } catch (error) {
    let statusCode = 500;
    let message = "Failed to delete category";

    if (error.name === "CastError" || error.message === "Invalid category ID") {
      statusCode = 400;
      message = "Invalid category ID format";
    } else if (error.message === "Category not found") {
      statusCode = 404;
      message = "Category not found";
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
