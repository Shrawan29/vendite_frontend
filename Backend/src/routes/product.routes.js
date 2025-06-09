import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  checkLowStock,
  updateStock
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();



router.use(verifyJWT); 

router.post("/create-product", createProduct);

router.get("/get-all-products", getAllProducts);

router.get("/get-product/:id", getProductById);

router.put("/update-product/:id", updateProduct);

router.delete("/delete-product/:id", deleteProduct);

router.get("/low-stock-products", checkLowStock);

router.patch("/update-stock/:id", updateStock);

export default router;
