import mongoose, { Schema } from "mongoose";

const salesSummarySchema = new Schema({
  totalProductsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  numberOfOrders: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },

  bestDay: {
    date: Date,
    totalRevenue: Number,
    numberOfOrders: Number
  },

  topProducts: [
    {
      productId: { type: Schema.Types.Mixed }, // can be ObjectId or Number (custom ID in example)
      name: String,
      quantitySold: Number,
      revenue: Number
    }
  ],

  topCategories: [
    {
      categoryId: { type: Schema.Types.Mixed }, // same as above
      name: String,
      totalQuantity: Number,
      totalRevenue: Number
    }
  ],

  lowProducts: [
    {
      _id: Schema.Types.Mixed,
      name: String,
      stockQuantity: Number,
      alertQuantity: Number
    }
  ],

  month: Number,
  year: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

salesSummarySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const SalesSummary = mongoose.model("SalesSummary", salesSummarySchema);
