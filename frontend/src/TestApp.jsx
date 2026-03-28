import React from "react";

export default function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE6EB] via-[#FFF5F8] to-[#FFECEF] p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">✅ Aurie Candles App</h1>
        <p className="text-gray-600 mb-4">Frontend is loading properly!</p>
        <p className="text-sm text-gray-500">Backend API: http://localhost:5000/api</p>
      </div>
    </div>
  );
}
