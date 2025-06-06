import React from 'react';
import { Plus } from 'lucide-react';

export const AddProductForm = ({ form, setForm, onSubmit, onCancel, isVisible }) => {
  if (!isVisible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl">
      <div className="border-b border-gray-200 px-6 py-5 bg-gray-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-black p-2 rounded-xl">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Add New Product</h2>
            <p className="text-gray-600 text-sm">Fill in the details below to create a new product</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries({
              name: "Product Name*",
              sku: "SKU Code*",
              description: "Description",
              price: "Price (₹)*",
              category: "Category",
              stockQuantity: "Stock Quantity",
              alertQuantity: "Alert Quantity",
              tax: "Tax (%)",
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <input
                  type={
                    key === "price" ||
                    key === "tax" ||
                    key === "stockQuantity" ||
                    key === "alertQuantity"
                      ? "number"
                      : "text"
                  }
                  placeholder={`Enter ${label.toLowerCase().replace('*', '')}`}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>
            ))}
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create Product</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};