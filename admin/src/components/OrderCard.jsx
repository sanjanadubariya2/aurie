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
      await updateOrderStatus(order._id, selectedStatus);
      onStatusUpdate(order._id, selectedStatus);
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Customer Info */}
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Customer</p>
          <p className="font-semibold text-gray-900">{order.customerName}</p>
          <p className="text-gray-700">{order.customerEmail}</p>
          <p className="text-gray-700">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-gray-600">Payment</p>
          <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
          <p className={`text-sm ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentStatus.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-gray-600 text-sm mb-1">Shipping Address</p>
        <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
        <p className="text-gray-700 text-sm">{order.shippingAddress.address}</p>
        <p className="text-gray-700 text-sm">{order.shippingAddress.pincode} | {order.shippingAddress.phone}</p>
      </div>

      {/* Items */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm font-semibold mb-2">Items ({order.items.length})</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-gray-700">
              <span>{item.title} x {item.qty}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal:</span>
          <span>₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Discount:</span>
          <span>-₹{order.discount}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Shipping:</span>
          <span>₹{order.shipping}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {/* Status Update */}
      <div className="border-t pt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
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
            {updatingStatus ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
