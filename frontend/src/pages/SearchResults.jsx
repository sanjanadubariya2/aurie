import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { currency } from "../data/helpers";

export default function SearchResults({ q }) {
  const { products, addToCart, setRoute, favorites, toggleFav } = useApp();

  const term = q?.toLowerCase() || "";
  const results = products.filter(
    p =>
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );

  return (
    <div>
      <h2 className="text-xl font-semibold">Search: "{q}"</h2>

      {results.length === 0 && (
        <p className="mt-4 text-gray-600">No results found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {results.map(p => (
          <motion.div
            key={p.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >
            <img src={p.images[0]} className="w-full h-48 object-cover" />

            <div className="p-4">
              <div className="font-semibold">{p.title}</div>
              <div className="text-pink-600 font-bold mt-2">{currency(p.price)}</div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => toggleFav(p.id)}
                  className={`text-lg ${
                    favorites.includes(p.id) ? "text-pink-500" : "text-gray-300"
                  }`}
                >
                  ♥
                </button>

                <button
                  onClick={() => addToCart(p)}
                  className="px-3 py-1 bg-pink-500 text-white rounded-full"
                >
                  Add
                </button>

                <button onClick={() => setRoute("product:" + p.id)}>
                  View
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
