import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Eye, Plus, Trash2, User, Phone, Mail, ShoppingCart, Calculator, Receipt, CreditCard } from 'lucide-react';

export default function BillGenerator() {
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdBill, setCreatedBill] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({ product: '', quantity: 1 });
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setFetchingProducts(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/get-all-products`);
      
      const data = await response.json();
      if (Array.isArray(data.message)) {
        setAvailableProducts(data.message);
      } else {
        setAvailableProducts([]);
        setError('Products data is not an array.');
      }
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.product || !currentProduct.quantity) {
      setError("Please select a product and quantity.");
      return;
    }

    const productObj = availableProducts.find(p => p._id === currentProduct.product);
    if (!productObj) {
      setError("Invalid product selected.");
      return;
    }

    const newItem = {
      _id: productObj._id,
      name: productObj.name,
      unitPrice: productObj.price,
      quantity: parseInt(currentProduct.quantity),
      tax: productObj.tax || 0,
    };

    setSelectedProducts(prev => [...prev, newItem]);
    setCurrentProduct({ product: '', quantity: 1 });
    setError('');
  };

  const handleRemoveProduct = (index) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const calculateTotals = () => {
    const productDetails = selectedProducts.map(item => {
      const totalPrice = item.unitPrice * item.quantity;
      const taxAmount = (item.tax / 100) * totalPrice;
      return { ...item, totalPrice, taxAmount };
    });

    const subtotal = productDetails.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalTax = productDetails.reduce((sum, item) => sum + item.taxAmount, 0);
    const discountAmount = (discount / 100) * subtotal;
    const finalAmount = subtotal - discountAmount + totalTax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: totalTax.toFixed(2),
      discount: discountAmount.toFixed(2),
      total: finalAmount.toFixed(2),
      productDetails
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setCreatedBill(null);

    if (!customer.name || !customer.phone || selectedProducts.length === 0) {
      setError('Customer name, phone number, and at least one product are required.');
      return;
    }

    try {
      setLoading(true);
      const calculatedTotals = calculateTotals();
      
      const billData = {
        customer,
        products: selectedProducts.map(p => ({
          product: p._id,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          tax: p.tax,
          totalPrice: p.unitPrice * p.quantity + (p.tax / 100) * p.unitPrice * p.quantity,
        })),
        discount: parseFloat(discount),
        paymentMethod
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bills/create-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });
      
      const result = await response.json();

      setSuccess('Bill created successfully!');
      
      const billWithCalculations = {
        _id: result.data?._id || `BILL_${Date.now()}`,
        customer: customer,
        products: calculatedTotals.productDetails,
        discount: parseFloat(discount),
        paymentMethod,
        subtotal: parseFloat(calculatedTotals.subtotal),
        tax: parseFloat(calculatedTotals.tax),
        total: parseFloat(calculatedTotals.total),
        createdAt: new Date().toISOString()
      };
      
      setCreatedBill(billWithCalculations);
      handleReset();
    } catch (err) {
      setError('Failed to create bill: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomer({ name: '', phone: '', email: '' });
    setSelectedProducts([]);
    setDiscount(0);
    setPaymentMethod('Cash');
    setError('');
    setSuccess('');
    setCurrentProduct({ product: '', quantity: 1 });
  };

  const generatePDFInvoice = async (bill) => {
    if (!bill) {
      setError('No bill data available for PDF generation.');
      return;
    }

    try {
      const invoiceText = generateInvoiceText(bill);
      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${bill._id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess('Invoice downloaded successfully as text file!');
    } catch (err) {
      setError('Failed to generate invoice: ' + err.message);
    }
  };

  const generateInvoiceText = (bill) => {
    const date = new Date(bill.createdAt || Date.now()).toLocaleDateString();
    
    let text = `
INVOICE
===============================================

Invoice ID: ${bill._id}
Date: ${date}
Payment Method: ${bill.paymentMethod}

BILL TO:
${bill.customer.name}
${bill.customer.phone}
${bill.customer.email || ''}

ITEMS:
===============================================
`;

    bill.products.forEach((item, index) => {
      text += `
${index + 1}. ${item.name}
   Quantity: ${item.quantity}
   Unit Price: ₹${item.unitPrice.toFixed(2)}
   Tax: ${item.tax}%
   Tax Amount: ₹${item.taxAmount.toFixed(2)}
   Total: ₹${item.totalPrice.toFixed(2)}
`;
    });

    const discountAmount = (bill.discount / 100) * bill.subtotal;
    
    text += `
===============================================
SUMMARY:
Subtotal: ₹${bill.subtotal.toFixed(2)}
Discount (${bill.discount}%): -₹${discountAmount.toFixed(2)}
Tax: ₹${bill.tax.toFixed(2)}
TOTAL: ₹${bill.total.toFixed(2)}
===============================================
`;

    return text;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 18px; }
              .mb-8 { margin-bottom: 32px; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
              .gap-8 { gap: 32px; }
              .border-t { border-top: 1px solid #ddd; padding-top: 8px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const InvoicePreview = ({ bill }) => {
    if (!bill) return null;

    const discountAmount = (bill.discount / 100) * bill.subtotal;
    const date = new Date(bill.createdAt || Date.now()).toLocaleDateString();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-blue-600" size={24} />
              Invoice Preview
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={() => generatePDFInvoice(bill)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-8" id="invoice-content">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <User size={20} />
                  Bill To:
                </h3>
                <p className="text-gray-700 font-medium">{bill.customer.name}</p>
                <p className="text-gray-600">{bill.customer.phone}</p>
                {bill.customer.email && <p className="text-gray-600">{bill.customer.email}</p>}
              </div>
              <div className="text-right">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="mb-2"><span className="font-semibold text-gray-700">Invoice ID:</span> <span className="text-blue-600 font-mono">{bill._id}</span></p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Date:</span> {date}</p>
                  <p><span className="font-semibold text-gray-700">Payment Method:</span> <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{bill.paymentMethod}</span></p>
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-lg shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Unit Price (₹)</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Tax (%)</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Tax Amount (₹)</th>
                    <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.products.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-200 px-4 py-3">{item.name}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right">{item.tax}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right font-mono">{item.taxAmount.toFixed(2)}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right font-mono font-semibold">{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-80 bg-gray-50 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-mono">₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount ({bill.discount}%):</span>
                    <span className="text-red-600 font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-mono">₹{bill.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-gray-300">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-blue-600 font-mono">₹{bill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
              <Receipt className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bill Generator
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Create professional invoices with ease</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {success}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" size={20} />
                Add Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                  <select
                    value={currentProduct.product}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, product: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose a product...</option>
                    {availableProducts.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.name} (₹{prod.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={currentProduct.quantity}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Qty"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Selected Products</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-lg">Product</th>
                        <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">Qty</th>
                        <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                        <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                        <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">Tax</th>
                        <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 rounded-tr-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((item, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="border border-gray-200 px-4 py-3 font-medium">{item.name}</td>
                          <td className="border border-gray-200 px-4 py-3 text-center">{item.quantity}</td>
                          <td className="border border-gray-200 px-4 py-3 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="border border-gray-200 px-4 py-3 text-right font-mono font-semibold">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                          <td className="border border-gray-200 px-4 py-3 text-center">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">{item.tax}%</span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment & Discount */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} />
                Payment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Receipt size={20} />
                    Generate Bill
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                <X size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator className="text-blue-600" size={20} />
                Bill Summary
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-mono font-semibold text-lg">₹{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-mono text-red-600">-₹{totals.discount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-mono">₹{totals.tax}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-blue-600 font-mono">₹{totals.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Items: {selectedProducts.length}</p>
                  <p>• Customer: {customer.name || 'Not set'}</p>
                  <p>• Payment: {paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Created Success */}
        {createdBill && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500 p-2 rounded-full">
                <Receipt className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">Bill Created Successfully!</h2>
                <p className="text-green-600">Your invoice is ready for preview and download</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-600">Bill ID: 
                <span className="font-mono text-blue-600 ml-2">{createdBill._id}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Eye size={18} />
                Preview Invoice
              </button>
              <button
                onClick={() => generatePDFInvoice(createdBill)}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Download size={18} />
                Download Invoice
              </button>
            </div>
          </div>
        )}

        {showPreview && <InvoicePreview bill={createdBill} />}
      </div>
    </div>
  );
}