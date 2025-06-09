import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { apiResponse } from "../utils/apiResponse.js";

const createProduct = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { name, sku, description, price, category, stockQuantity, alertQuantity, tax } = req.body;

    if (
        [name, sku, description, category].some(field => typeof field !== 'string' || field.trim() === "") ||
        [price, stockQuantity, alertQuantity, tax].some(field => field === undefined || field === null)
    ) {
        throw new apiError(400, "All fields are required");
    }

    const existedProduct = await Product.findOne({ userId, $or: [{ sku }, { name }] });
    if (existedProduct) {
        throw new apiError(409, "Product with this SKU or name already exists");
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
        throw new apiError(404, "Category not found");
    }

    const createdProduct = await Product.create({
        userId,
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
        category: categoryDoc.name
    };

    return res.status(201).json(new apiResponse(201, productWithCategoryName, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { category } = req.query;
    const query = { userId };

    if (category) query.category = category;

    const products = await Product.find(query)
        .populate("category", "name description")
        .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
        return res.status(404).json(new apiResponse(404, "No products found"));
    }

    return res.status(200).json(new apiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, userId })
        .populate("category", "name description");

    if (!product) {
        return res.status(404).json(new apiResponse(404, "Product not found"));
    }

    return res.status(200).json(new apiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, sku, description, price, category, stockQuantity, alertQuantity, tax } = req.body;

    if (!name || !sku || !description || !price || !category || !stockQuantity || !alertQuantity || tax === undefined) {
        throw new apiError(400, "All fields are required");
    }

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
        throw new apiError(404, "Category not found");
    }

    const updatedProduct = await Product.findOneAndUpdate(
        { _id: id, userId },
        {
            $set: {
                name,
                sku,
                description,
                price,
                category: categoryDoc._id,
                stockQuantity,
                alertQuantity,
                tax
            }
        },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, updatedProduct, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    const deletedProduct = await Product.findOneAndDelete({ _id: id, userId });

    if (!deletedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, deletedProduct, "Product deleted successfully"));
});

const checkLowStock = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const allProducts = await Product.find({ userId }).populate("category", "name description");

    const lowStockProducts = allProducts.filter(
        (product) => product.stockQuantity <= product.alertQuantity
    );

    if (!lowStockProducts || lowStockProducts.length === 0) {
        return res.status(404).json(new apiResponse(404, "No low stock products found"));
    }

    return res.status(200).json(new apiResponse(200, lowStockProducts, "Low stock products fetched successfully"));
});

const updateStock = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const { stockQuantity } = req.body;

    if (stockQuantity === undefined || stockQuantity === null) {
        throw new apiError(400, "Stock quantity is required");
    }

    const updatedProduct = await Product.findOneAndUpdate(
        { _id: id, userId },
        { $set: { stockQuantity } },
        { new: true }
    );

    if (!updatedProduct) {
        return res.status(404).json(apiResponse(404, "Product not found"));
    }

    return res.status(200).json(apiResponse(200, updatedProduct, "Product stock updated successfully"));
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
