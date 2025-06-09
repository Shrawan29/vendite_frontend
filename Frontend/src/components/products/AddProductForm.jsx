import React, { useState } from "react";
import { Plus } from "lucide-react";

export const AddProductForm = ({
  form,
  setForm,
  onSubmit,
  onCancel,
  isVisible,
  categories = [], // array of category objects or strings
}) => {
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  if (!isVisible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // If adding new category, update the category field in form
    if (addingCategory && newCategory.trim()) {
      setForm({ ...form, category: newCategory.trim() });
      setAddingCategory(false);
    }

    onSubmit();
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      setAddingCategory(true);
      setForm({ ...form, category: "" }); // reset category in form while adding new
      setNewCategory("");
    } else {
      setAddingCategory(false);
      setForm({ ...form, category: val });
      setNewCategory("");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 bg-gray-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-black p-2 rounded-xl">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Add New Product</h2>
            <p className="text-gray-600 text-sm">
              Fill in the details below to create a new product
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Other inputs except category */}
            {Object.entries({
              name: "Product Name*",
              sku: "SKU Code*",
              description: "Description",
              price: "Price (₹)*",
              stockQuantity: "Stock Quantity",
              alertQuantity: "Alert Quantity",
              tax: "Tax (%)",
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <input
                  type={
                    ["price", "tax", "stockQuantity", "alertQuantity"].includes(key)
                      ? "number"
                      : "text"
                  }
                  placeholder={`Enter ${label.toLowerCase().replace("*", "")}`}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
              </div>
            ))}

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              {!addingCategory ? (
                <select
                  value={form.category || ""}
                  onChange={handleCategoryChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat} value={cat.name || cat}>
                      {cat.name || cat}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Category</option>
                </select>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter new category"
                    value={newCategory}
                    autoFocus
                    onChange={(e) => setNewCategory(e.target.value)}
                    onBlur={() => {
                      if (newCategory.trim()) {
                        setForm({ ...form, category: newCategory.trim() });
                        setAddingCategory(false);
                      }
                    }}
                    className="flex-grow border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategory("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 rounded-xl px-4 py-3 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
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
