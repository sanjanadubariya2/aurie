import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { currency } from "../data/helpers";

export default function CategoryPage({ cat }) {
  const { products, addToCart, favorites, toggleFav } = useApp();

  const items = products.filter(p => p.category === cat);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{cat}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items.length === 0 && <div>No products found.</div>}

        {items.map(p => (
          <motion.div
            key={p.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >
            <img src={p.images[0]} className="w-full h-48 object-cover" />

            <div className="p-4">
              <div className="font-semibold">{p.title}</div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={() => toggleFav(p.id)}
                  className={`text-lg ${
                    favorites.includes(p.id) ? "text-pink-500" : "text-gray-300"
                  }`}
                >
                  ♥
                </button>

                <div className="text-pink-600 font-bold">
                  {currency(p.price)}
                </div>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="mt-3 px-3 py-1 bg-pink-500 text-white rounded-full"
              >
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
