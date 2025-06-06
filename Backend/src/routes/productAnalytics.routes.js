import express from "express";
import { 
  updateProductPerformance,
  getMonthlyPerformance,
  getPerformanceComparison 
} from "../controllers/productAnalytics.controller.js";

const router = express.Router();

// POST /api/performance/update
// Body: { month?: number, year?: number } (optional - defaults to current month)
router.post("/update", updateProductPerformance);

// POST /api/performance/update/:month/:year
// Convenience route to update performance for a specific month/year
router.post("/update/:month/:year", (req, res, next) => {
  req.body.month = parseInt(req.params.month, 10);
  req.body.year = parseInt(req.params.year, 10);
  updateProductPerformance(req, res, next);
});

// GET /api/performance/monthly?month=5&year=2024
router.get("/monthly", getMonthlyPerformance);

// GET /api/performance/:month/:year
// Convenience route to get monthly performance for specific month/year
router.get("/:month/:year", (req, res, next) => {
  req.query.month = req.params.month;
  req.query.year = req.params.year;
  getMonthlyPerformance(req, res, next);
});

// GET /api/performance/compare?startMonth=4&startYear=2024&endMonth=5&endYear=2024
router.get("/compare", getPerformanceComparison);

// GET /api/performance/current
// Convenience route to get current month performance
router.get("/current", (req, res, next) => {
  const now = new Date();
  req.query.month = now.getMonth() + 1;
  req.query.year = now.getFullYear();
  getMonthlyPerformance(req, res, next);
});

// GET /api/performance/previous
// Convenience route to get previous month performance
router.get("/previous", (req, res, next) => {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  req.query.month = prevMonth;
  req.query.year = prevYear;
  getMonthlyPerformance(req, res, next);
});

// GET /api/performance/ytd?year=2024
// Placeholder for year-to-date performance summary (not implemented yet)
router.get("/ytd", async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    res.status(501).json({
      success: false,
      message: "Year-to-date performance endpoint not yet implemented",
      data: null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
