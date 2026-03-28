import React from "react";
import { useApp } from "../context/AppContext";

export default function OrderTrack({ id }) {
  const { orders } = useApp();
  const order = orders.find(o => o.id === id);

  if (!order) return <div>Order not found.</div>;

  const statuses = [
    "Order Placed",
    "Confirmed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
  ];

  const current = statuses.indexOf(order.status);

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">Tracking — {order.id}</h2>
      <p className="text-sm text-gray-600">Tracking ID: {order.trackingId}</p>

      <div className="mt-6 space-y-3">
        {statuses.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 ${
              i <= current ? "text-pink-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                i <= current ? "bg-pink-500 text-white" : ""
              }`}
            >
              {i + 1}
            </div>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
