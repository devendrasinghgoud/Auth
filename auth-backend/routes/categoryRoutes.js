import express from "express";
import { createCategory, updateCategory, getAllCategories, deleteCategory, upload } from "../modules/categorys/categoryController.js";

const router = express.Router();

router.post("/", upload.single("image"), createCategory);

router.put("/:id", upload.single("image"), updateCategory);
router.get("/", getAllCategories);
router.delete("/:id", deleteCategory);

export default router;