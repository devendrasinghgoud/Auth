import Category from "../../models/Category.js";
import mongoose from "mongoose";

export const createCategoriesService = async (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error("At least one category name is required");
  }

  const newCategories = [];

  for (let name of categories) {
    name = name.trim();
    if (!name) continue;

    const existing = await Category.findOne({ name });
    if (!existing) {
      const created = await Category.create({ name });
      newCategories.push(created);
    }
  }

  return {
    success: true,
    message:
      newCategories.length > 0
        ? "Categories created successfully"
        : "All provided categories already exist",
    results: newCategories.map((c) => ({
      _id: c._id,
      name: c.name,
      createdAt: c.createdAt,
    })),
    count: newCategories.length,
  };
};

export const getAllCategoriesService = async (query = {}) => {
  const { search, sort } = query;
  const filter = {};

  if (search && search.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
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
      sortOption = { name: -1 };
      break;
    default:
      sortOption = { name: 1 };
  }

  const categories = await Category.find(filter)
    .select("name createdAt")
    .sort(sortOption);

  return {
    success: true,
    message: "Categories fetched successfully",
    results: categories.map((c) => ({
      _id: c._id,
      name: c.name,
      createdAt: c.createdAt,
    })),
    count: categories.length,
  };
};

export const deleteCategoryService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");

  await category.deleteOne();

  return {
    success: true,
    message: "Category deleted successfully",
  };
};
