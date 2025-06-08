import { Bill } from "../models/bill.model.js";
import { YearlySalesSummary } from "../models/yearlySales.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper: build filter for entire year
const getYearDateFilter = (year) => {
  const start = new Date(year, 0, 1); // Jan 1st
  const end = new Date(year + 1, 0, 1); // Jan 1st next year
  return { createdAt: { $gte: start, $lt: end } };
};

// @route POST /api/v2/yearly-sales-summary/update?year=2025
export const updateYearlySalesSummary = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year);
  if (isNaN(year)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid year"));
  }

  const match = getYearDateFilter(year);

  const bills = await Bill.find(match).lean();

  let totalRevenue = 0;
  let totalOrders = 0;
  let totalProductsSold = 0;
  const monthMap = new Map();

  bills.forEach(bill => {
    const month = new Date(bill.createdAt).getMonth() + 1;
    const finalAmount = bill.finalAmount || 0;
    const products = bill.products || [];

    totalRevenue += finalAmount;
    totalOrders += 1;

    let productsCount = 0;
    products.forEach(p => {
      productsCount += p.quantity || 0;
    });

    totalProductsSold += productsCount;

    if (!monthMap.has(month)) {
      monthMap.set(month, {
        revenue: 0,
        orders: 0,
        products: 0
      });
    }

    const entry = monthMap.get(month);
    entry.revenue += finalAmount;
    entry.orders += 1;
    entry.products += productsCount;
  });

  // Monthly breakdown for all 12 months
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const entry = monthMap.get(m) || { revenue: 0, orders: 0, products: 0 };
    const avgOrderValue = entry.orders ? entry.revenue / entry.orders : 0;

    months.push({
      month: m,
      revenue: entry.revenue,
      orders: entry.orders,
      products: entry.products,
      avgOrderValue
    });
  }

  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const yearly = await YearlySalesSummary.findOneAndUpdate(
    { year },
    {
      year,
      totalRevenue,
      totalOrders,
      totalProductsSold,
      avgOrderValue,
      months
    },
    { upsert: true, new: true }
  );

  res.status(200).json(new apiResponse(200, yearly, "Yearly sales summary updated from bills"));
});

// @route GET /api/v2/yearly-sales-summary?year=2025
export const getYearlySalesSummary = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year);
  if (isNaN(year)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid year"));
  }
  const yearly = await YearlySalesSummary.findOne({ year });
  if (!yearly) {
    return res.status(404).json(new apiResponse(404, null, "No yearly summary found"));
  }
  res.status(200).json(new apiResponse(200, yearly, "Yearly sales summary fetched"));
});
