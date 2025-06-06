import mongoose, { Schema } from "mongoose";

const productPerformanceSchema = new Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },

    // Aggregated data
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalUnitsSold: {
      type: Number,
      default: 0
    },
    averageSellingPrice: {
      type: Number,
      default: 0
    },

    // Best seller info
    bestSellingProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    bestSellingCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    // Optional: List of top 5 products (for UI display)
    topProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        unitsSold: Number,
        revenue: Number
      }
    ]
  },
  { timestamps: true }
);

// Calculate average price before saving
productPerformanceSchema.pre("save", function (next) {
  if (this.totalUnitsSold > 0) {
    this.averageSellingPrice = this.totalRevenue / this.totalUnitsSold;
  } else {
    this.averageSellingPrice = 0;
  }
  next();
});

export const ProductPerformance = mongoose.model(
  "ProductPerformance",
  productPerformanceSchema
);
