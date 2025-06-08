import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function SalesSummaryDashboard() {
  const [summary, setSummary] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);
  const [updatingYearly, setUpdatingYearly] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("monthly");

  // Fetch monthly summary from backend
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { month, year };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/sales-summary/get`,
        { params }
      );
      setSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      if (err?.response?.status === 404) {
        await updateSummary();
      } else {
        setSummary(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch yearly summary from backend
  const fetchYearlyData = async () => {
    try {
      setLoadingYearly(true);
      setError(null);
      const params = { year: selectedYear };
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/yearly-sales-summary/get`,
        { params }
      );
      setYearlyData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch yearly data");
      setYearlyData(null);
    } finally {
      setLoadingYearly(false);
    }
  };

  // Update monthly summary manually
  const updateSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { month, year };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/sales-summary/update`,
        null,
        { params }
      );
      await fetchSummary();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update summary");
    } finally {
      setLoading(false);
    }
  };

  // Update yearly summary manually
  const updateYearlySummary = async () => {
    try {
      setUpdatingYearly(true);
      setError(null);
      const params = { year: selectedYear };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/yearly-sales-summary/update`,
        null,
        { params }
      );
      await fetchYearlyData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update yearly summary");
    } finally {
      setUpdatingYearly(false);
    }
  };

  useEffect(() => {
    if (activeTab === "monthly") {
      fetchSummary();
    } else {
      fetchYearlyData();
    }
  }, [activeTab, month, year, selectedYear]);

  const handleMonthlySubmit = (e) => {
    e.preventDefault();
    fetchSummary();
  };

  const handleYearlySubmit = (e) => {
    e.preventDefault();
    fetchYearlyData();
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Calculate performance metrics for monthly view
  const getPerformanceMetrics = () => {
    if (!summary) return null;
    const avgRevenuePerProduct = summary.totalRevenue / (summary.totalProductsSold || 1);
    const topProductRevenue = summary.topProducts?.[0]?.revenue || 0;
    const topCategoryRevenue = summary.topCategories?.[0]?.totalRevenue || 0;
    return {
      avgRevenuePerProduct,
      topProductShare: ((topProductRevenue / summary.totalRevenue) * 100).toFixed(1),
      topCategoryShare: ((topCategoryRevenue / summary.totalRevenue) * 100).toFixed(1),
      lowStockCount: summary.lowProducts?.length || 0
    };
  };

  const metrics = getPerformanceMetrics();

  // Yearly totals and chart data
  const yearlyTotals = yearlyData && yearlyData.months
    ? {
        totalRevenue: yearlyData.totalRevenue || 0,
        totalOrders: yearlyData.totalOrders || 0,
        totalProducts: yearlyData.totalProductsSold || 0,
        avgOrderValue: yearlyData.avgOrderValue || 0,
        monthsWithData: yearlyData.months.filter(
          (m) => m.revenue > 0 || m.orders > 0 || m.products > 0
        ).length || 0,
      }
    : {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        avgOrderValue: 0,
        monthsWithData: 0,
      };

  const avgMonthlyRevenue =
    yearlyTotals.monthsWithData > 0
      ? yearlyTotals.totalRevenue / yearlyTotals.monthsWithData
      : 0;

  const chartData = yearlyData?.months
    ? yearlyData.months.map((m) => ({
        month: typeof m.month === "number" ? monthNames[m.month - 1] : m.month,
        revenue: m.revenue,
        orders: m.orders,
        products: m.products,
        avgOrderValue: m.avgOrderValue,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-black rounded-xl p-2">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Sales Dashboard</h1>
                <p className="text-gray-600 text-sm">Business Analytics & Insights</p>
              </div>
            </div>
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "monthly"
                    ? "bg-black text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📅 Monthly View
              </button>
              <button
                onClick={() => { setActiveTab("yearly"); updateYearlySummary(); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "yearly"
                    ? "bg-black text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📈 Yearly View
              </button>
            </div>
          </div>

          {/* Controls */}
          {activeTab === "monthly" ? (
            <div className="flex items-center gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>{name}</option>
                ))}
              </select>
              <input
                type="number"
                min="2000"
                max="2030"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-sm focus:border-black focus:outline-none"
              />
              <button
                onClick={handleMonthlySubmit}
                disabled={loading}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                🔍 Fetch
              </button>
              <button
                onClick={updateSummary}
                disabled={loading}
                className="border border-black text-black px-4 py-2 rounded-lg hover:bg-black hover:text-white disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                🔄 Update
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="2000"
                max="2030"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-sm focus:border-black focus:outline-none"
              />
              <button
                onClick={handleYearlySubmit}
                disabled={loadingYearly}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                🔍 Fetch Year
              </button>
              <button
                onClick={updateYearlySummary}
                disabled={updatingYearly}
                className="border border-black text-black px-4 py-2 rounded-lg hover:bg-black hover:text-white disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                🔄 Update Year
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || loadingYearly || updatingYearly) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600">
              {loading ? "Loading monthly summary..." : 
               loadingYearly ? "Loading yearly data..." : 
               "Updating yearly data..."}
            </p>
          </div>
        )}

        {/* Yearly View */}
        {activeTab === "yearly" && yearlyData && yearlyData.months && yearlyData.months.length > 0 && !loadingYearly && !updatingYearly && (
          <div className="space-y-6">
            {/* Yearly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Total Revenue</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-black">₹{yearlyTotals.totalRevenue.toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">Year {selectedYear}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Total Orders</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-2xl font-bold text-black">{yearlyTotals.totalOrders.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{yearlyTotals.monthsWithData} months data</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Products Sold</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-2xl font-bold text-black">{yearlyTotals.totalProducts.toLocaleString()}</p>
                <p className="text-sm text-gray-500">All categories</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Avg Monthly</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-2xl font-bold text-black">₹{avgMonthlyRevenue.toFixed(0).toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">Revenue/month</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Monthly Revenue Trend</h3>
                <span className="text-2xl">📈</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ stroke: "#e0e0e0" }} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#e0e0e0" }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#1f2937" strokeWidth={3} dot={{ r: 5, stroke: "#1f2937", strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Monthly Orders</h3>
                <span className="text-2xl">📦</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ stroke: "#e0e0e0" }} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#e0e0e0" }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Monthly View */}
        {activeTab === "monthly" && summary && !loading && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Total Revenue</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-black">₹{summary.totalRevenue.toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">{monthNames[month - 1]} {year}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Orders</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-2xl font-bold text-black">{summary.numberOfOrders.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total orders</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Products Sold</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-2xl font-bold text-black">{summary.totalProductsSold.toLocaleString()}</p>
                <p className="text-sm text-gray-500">All products</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Avg Order Value</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-2xl font-bold text-black">₹{summary.averageOrderValue.toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">Per order</p>
              </div>
            </div>

            {/* Best Day */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Best Day</h3>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {summary.bestDay?.date
                        ? new Date(summary.bestDay.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Revenue: <span className="font-bold">₹{summary.bestDay?.totalRevenue?.toLocaleString("en-IN") || 0}</span> &middot; Orders: <span className="font-bold">{summary.bestDay?.numberOfOrders || 0}</span>
                    </p>
                  </div>
                </div>
              </div>
              {metrics && (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="font-semibold text-gray-700">Top Product Share</p>
                    <p className="text-xl font-bold text-black">{metrics.topProductShare}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="font-semibold text-gray-700">Top Category Share</p>
                    <p className="text-xl font-bold text-black">{metrics.topCategoryShare}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Products & Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Products Table */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Products</h3>
                {summary.topProducts && summary.topProducts.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {summary.topProducts.map((prod) => (
                      <li key={prod.productId} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-gray-700">{prod.name}</span>
                        <div className="text-right">
                          <span className="text-black font-semibold block">₹{prod.revenue.toLocaleString("en-IN")}</span>
                          <span className="text-gray-500 text-sm">{prod.quantitySold} sold</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No product data available</p>
                )}
              </div>
              {/* Top Categories Table */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Categories</h3>
                {summary.topCategories && summary.topCategories.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {summary.topCategories.map((cat) => (
                      <li key={cat.categoryId} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <div className="text-right">
                          <span className="text-black font-semibold block">₹{cat.totalRevenue.toLocaleString("en-IN")}</span>
                          <span className="text-gray-500 text-sm">{cat.totalQuantity} sold</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No category data available</p>
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            {summary.lowProducts && summary.lowProducts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Low Stock Products</h3>
                <ul className="divide-y divide-yellow-100">
                  {summary.lowProducts.map((prod) => (
                    <li key={prod._id} className="py-2 flex justify-between items-center">
                      <span className="font-medium text-yellow-900">{prod.name}</span>
                      <span className="text-yellow-700 text-sm">
                        {prod.stockQuantity} left (Alert at {prod.alertQuantity})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {activeTab === "monthly" && !summary && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
            <p>No data available for the selected month and year.</p>
          </div>
        )}
        {activeTab === "yearly" && (!yearlyData || !yearlyData.months || yearlyData.months.length === 0) && !loadingYearly && !updatingYearly && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-600">
            <p>No yearly data available for the selected year.</p>
          </div>
        )}
      </div>
    </div>
  );
}