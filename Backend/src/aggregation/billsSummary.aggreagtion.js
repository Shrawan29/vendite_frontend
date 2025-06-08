import cron from "node-cron";
import { Bill } from "../models/bill.model.js";
import { SalesSummary } from "../models/salesSummary.model.js";
import { Product } from "../models/product.model.js";

// Helper: build date filter for a month
const getDateFilter = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { createdAt: { $gte: start, $lt: end } };
};

const updateSalesSummaryForMonth = async (month, year) => {
  const match = getDateFilter(month, year);

  // 1. Revenue and Orders
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
  const averageOrderValue = numberOfOrders ? totalRevenue / numberOfOrders : 0;

  // 2. Total products sold
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

  // 3. Best Day (highest revenue)
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
        date: new Date(
          bestDayAgg[0]._id.year,
          bestDayAgg[0]._id.month - 1,
          bestDayAgg[0]._id.day
        ),
        totalRevenue: bestDayAgg[0].totalRevenue,
        numberOfOrders: bestDayAgg[0].numberOfOrders
      }
    : null;

  // 4. Top 5 products
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

  // 5. Low stock alerts
  const lowProducts = await Product.find({
    $expr: { $lte: ["$stockQuantity", "$alertQuantity"] }
  })
    .select("_id name stockQuantity alertQuantity")
    .lean();

  // 6. Top 3 categories
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
        totalRevenue: { $sum: "$products.totalPrice" },
        totalQuantity: { $sum: "$products.quantity" }
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
        totalRevenue: 1,
        totalQuantity: 1,
        _id: 0
      }
    }
  ]);

  // 7. Save or Update Sales Summary
  await SalesSummary.findOneAndUpdate(
    { month, year },
    {
      totalProductsSold,
      totalRevenue,
      numberOfOrders,
      averageOrderValue,
      bestDay,
      topProducts,
      lowProducts,
      topCategories,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Auto-updated sales summary for ${month}/${year}`);
};

const autoUpdateAllMonths = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  for (let month = 1; month <= currentMonth; month++) {
    try {
      await updateSalesSummaryForMonth(month, year);
    } catch (err) {
      console.error(`❌ Failed to update summary for ${month}/${year}:`, err.message);
    }
  }
};

// Runs every day at 12:05 AM, updates all months of the current year
cron.schedule("5 0 * * *", autoUpdateAllMonths);

export default autoUpdateAllMonths;
