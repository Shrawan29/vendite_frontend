import { Bill } from "../models/bill.model.js";
import { Product } from "../models/product.model.js";
import { SalesSummary } from "../models/salesSummary.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

// Helper to build date range
const getDateFilter = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  end.setDate(end.getDate() + 1); // Move to next month start
  return { createdAt: { $gte: start, $lt: end } };
};

// @route   POST /api/v2/sales-summary/update?month=6&year=2025
export const updateSalesSummary = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);

  if (isNaN(month) || isNaN(year)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid month or year"));
  }

  const match = getDateFilter(month, year);

  const revenueAgg = await Bill.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$finalAmount" },
        numberOfOrders: { $sum: 1 }
      }
    }
  ]);
  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
  const numberOfOrders = revenueAgg[0]?.numberOfOrders || 0;
  const averageOrderValue = numberOfOrders ? (totalRevenue / numberOfOrders) : 0;

  const productAgg = await Bill.aggregate([
    { $match: match },
    { $unwind: "$products" },
    {
      $group: {
        _id: null,
        totalProductsSold: { $sum: "$products.quantity" }
      }
    }
  ]);
  const totalProductsSold = productAgg[0]?.totalProductsSold || 0;

  const topProducts = await Bill.aggregate([
    { $match: match },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        name: { $first: "$products.name" },
        quantitySold: { $sum: "$products.quantity" },
        revenue: { $sum: "$products.totalPrice" }
      }
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 5 },
    {
      $project: {
        productId: "$_id",
        name: 1,
        quantitySold: 1,
        revenue: 1,
        _id: 0
      }
    }
  ]);

  const topCategories = await Bill.aggregate([
    { $match: match },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.category",
        totalQuantity: { $sum: "$products.quantity" },
        totalRevenue: { $sum: "$products.totalPrice" }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails"
      }
    },
    { $unwind: "$categoryDetails" },
    { $sort: { totalRevenue: -1 } },
    { $limit: 3 },
    {
      $project: {
        categoryId: "$_id",
        name: "$categoryDetails.name",
        totalQuantity: 1,
        totalRevenue: 1,
        _id: 0
      }
    }
  ]);

  const lowProducts = await Product.find({
    $expr: { $lte: ["$stockQuantity", "$alertQuantity"] }
  }).select("_id name stockQuantity alertQuantity");

  const bestDayAgg = await Bill.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        totalRevenue: { $sum: "$finalAmount" },
        numberOfOrders: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 1 }
  ]);

  const bestDay = bestDayAgg[0]
    ? {
        date: new Date(bestDayAgg[0]._id.year, bestDayAgg[0]._id.month - 1, bestDayAgg[0]._id.day),
        totalRevenue: bestDayAgg[0].totalRevenue,
        numberOfOrders: bestDayAgg[0].numberOfOrders
      }
    : null;

  const summary = await SalesSummary.findOneAndUpdate(
    { month, year },
    {
      totalProductsSold,
      totalRevenue,
      numberOfOrders,
      averageOrderValue,
      bestDay,
      topProducts,
      topCategories,
      lowProducts,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  res.status(200).json(new apiResponse(200, summary, "Sales summary updated successfully"));
});

// @desc    Get sales summary by month/year
// @route   GET /api/v2/sales-summary?month=6&year=2025
export const getSalesSummary = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);

  if (isNaN(month) || isNaN(year)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid month or year"));
  }

  const summary = await SalesSummary.findOne({ month, year });

  if (!summary) {
    return res.status(404).json(new apiResponse(404, null, "No summary found"));
  }

  res.status(200).json(new apiResponse(200, summary, "Sales summary fetched"));
});


