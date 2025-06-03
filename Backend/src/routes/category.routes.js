import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getSubCategories
} from "../controllers/category.controller.js";

const router = express.Router();

// Create a new category
router.post("/create-category", createCategory);

// Get all categories
router.get("/get-all-categories", getAllCategories);

// Get a category by ID
router.get("/get-category/:id", getCategoryById);

// Update a category by ID
router.put("/update-category/:id", updateCategory);

// Delete a category by ID
router.delete("/delete-category/:id", deleteCategory);

// Get subcategories of a category
router.get("/get-subcategories/:id", getSubCategories);

export default router;
