// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
} from "../modules/categorys/categoryController.js";

const router = express.Router();

// -------------------
// CRUD routes only
// -------------------

// Create a new category
// POST /api/admin/categories
router.post("/", createCategory);

// Get all categories
// GET /api/admin/categories
router.get("/", getAllCategories);

// Delete category by ID
// DELETE /api/admin/categories/:id
router.delete("/:id", deleteCategory);

export default router;
