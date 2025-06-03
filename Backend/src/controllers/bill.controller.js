// bill.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Bill } from "../models/bill.model.js";
import { Product } from "../models/product.model.js";

// CREATE BILL
const createBill = asyncHandler(async (req, res) => {
  const { customer, products, discount = 0, paymentMethod } = req.body;

  if (!customer?.name || !customer?.phone || !Array.isArray(products) || products.length === 0 || !paymentMethod) {
    throw new apiError(400, "Required fields missing: customer info and products");
  }

  const validPaymentMethods = ['Cash', 'Online'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new apiError(400, "Invalid payment method. Allowed: Cash, Online");
  }

  const processedProducts = await Promise.all(products.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product) throw new apiError(404, `Product with ID ${item.product} not found`);

    const totalPrice = item.quantity * product.price;
    const productTax = (product.tax / 100) * totalPrice;
    return {
      product: item.product,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      tax: product.tax,
      totalPrice,
    };
  }));

  const totalAmount = processedProducts.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalTax = processedProducts.reduce((acc, item) => acc + ((item.tax / 100) * item.totalPrice), 0);
  const discountAmount = (discount / 100) * totalAmount;
  const finalAmount = totalAmount - discountAmount + totalTax;

  const lastBill = await Bill.findOne().sort({ createdAt: -1 });
  let nextInvoiceNumber = "INV-1";
  if (lastBill?.invoiceNumber) {
    const lastNumber = parseInt(lastBill.invoiceNumber.split('-')[1] || "0");
    nextInvoiceNumber = `INV-${lastNumber + 1}`;
  }

  const newBill = await Bill.create({
    invoiceNumber: nextInvoiceNumber,
    customer,
    products: processedProducts,
    totalAmount,
    discount,
    cgst: totalTax / 2,
    sgst: totalTax / 2,
    totalTax,
    finalAmount,
    paymentMethod
  });

  if (!newBill) throw new apiError(500, "Failed to create bill");

  return res.status(201).json(new apiResponse(201, "Bill created successfully", newBill));
});

// GET ALL BILLS
const getAllBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find().sort({ createdAt: -1 });
  return res.status(200).json(new apiResponse(200, "Bills fetched", bills));
});

// GET BILL BY ID
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) throw new apiError(404, "Bill not found");
  return res.status(200).json(new apiResponse(200, "Bill fetched", bill));
});

// DELETE BILL
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);
  if (!bill) throw new apiError(404, "Bill not found");
  return res.status(200).json(new apiResponse(200, "Bill deleted", bill));
});

// MONTHLY SALES SUMMARY
const getMonthlySales = asyncHandler(async (req, res) => {
  const summary = await Bill.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$finalAmount" },
        totalTax: { $sum: "$totalTax" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  return res.status(200).json(new apiResponse(200, "Monthly sales summary", summary));
});
const updateBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customer, products, discount = 0, paymentMethod } = req.body;

  const bill = await Bill.findById(id);
  if (!bill) {
    throw new apiError(404, "Bill not found");
  }

  // Validate fields
  if (!customer?.name || !customer?.phone || !Array.isArray(products) || products.length === 0 || !paymentMethod) {
    throw new apiError(400, "Required fields missing: customer info, products, or payment method");
  }

  // Validate and process products
  const processedProducts = await Promise.all(
    products.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new apiError(404, `Product with ID ${item.product} not found`);
      }
      const totalPrice = item.quantity * product.price;
      const productTax = (product.tax / 100) * totalPrice;

      return {
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
        tax: productTax
      };
    })
  );

  // Calculations
  const totalAmount = processedProducts.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalTax = processedProducts.reduce((acc, item) => acc + item.tax, 0);
  const discountAmount = (discount / 100) * totalAmount;
  const finalAmount = totalAmount - discountAmount + totalTax;

  // Update bill
  bill.customer = customer;
  bill.products = processedProducts;
  bill.totalAmount = totalAmount;
  bill.totalTax = totalTax;
  bill.discount = discount;
  bill.cgst = totalTax / 2;
  bill.sgst = totalTax / 2;
  bill.finalAmount = finalAmount;
  bill.paymentMethod = paymentMethod;

  const updatedBill = await bill.save();

  return res.status(200).json(new apiResponse(200, "Bill updated successfully", updatedBill));
});


export {
  createBill,
  getAllBills,
  getBillById,
  deleteBill,
  getMonthlySales,
  updateBill
};
