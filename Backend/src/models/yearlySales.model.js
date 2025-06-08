import mongoose, { Schema } from "mongoose";

const yearlySalesSummarySchema = new Schema({
  year: { type: Number, required: true, unique: true },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalProductsSold: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
  months: [
    {
      month: Number,
      revenue: Number,
      orders: Number,
      products: Number,
      avgOrderValue: Number
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

yearlySalesSummarySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const YearlySalesSummary = mongoose.model("YearlySalesSummary", yearlySalesSummarySchema);
