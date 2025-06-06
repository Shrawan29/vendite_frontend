import { Bill } from "../models/bill.model.js";
import { ProductPerformance } from "../models/productAnalytics.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import mongoose from "mongoose";

const getMonthYear = (date = new Date()) => ({
    month: date.getMonth() + 1,
    year: date.getFullYear(),
});

const getMonthDateRange = (month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    return { startDate, endDate };
};

const validateMonthYear = (month, year) => {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
        throw new apiError(400, "Month and year must be valid numbers");
    }

    if (monthNum < 1 || monthNum > 12) {
        throw new apiError(400, "Month must be between 1 and 12");
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear() + 10) {
        throw new apiError(400, "Year must be a valid year");
    }

    return { month: monthNum, year: yearNum };
};

const updateProductPerformance = asyncHandler(async (req, res) => {
    const { month: reqMonth, year: reqYear } = req.body;
    let month, year;

    if (reqMonth && reqYear) {
        ({ month, year } = validateMonthYear(reqMonth, reqYear));
    } else {
        ({ month, year } = getMonthYear());
    }

    const { startDate, endDate } = getMonthDateRange(month, year);

    try {
        const billsAggregation = await Bill.aggregate([
            { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
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
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: {
                        productId: "$productDetails._id",
                        categoryId: "$categoryDetails._id"
                    },
                    revenue: { $sum: "$products.totalPrice" },
                    units: { $sum: "$products.quantity" },
                    productName: { $first: "$productDetails.name" },
                    categoryName: { $first: "$categoryDetails.name" },
                    billIds: { $addToSet: "$_id" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$revenue" },
                    totalUnits: { $sum: "$units" },
                    totalOrders: { $sum: { $size: "$billIds" } },
                    productStats: {
                        $push: {
                            productId: "$_id.productId",
                            categoryId: "$_id.categoryId",
                            revenue: "$revenue",
                            units: "$units",
                            productName: "$productName",
                            categoryName: "$categoryName"
                        }
                    }
                }
            }
        ]);

        if (!billsAggregation.length || !billsAggregation[0].productStats.length) {
            throw new apiError(404, "No sales data found for the specified month");
        }

        const { totalRevenue, totalUnits, totalOrders, productStats } = billsAggregation[0];
        const productStatsMap = new Map();
        const categoryStatsMap = new Map();

        productStats.forEach(item => {
            const productId = item.productId.toString();
            const categoryId = item.categoryId.toString();

            if (!productStatsMap.has(productId)) {
                productStatsMap.set(productId, {
                    revenue: 0,
                    units: 0,
                    name: item.productName
                });
            }
            const productStat = productStatsMap.get(productId);
            productStat.revenue += item.revenue;
            productStat.units += item.units;

            if (!categoryStatsMap.has(categoryId)) {
                categoryStatsMap.set(categoryId, {
                    revenue: 0,
                    name: item.categoryName
                });
            }
            categoryStatsMap.get(categoryId).revenue += item.revenue;
        });

        let bestSellingProduct = null;
        let maxUnits = 0;
        const topProducts = [];

        for (const [productId, stats] of productStatsMap.entries()) {
            if (stats.units > maxUnits) {
                bestSellingProduct = new mongoose.Types.ObjectId(productId);
                maxUnits = stats.units;
            }
            topProducts.push({
                product: new mongoose.Types.ObjectId(productId),
                unitsSold: stats.units,
                revenue: stats.revenue
            });
        }

        topProducts.sort((a, b) => b.unitsSold - a.unitsSold);
        const top5Products = topProducts.slice(0, 5);

        let bestSellingCategory = null;
        let maxCategoryRevenue = 0;

        for (const [categoryId, stats] of categoryStatsMap.entries()) {
            if (stats.revenue > maxCategoryRevenue) {
                bestSellingCategory = new mongoose.Types.ObjectId(categoryId);
                maxCategoryRevenue = stats.revenue;
            }
        }

        const avgOrderValue = totalRevenue / (totalOrders || 1);

        const performanceData = {
            month,
            year,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalUnitsSold: totalUnits,
            bestSellingProduct,
            bestSellingCategory,
            topProducts: top5Products,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            totalOrders,
            updatedAt: new Date()
        };

        const updatedPerformance = await ProductPerformance.findOneAndUpdate(
            { month, year },
            { $set: performanceData },
            { upsert: true, new: true }
        );

        res.status(200).json(
            new apiResponse(200, "Performance data updated successfully", {
                performance: updatedPerformance,
                summary: {
                    totalRevenue,
                    totalUnitsSold: totalUnits,
                    avgOrderValue,
                    totalOrders,
                    productsAnalyzed: productStatsMap.size,
                    categoriesAnalyzed: categoryStatsMap.size
                }
            })
        );

    } catch (error) {
        console.error("Error updating product performance:", error);
        throw new apiError(500, "Failed to update performance data", error.message);
    }
});

