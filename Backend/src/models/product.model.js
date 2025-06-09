import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      trim: true,
      index: true,
    },
    alertQuantity: {
      type: Number,
      required: true,
      trim: true,
      index: true,
    },
    tax: {
      type: Number,
      default: 0, // Default tax percentage (can be set as needed)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Utility method to check quantity alert
productSchema.methods.quantityAlert = async function (alertQuantity) {
  return this.stockQuantity <= alertQuantity;
};

export const Product = mongoose.model("Product", productSchema);
