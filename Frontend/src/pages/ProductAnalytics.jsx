import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductAnalyticsDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [performance, setPerformance] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [compareMonths, setCompareMonths] = useState({
    startMonth: month,
    startYear: year,
    endMonth: month,
    endYear: year,
  });
  const [loading, setLoading] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [error, setError] = useState(null);

  // Helper to fetch performance for a month
  const fetchPerformance = async (m, y) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/product-analytics/${m}/${y}`,
        {
          params: { month: m, year: y },
        }
      );
      setPerformance(res.data.message);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current month data on mount and when month/year changes
  useEffect(() => {
    fetchPerformance(month, year);
  }, [month, year]);

  // Fetch comparison data
  const fetchComparison = async () => {
    const { startMonth, startYear, endMonth, endYear } = compareMonths;
    try {
      setLoadingCompare(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/product-analytics/compare`,
        {
          params: { startMonth, startYear, endMonth, endYear },
        }
      );
      setComparison(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load comparison");
      setComparison(null);
    } finally {
      setLoadingCompare(false);
    }
  };

  // Render top products list
  const renderTopProducts = () => {
    if (!performance?.topProducts?.length) return <p className="text-black">No top products data.</p>;

    return (
      <table className="min-w-full border-collapse border border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="border border-black p-2 text-left">Product</th>
            <th className="border border-black p-2 text-right">Units Sold</th>
            <th className="border border-black p-2 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {performance.topProducts.map(({ product, unitsSold, revenue }) => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="border border-black p-2 text-black">{product.name}</td>
              <td className="border border-black p-2 text-right text-black">{unitsSold ?? 0}</td>
              <td className="border border-black p-2 text-right text-black">
                ₹{revenue?.toFixed(2) ?? "0.00"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Render comparison summary
  const renderComparison = () => {
    if (!comparison) return null;

    const { startPeriod, endPeriod, changes } = comparison;
    return (
      <div className="border border-black p-4 rounded-md bg-white mt-6">
        <h3 className="font-semibold mb-2 text-black">Performance Comparison</h3>
        <p className="text-black">
          <strong>
            {startPeriod.monthName} {startPeriod.year}
          </strong>{" "}
          vs{" "}
          <strong>
            {endPeriod.monthName} {endPeriod.year}
          </strong>
        </p>
        <ul className="list-disc list-inside mt-2 text-black">
          <li>Revenue Change: {changes.revenueChange}%</li>
          <li>Units Sold Change: {changes.unitsChange}%</li>
          <li>Avg Order Value Change: {changes.avgOrderValueChange ?? "N/A"}%</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6 font-sans">
        <h1 className="text-3xl font-bold mb-6 text-black">Product Analytics Dashboard</h1>

        {/* Month & Year selector */}
        <div className="flex space-x-4 mb-6">
          <select
            className="border border-black px-3 py-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear() + 10}
            className="border border-black px-3 py-2 rounded w-20 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <button
            onClick={() => fetchPerformance(month, year)}
            className="bg-black text-white px-4 rounded hover:bg-gray-800 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-black">Loading performance data...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : performance ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-black rounded bg-white">
                <h2 className="font-semibold text-black">Total Revenue</h2>
                <p className="text-xl text-black">₹{performance.totalRevenue?.toFixed(2) ?? "0.00"}</p>
              </div>
              <div className="p-4 border border-black rounded bg-white">
                <h2 className="font-semibold text-black">Total Units Sold</h2>
                <p className="text-xl text-black">{performance.totalUnitsSold ?? 0}</p>
              </div>
              <div className="p-4 border border-black rounded bg-white">
                <h2 className="font-semibold text-black">Average Order Value</h2>
                <p className="text-xl text-black">₹{performance.avgOrderValue?.toFixed(2) ?? "0.00"}</p>
              </div>
              <div className="p-4 border border-black rounded bg-white">
                <h2 className="font-semibold text-black">Total Orders</h2>
                <p className="text-xl text-black">{performance.totalOrders ?? 0}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3 text-black">Best Selling Product</h2>
              <p className="text-black">{performance.bestSellingProduct?.name || "N/A"}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3 text-black">Best Selling Category</h2>
              <p className="text-black">{performance.bestSellingCategory?.name || "N/A"}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3 text-black">Top Products</h2>
              {renderTopProducts()}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-3 text-black">Monthly Trends</h2>
              {performance.trends ? (
                <ul className="list-disc list-inside text-black">
                  <li>Revenue Growth: {performance.trends.revenueGrowth ?? "N/A"}%</li>
                  <li>Units Sold Growth: {performance.trends.unitsGrowth ?? "N/A"}%</li>
                </ul>
              ) : (
                <p className="text-black">No trend data available</p>
              )}
            </div>
          </>
        ) : null}

        <hr className="my-6 border-black" />

        {/* Comparison section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-black">Compare Performance Between Months</h2>

          <div className="flex space-x-3 mb-4">
            <div>
              <label className="block font-medium text-black">Start Month</label>
              <select
                className="border border-black px-2 py-1 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={compareMonths.startMonth}
                onChange={(e) =>
                  setCompareMonths((prev) => ({ ...prev, startMonth: Number(e.target.value) }))
                }
              >
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-black">Start Year</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 10}
                className="border border-black px-2 py-1 rounded w-20 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={compareMonths.startYear}
                onChange={(e) =>
                  setCompareMonths((prev) => ({ ...prev, startYear: Number(e.target.value) }))
                }
              />
            </div>

            <div>
              <label className="block font-medium text-black">End Month</label>
              <select
                className="border border-black px-2 py-1 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={compareMonths.endMonth}
                onChange={(e) =>
                  setCompareMonths((prev) => ({ ...prev, endMonth: Number(e.target.value) }))
                }
              >
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-black">End Year</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 10}
                className="border border-black px-2 py-1 rounded w-20 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={compareMonths.endYear}
                onChange={(e) =>
                  setCompareMonths((prev) => ({ ...prev, endYear: Number(e.target.value) }))
                }
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchComparison}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Compare
              </button>
            </div>
          </div>

          {loadingCompare ? <p className="text-black">Loading comparison...</p> : renderComparison()}
        </div>
      </div>
    </div>
  );
}