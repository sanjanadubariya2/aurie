import React from 'react';

export default function Header({ adminName, onLogout }) {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">🍯 Aurie Admin</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {adminName || 'Admin'}</span>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
