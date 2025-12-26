import React from 'react';
import { PRODUCT_CATEGORIES } from '../data/categories';

export default function Navigation({ currentPage, onPageChange }) {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'orders', label: '📦 Orders' },
    { id: 'products', label: '🛍️ Products' },
    { id: 'customers', label: '👥 Customers' }
  ];

  // All categories for reference (to update as needed)
  const categories = PRODUCT_CATEGORIES;

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-2 py-4 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`px-4 py-2 rounded-lg transition font-semibold whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
