import React from "react";
import { useApp } from "../context/AppContext";
import { currency } from "../data/helpers";

export default function ProductDetail({ id }) {
  const { products, addToCart, favorites, toggleFav, setRoute } = useApp();
  const p = products.find(x => x.id === id);

  if (!p) return <div>Product not found</div>;

  return (
    <div className="md:flex gap-6">
      <img src={p.images[0]} className="md:w-1/2 rounded-2xl shadow" />

      <div className="md:w-1/2 bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold">{p.title}</h2>
        <p className="mt-2 text-gray-600">{p.description}</p>

        <div className="mt-4 text-2xl font-bold text-pink-600 flex items-center gap-3">
          {currency(p.price)}

          <button
            onClick={() => toggleFav(p.id)}
            className={`text-3xl ${
              favorites.includes(p.id) ? "text-pink-500" : "text-gray-300"
            }`}
          >
            ♥
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => addToCart(p)}
            className="px-4 py-2 bg-pink-500 text-white rounded-full"
          >
            Add to cart
          </button>

          <button
            onClick={() => setRoute("cart")}
            className="px-4 py-2 border rounded-full"
          >
            Go to cart
          </button>
        </div>
      </div>
    </div>
  );
}
