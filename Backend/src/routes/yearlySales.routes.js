import express from "express";
import {
  updateYearlySalesSummary,
  getYearlySalesSummary
} from "../controllers/yearlySales.controller.js";

const router = express.Router();

router.get("/get", getYearlySalesSummary);
router.post("/update", updateYearlySalesSummary);

export default router;
