import React, { useState } from 'react';
import { updateOrderStatus } from '../api/admin';

export default function OrderCard({ order, onStatusUpdate }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const statusOptions = [
    'Order Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(order.id || order._id, selectedStatus);
      onStatusUpdate(order.id || order._id, selectedStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Packed': 'bg-purple-100 text-purple-800',
      'Shipped': 'bg-cyan-100 text-cyan-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 border-b pb-3 sm:pb-4 gap-2">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-gray-900">Order #{(order.id || order._id).slice(-6).toUpperCase()}</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {new Date(order.createdAt?._seconds ? order.createdAt._seconds * 1000 : order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Customer Info */}
      <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
        <div>
          <p className="text-gray-600 text-xs font-semibold">Customer</p>
          <p className="font-semibold text-gray-900">{order.customerName}</p>
          <p className="text-gray-700 truncate text-xs">{order.customerEmail}</p>
          <p className="text-gray-700 text-xs">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs font-semibold">Payment</p>
          <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
          <p className={`text-xs font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentStatus.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded">
        <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">📍 Shipping Address</p>
        <p className="font-semibold text-gray-900 text-xs sm:text-sm">{order.shippingAddress.fullName}</p>
        <p className="text-gray-700 text-xs line-clamp-2">{order.shippingAddress.address}</p>
        <p className="text-gray-700 text-xs mt-1">{order.shippingAddress.pincode} | {order.shippingAddress.phone}</p>
      </div>

      {/* Items */}
      <div className="mb-3 sm:mb-4">
        <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2">Items ({order.items.length})</p>
        <div className="space-y-1 max-h-40 overflow-y-auto text-xs sm:text-sm">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-gray-700">
              <span className="truncate flex-1">{item.title}</span>
              <span className="flex-shrink-0 ml-2 font-semibold">x{item.qty}</span>
              <span className="flex-shrink-0 ml-2 font-semibold">₹{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded">
        <div className="flex justify-between text-xs sm:text-sm mb-1">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm mb-1">
          <span className="text-gray-600">Discount:</span>
          <span className="font-semibold text-green-600">-₹{order.discount}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm mb-1">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-semibold">₹{order.shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-sm sm:text-lg border-t pt-2 text-blue-600">
          <span>Total:</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {/* Status Update */}
      <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">📊 Update Status</p>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {selectedStatus !== 'Order Placed' && (
            <button
              onClick={() => {
                setSelectedStatus('Order Placed');
                handleStatusUpdate();
              }}
              disabled={updatingStatus}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-semibold text-sm transition"
            >
              📋 Place
            </button>
          )}
          
          {selectedStatus !== 'Confirmed' && (
            <button
              onClick={() => {
                setSelectedStatus('Confirmed');
                handleStatusUpdate();
              }}
              disabled={updatingStatus}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-semibold text-sm transition"
            >
              ✅ Confirm
            </button>
          )}
          
          {selectedStatus !== 'Shipped' && (
            <button
              onClick={() => {
                setSelectedStatus('Shipped');
                handleStatusUpdate();
              }}
              disabled={updatingStatus}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-semibold text-sm transition"
            >
              🚚 Ship
            </button>
          )}
          
          {selectedStatus !== 'Delivered' && (
            <button
              onClick={() => {
                setSelectedStatus('Delivered');
                handleStatusUpdate();
              }}
              disabled={updatingStatus}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded font-semibold text-sm transition"
            >
              ✅ Deliver
            </button>
          )}
        </div>

        {/* Manual Select */}
        <div className="flex gap-2 pt-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updatingStatus || selectedStatus === order.status}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold transition"
          >
            {updatingStatus ? '⏳...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
