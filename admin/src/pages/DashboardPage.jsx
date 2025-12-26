import React, { useState, useEffect } from 'react';
import { getStats } from '../api/admin';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      // Handle both direct response and wrapped response
      setStats(response.data || response);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your store analytics</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-semibold mb-2">TOTAL REVENUE</p>
              <p className="text-4xl font-bold">₹{stats.revenue || 0}</p>
              <p className="text-green-100 text-sm mt-2">All time</p>
            </div>
            <div className="text-5xl opacity-20">💰</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2">TOTAL ORDERS</p>
              <p className="text-4xl font-bold">{stats.total || 0}</p>
              <p className="text-blue-100 text-sm mt-2">All orders</p>
            </div>
            <div className="text-5xl opacity-20">📦</div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-2">PENDING ORDERS</p>
              <p className="text-4xl font-bold">{stats.pending || 0}</p>
              <p className="text-orange-100 text-sm mt-2">Need attention</p>
            </div>
            <div className="text-5xl opacity-20">⏳</div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-semibold mb-2">DELIVERED</p>
              <p className="text-4xl font-bold">{stats.delivered || 0}</p>
              <p className="text-purple-100 text-sm mt-2">Completed</p>
            </div>
            <div className="text-5xl opacity-20">✅</div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Order Status Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Order Placed */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-semibold">Order Placed</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending || 0}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
            <div className="mt-3 bg-yellow-300 h-2 rounded-full">
              <div 
                className="bg-yellow-600 h-2 rounded-full"
                style={{ width: stats.total > 0 ? (stats.pending / stats.total * 100) + '%' : '0%' }}
              />
            </div>
          </div>

          {/* Confirmed */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold">Confirmed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.confirmed || 0}</p>
              </div>
              <div className="text-4xl">✔️</div>
            </div>
            <div className="mt-3 bg-blue-300 h-2 rounded-full">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: stats.total > 0 ? (stats.confirmed / stats.total * 100) + '%' : '0%' }}
              />
            </div>
          </div>

          {/* Shipped */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-2 border-indigo-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-700 text-sm font-semibold">Shipped</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.shipped || 0}</p>
              </div>
              <div className="text-4xl">🚚</div>
            </div>
            <div className="mt-3 bg-indigo-300 h-2 rounded-full">
              <div 
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: stats.total > 0 ? (stats.shipped / stats.total * 100) + '%' : '0%' }}
              />
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.delivered || 0}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <div className="mt-3 bg-green-300 h-2 rounded-full">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ width: stats.total > 0 ? (stats.delivered / stats.total * 100) + '%' : '0%' }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border-2 border-pink-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-700 text-sm font-semibold">Completion</p>
                <p className="text-3xl font-bold text-pink-600 mt-2">
                  {stats.total > 0 ? Math.round(stats.delivered / stats.total * 100) : 0}%
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <div className="mt-3 bg-pink-300 h-2 rounded-full">
              <div 
                className="bg-pink-600 h-2 rounded-full"
                style={{ width: stats.total > 0 ? (stats.delivered / stats.total * 100) + '%' : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition font-semibold text-sm sm:text-base">
            📦 View Pending Orders
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition font-semibold text-sm sm:text-base">
            🚚 Update Shipments
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition font-semibold text-sm sm:text-base">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Metric</th>
              <th className="px-4 py-2 text-left font-semibold">Value</th>
              <th className="px-4 py-2 text-left font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">Total Orders</td>
              <td className="px-4 py-2">{stats.total || 0}</td>
              <td className="px-4 py-2">100%</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">Order Placed</td>
              <td className="px-4 py-2">{stats.pending || 0}</td>
              <td className="px-4 py-2">
                {stats.total > 0 ? Math.round(stats.pending / stats.total * 100) : 0}%
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">Confirmed</td>
              <td className="px-4 py-2">{stats.confirmed || 0}</td>
              <td className="px-4 py-2">
                {stats.total > 0 ? Math.round(stats.confirmed / stats.total * 100) : 0}%
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 font-semibold">Shipped</td>
              <td className="px-4 py-2">{stats.shipped || 0}</td>
              <td className="px-4 py-2">
                {stats.total > 0 ? Math.round(stats.shipped / stats.total * 100) : 0}%
              </td>
            </tr>
            <tr className="bg-green-50 hover:bg-green-100">
              <td className="px-4 py-2 font-bold text-green-700">Delivered</td>
              <td className="px-4 py-2 font-bold text-green-700">{stats.delivered || 0}</td>
              <td className="px-4 py-2 font-bold text-green-700">
                {stats.total > 0 ? Math.round(stats.delivered / stats.total * 100) : 0}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">💵 Revenue Overview</h2>
        <p className="text-4xl font-bold mb-2">₹{stats.revenue || 0}</p>
        <p className="text-green-100 text-sm">Total revenue from all orders</p>
        <div className="mt-4 bg-white bg-opacity-20 rounded p-3">
          <p className="text-sm">Average Order Value: <span className="font-bold">₹{stats.total > 0 ? Math.round(stats.revenue / stats.total) : 0}</span></p>
        </div>
      </div>
    </div>
  );
}
