import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { apiResponse } from "../utils/apiResponse.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, description, price, category, stockQuantity, alertQuantity, tax } = req.body;

    // Validation for required fields
    if (
        [name, sku, description, category].some((field) => typeof field !== 'string' || field.trim() === "") ||
        [price, stockQuantity, alertQuantity, tax].some((field) => field === undefined || field === null)
    ) {
        throw new apiError(400, "All fields are required");
    }

    const existedProduct = await Product.findOne({ $or: [{ sku }, { name }] });

    if (existedProduct) {
        throw new apiError(409, "Product with this SKU and name already exists");
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
        throw new apiError(404, "Category not found");
    }

    const createdProduct = await Product.create({
        name,
        sku,
        description,
        price,
        category: categoryDoc._id,
        stockQuantity,
        alertQuantity,
        tax
    });

    const productWithCategoryName = {
        ...createdProduct.toObject(),
        category: categoryDoc.name  // Add category name to the response
    };

    if (!createdProduct) {
        throw new apiError(500, "Something went wrong while creating product");
    }

    return res.status(201).json(new apiResponse(201, productWithCategoryName, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = category ? { category } : {};

    const products = await Product.find(query)
        .populate("category", "name description")
        .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
        return res.status(404).json(new apiResponse(404, "No products found"));
    }

    return res.status(200).json(new apiResponse(200, "Products fetched successfully", products));
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id)
        .populate("category", "name description");

    if (!product) {
        return res.status(404).json(new apiResponse(404, "Product not found"));
    }

    return res.status(200).json(new apiResponse(200, "Product fetched successfully", product));
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, sku, description, price, category, stockQuantity, alertQuantity, tax } = req.body;

    // Validation for required fields
    if (!name || !sku || !description || !price || !category || !stockQuantity || !alertQuantity || tax === undefined) {
        throw new apiError(400, "All fields are required");
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, {
        $set: {
            name,
            sku,
            description,
            price,
            category,
            stockQuantity,
            alertQuantity,
            tax
        }
    }, { new: true });

    if (!updatedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, "Product updated successfully", updatedProduct));
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, "Product deleted successfully", deletedProduct));
});

const checkLowStock = asyncHandler(async (req, res) => {
    const lowStockProducts = await Product.find({ stockQuantity: { $lte: alertQuantity } })
        .populate("category", "name description");

    if (!lowStockProducts || lowStockProducts.length === 0) {
        return res.status(404).json(apiResponse(404, "No low stock products found"));
    }

    return res.status(200).json(apiResponse(200, "Low stock products fetched successfully", lowStockProducts));
});

const updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    if (!stockQuantity) {
        throw new apiError(400, "Stock quantity is required");
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, {
        $set: {
            stockQuantity: stockQuantity
        }
    }, { new: true });

    if (!updatedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, "Product stock updated successfully", updatedProduct));
});

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    checkLowStock,
    updateStock
};
