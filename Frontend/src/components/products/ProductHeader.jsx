import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';

export const ProductHeader = ({ totalProducts, lowStock }) => {
  return (
    <>
      {/* Header */}
      <div className="bg-black text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-10 p-3 rounded-xl">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Product Management</h1>
                <p className="text-gray-300 mt-1">Manage your inventory with ease</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-gray-300 text-sm">Total Products</div>
            </div>
          </div>
        </div>
      </div>
      <br />

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="max-w-7xl mx-35 px-6 py-8 space-y-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl  shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 p-2 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-800">Low Stock Alert</h2>
              <p className="text-red-600 text-sm">{lowStock.length} products need restocking</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div>
                  <span className="font-semibold text-gray-900 block">{item.name}</span>
                  <span className="text-gray-500 text-sm">{item.sku}</span>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold text-lg">{item.stockQuantity}</span>
                  <div className="text-red-500 text-xs">units left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};