const getMonthlyPerformance = asyncHandler(async (req, res) => {
    // Accept month and year from query or body
    const reqMonth = req.query.month || req.body.month;
    const reqYear = req.query.year || req.body.year;

    console.log("Request month:", reqMonth, "Request year:", reqYear);

    if (!reqMonth || !reqYear) {
        throw new apiError(400, "Month and year are required");
    }

    const { month, year } = validateMonthYear(reqMonth, reqYear);

    try {
        const data = await ProductPerformance.findOne({ month, year })
            .populate("bestSellingProduct", "name price category")
            .populate("bestSellingCategory", "name description")
            .populate("topProducts.product", "name price category")
            .lean();

        if (!data) {
            throw new apiError(404, "No performance data found for the selected month and year");
        }

        const responseData = {
            ...data,
            monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
            performanceScore: calculatePerformanceScore(data),
            trends: await calculateTrends(month, year)
        };

        res.status(200).json(
            new apiResponse(200, `Performance data for ${responseData.monthName} ${year}`, responseData)
        );

    } catch (error) {
        console.error("Error fetching monthly performance:", error);
        throw new apiError(500, "Failed to fetch performance data", error.message);
    }
});

const getPerformanceComparison = asyncHandler(async (req, res) => {
    const { startMonth, startYear, endMonth, endYear } = req.query;

    if (!startMonth || !startYear || !endMonth || !endYear) {
        throw new apiError(400, "Start and end month/year are required");
    }

    const start = validateMonthYear(startMonth, startYear);
    const end = validateMonthYear(endMonth, endYear);

    try {
        const performances = await ProductPerformance.find({
            $or: [
                { month: start.month, year: start.year },
                { month: end.month, year: end.year }
            ]
        })
            .populate("bestSellingProduct", "name")
            .populate("bestSellingCategory", "name")
            .sort({ year: 1, month: 1 })
            .lean();

        if (performances.length !== 2) {
            throw new apiError(404, "Performance data not found for one or both periods");
        }

        const [startPeriod, endPeriod] = performances;
        const revenueChange = startPeriod.totalRevenue === 0 ? null :
            ((endPeriod.totalRevenue - startPeriod.totalRevenue) / startPeriod.totalRevenue * 100).toFixed(2);
        const unitsChange = startPeriod.totalUnitsSold === 0 ? null :
            ((endPeriod.totalUnitsSold - startPeriod.totalUnitsSold) / startPeriod.totalUnitsSold * 100).toFixed(2);
        const avgOrderValueChange = startPeriod.avgOrderValue && endPeriod.avgOrderValue && startPeriod.avgOrderValue !== 0 ? 
            ((endPeriod.avgOrderValue - startPeriod.avgOrderValue) / startPeriod.avgOrderValue * 100).toFixed(2) : null;

        const comparison = {
            startPeriod,
            endPeriod,
            changes: {
                revenueChange,
                unitsChange,
                avgOrderValueChange
            }
        };

        res.status(200).json(
            new apiResponse(200, "Performance comparison retrieved successfully", comparison)
        );

    } catch (error) {
        console.error("Error fetching performance comparison:", error);
        throw new apiError(500, "Failed to fetch performance comparison", error.message);
    }
});

const calculatePerformanceScore = (data) => {
    if (!data.totalRevenue || !data.totalUnitsSold) return 0;
    const revenueScore = Math.min(data.totalRevenue / 10000, 1) * 50;
    const unitsScore = Math.min(data.totalUnitsSold / 1000, 1) * 30;
    const diversityScore = Math.min(data.topProducts?.length || 0, 5) * 4;
    return Math.round(revenueScore + unitsScore + diversityScore);
};

const calculateTrends = async (month, year) => {
    try {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        const prevData = await ProductPerformance.findOne({
            month: prevMonth,
            year: prevYear
        }).lean();

        const currentData = await ProductPerformance.findOne({
            month,
            year
        }).lean();

        if (!prevData || !currentData) return null;

        return {
            revenueGrowth: prevData.totalRevenue === 0 ? null :
                ((currentData.totalRevenue - prevData.totalRevenue) / prevData.totalRevenue * 100).toFixed(2),
            unitsGrowth: prevData.totalUnitsSold === 0 ? null :
                ((currentData.totalUnitsSold - prevData.totalUnitsSold) / prevData.totalUnitsSold * 100).toFixed(2)
        };
    } catch (error) {
        console.error("Error calculating trends:", error);
        return null;
    }
};

export {
    updateProductPerformance,
    getMonthlyPerformance,
    getPerformanceComparison
};
