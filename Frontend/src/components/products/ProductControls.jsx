import React from 'react';
import { Search, ShoppingCart, Plus, X } from 'lucide-react';

export const ProductControls = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  showAddForm,
  setShowAddForm,
  filteredProducts,
  totalProducts
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white min-w-40"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white min-w-32"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showAddForm ? "Cancel" : "Add Product"}</span>
        </button>
      </div>

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredProducts.length} of {totalProducts} products</span>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Total Value: ₹{filteredProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
