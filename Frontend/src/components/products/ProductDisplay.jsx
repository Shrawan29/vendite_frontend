import React from 'react';
import { Package, Eye, X } from 'lucide-react';

export const ProductDisplay = ({ 
  products, 
  onProductClick, 
  onAddProduct, 
  hasFilters,
  selectedProduct,
  showProductDetails,
  setShowProductDetails,
  toastMessage,
  toastType
}) => {
  const ProductCard = ({ product }) => (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group hover:-translate-y-0.5"
    >
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-base text-black truncate flex-1 mr-2" title={product.name}>
              {product.name}
            </h3>
            <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </div>
          <p className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md inline-block">
            SKU: {product.sku}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-600">Price:</span>
            <span className="font-bold text-lg text-black">₹{product.price?.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-600">Stock:</span>
            <div className="text-right">
              <span
                className={`font-semibold text-base ${
                  product.stockQuantity <= (product.alertQuantity || 10)
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {product.stockQuantity}
              </span>
              <div className="text-xs text-gray-500">units</div>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-gray-600">Category:</span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {product.category?.name || product.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-xl shadow-2xl text-white z-50 transition-all duration-500 transform ${
            toastType === "error"
              ? "bg-red-600"
              : toastType === "success"
              ? "bg-green-600"
              : "bg-blue-600"
          } animate-pulse`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Add your first product to get started"}
          </p>
          {!hasFilters && (
            <button
              onClick={onAddProduct}
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
            >
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {showProductDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-5 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-black p-2 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">Product Details</h2>
                    <p className="text-gray-600 text-sm">{selectedProduct.sku}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProductDetails(false)}
                  className="text-gray-500 hover:text-black transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-2">{selectedProduct.name}</h3>
                <p className="text-gray-600">{selectedProduct.description || "No description available"}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Price</div>
                    <div className="text-2xl font-bold text-black">₹{selectedProduct.price?.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Stock Quantity</div>
                    <div className={`text-2xl font-bold ${selectedProduct.stockQuantity <= (selectedProduct.alertQuantity || 10)
                        ? "text-red-600" : "text-green-600"
                      }`}>
                      {selectedProduct.stockQuantity} units
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="text-lg font-semibold text-black">{selectedProduct.category?.name || selectedProduct.category}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Tax Rate</div>
                    <div className="text-lg font-semibold text-black">{selectedProduct.tax || 0}%</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="text-sm text-yellow-800 mb-1">Alert Threshold</div>
                <div className="text-lg font-semibold text-yellow-900">
                  {selectedProduct.alertQuantity || 10} units
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  You'll be notified when stock falls below this level
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};