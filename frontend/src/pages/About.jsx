import React from "react";

export default function About() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-pink-600">About Aurie</h2>

      <p className="mt-3 text-gray-700">
        Aurie Candles creates handcrafted, eco-friendly candles with premium
        fragrances and elegant designs. Each candle is poured with care to bring
        radiance, aroma, and comfort to your home.
      </p>

      <h3 className="mt-4 font-semibold text-pink-600">Our Values</h3>
      <ul className="list-disc ml-6 text-gray-600 mt-2">
        <li>Eco-friendly materials</li>
        <li>Hand-poured craftsmanship</li>
        <li>Custom gift personalization</li>
      </ul>

      <button className="mt-6 px-4 py-2 bg-pink-500 text-white rounded-full">
        Shop Now
      </button>
    </div>
  );
}
