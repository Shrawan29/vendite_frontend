import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { apiResponse } from "../utils/apiResponse.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  const userId = req.user._id;

  if (!name?.trim() || !description?.trim()) {
    throw new apiError(400, "All fields are required");
  }

  const trimmedName = name.trim();

  const existedCategory = await Category.findOne({ name: trimmedName, userId });

  if (existedCategory) {
    throw new apiError(409, "Category with this name already exists for this user");
  }

  const newCategory = await Category.create({
    userId,
    name: trimmedName,
    description: description.trim(),
    parentCategory: parentCategory || null
  });

  if (!newCategory) {
    throw new apiError(500, "Something went wrong while creating category");
  }

  res.status(201).json(apiResponse(201, newCategory, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const categories = await Category.find({ userId })
    .populate("parentCategory", "name description")
    .sort({ createdAt: -1 });

  if (!categories.length) {
    return res.status(404).json(apiResponse(404, "No categories found"));
  }

  return res.status(200).json(apiResponse(200, "Categories fetched successfully", categories));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const category = await Category.findOne({ _id: id, userId })
    .populate("parentCategory", "name description");

  if (!category) {
    return res.status(404).json(apiResponse(404, "Category not found"));
  }

  return res.status(200).json(apiResponse(200, "Category fetched successfully", category));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parentCategory } = req.body;
  const userId = req.user._id;

  if (!name?.trim() || !description?.trim()) {
    throw new apiError(400, "All fields are required");
  }

  const category = await Category.findOneAndUpdate(
    { _id: id, userId },
    {
      name: name.trim(),
      description: description.trim(),
      parentCategory: parentCategory || null
    },
    { new: true }
  );

  if (!category) {
    return res.status(404).json(apiResponse(404, "Category not found"));
  }

  return res.status(200).json(apiResponse(200, "Category updated successfully", category));
});

const getSubCategories = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const subCategories = await Category.find({ parentCategory: id, userId })
    .populate("parentCategory", "name description");

  if (!subCategories.length) {
    return res.status(404).json(apiResponse(404, "No subcategories found"));
  }

  return res.status(200).json(apiResponse(200, "Subcategories fetched successfully", subCategories));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const category = await Category.findOne({ _id: id, userId });
  if (!category) {
    return res.status(404).json(apiResponse(404, "Category not found"));
  }

  const products = await Product.find({ category: id, userId });
  if (products.length > 0) {
    return res.status(400).json(apiResponse(400, "Cannot delete category with associated products"));
  }

  await Category.findByIdAndDelete(id);
  return res.status(200).json(apiResponse(200, "Category deleted successfully"));
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getSubCategories
};
