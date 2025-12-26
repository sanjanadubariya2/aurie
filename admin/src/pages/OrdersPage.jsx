import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../api/admin';
import OrderCard from '../components/OrderCard';
import { initSocket, getSocket, closeSocket } from '../services/socketService';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize socket connection
    initSocket();
    const socket = getSocket();

    if (!socket) {
      console.error('❌ Socket failed to initialize');
      return;
    }

    console.log('🔌 Socket instance:', socket.id);

    // Listen for new orders
    socket.on('newOrder', (newOrder) => {
      console.log('✅ New order received via socket:', newOrder);
      const normalizedOrder = {
        ...newOrder,
        _id: newOrder.id || newOrder._id,
        createdAt: newOrder.createdAt?._seconds 
          ? new Date(newOrder.createdAt._seconds * 1000) 
          : new Date(newOrder.createdAt || Date.now())
      };
      setOrders(prevOrders => [normalizedOrder, ...prevOrders]);
    });

    // Listen for order updates
    socket.on('orderUpdated', (updatedOrder) => {
      console.log('✅ Order updated via socket:', updatedOrder);
      const normalizedOrder = {
        ...updatedOrder,
        _id: updatedOrder.id || updatedOrder._id,
        createdAt: updatedOrder.createdAt?._seconds 
          ? new Date(updatedOrder.createdAt._seconds * 1000) 
          : new Date(updatedOrder.createdAt || Date.now()),
        updatedAt: updatedOrder.updatedAt?._seconds 
          ? new Date(updatedOrder.updatedAt._seconds * 1000) 
          : new Date(updatedOrder.updatedAt || Date.now())
      };
      setOrders(prevOrders =>
        prevOrders.map(order =>
          (order.id === normalizedOrder.id || order._id === normalizedOrder._id) 
            ? normalizedOrder 
            : order
        )
      );
    });

    // Listen for connection events
    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Fetch initial orders
    fetchOrders();

    // Cleanup
    return () => {
      socket.off('newOrder');
      socket.off('orderUpdated');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      closeSocket();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      // Normalize orders - convert Firestore timestamps to Date objects
      const normalizedOrders = (response.data || response).map(order => ({
        ...order,
        _id: order.id || order._id, // Ensure _id is set
        createdAt: order.createdAt?._seconds 
          ? new Date(order.createdAt._seconds * 1000) 
          : new Date(order.createdAt || Date.now()),
        updatedAt: order.updatedAt?._seconds 
          ? new Date(order.updatedAt._seconds * 1000) 
          : new Date(order.updatedAt || Date.now())
      }));
      setOrders(normalizedOrders);
      setError('');
      console.log('✅ Orders loaded:', normalizedOrders.length);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      (order.id === orderId || order._id === orderId) ? { ...order, status: newStatus } : order
    ));
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order._id.includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    'all',
    'Order Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const getStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Order Placed').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-gray-600 text-xs sm:text-sm">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-xs sm:text-sm">Confirmed</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-xs sm:text-sm">Shipped</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-xs sm:text-sm">Delivered</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-300 rounded px-2 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchOrders}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition text-xs sm:text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No orders found</p>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id || order._id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
