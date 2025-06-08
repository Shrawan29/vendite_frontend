import express from "express";
import {
  updateSalesSummary,
  getSalesSummary
} from "../controllers/salesSummary.controller.js";

const router = express.Router();

router.get("/get", getSalesSummary);
router.post("/update", updateSalesSummary);

export default router;
