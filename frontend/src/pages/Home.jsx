import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { BASE64_PLACEHOLDERS } from "../assets/placeholders";
import { currency } from "../data/helpers";
import { PRODUCT_CATEGORIES } from "../data/categories";

export default function Home() {
  const { products, addToCart, setRoute, favorites, toggleFav } = useApp();
  const featured = products.slice(0, 6);

  return (
    <div className="space-y-6 sm:space-y-10">

      {/* HERO */}
      <motion.section
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-10 bg-gradient-to-r from-[#FFE8ED] via-[#FFF4F7] to-[#FFEDEF] shadow-xl"
      >
        <div className="md:flex md:items-center md:gap-10">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#E05B75]">
              Aurie
            </h1>
            <p className="text-xs sm:text-sm text-[#E05B75] font-semibold">Handcrafted Candles</p>

            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-gray-700 max-w-xl">
              Delicate, long-burning candles inspired by nature.
            </p>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setRoute("category:Festival Candles")}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#FF7B8A] text-white shadow-md text-sm sm:text-base font-semibold"
              >
                Shop Now
              </button>

              <button
                onClick={() => setRoute("personalized")}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white border-2 border-pink-200 text-[#E05B75] text-sm sm:text-base font-semibold"
              >
                Create Gift
              </button>
            </div>
          </div>

          <img
            src={BASE64_PLACEHOLDERS[0]}
            className="rounded-xl sm:rounded-2xl shadow-lg mt-4 sm:mt-6 md:mt-0 md:w-1/3 w-full h-auto"
            alt="Featured candle"
          />
        </div>
      </motion.section>

      {/* CATEGORIES */}
      <section className="px-0">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setRoute(`category:${cat}`)}
              className="p-2 sm:p-3 bg-white border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition text-xs sm:text-sm font-semibold text-gray-700"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-0">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">New Arrivals</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {featured.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
            >
              <img 
                src={p.images[0]} 
                className="rounded-t-xl sm:rounded-t-2xl w-full h-32 sm:h-40 object-cover" 
                alt={p.title}
              />
              <div className="p-2 sm:p-4">
                <div className="font-semibold text-xs sm:text-sm line-clamp-2">{p.title}</div>

                <div className="mt-2 flex justify-between items-center">
                  <button
                    onClick={() => toggleFav(p.id)}
                    className={`text-lg sm:text-xl ${
                      favorites.includes(p.id) ? "text-pink-500" : "text-gray-300"
                    }`}
                  >
                    ♥
                  </button>

                  <div className="font-bold text-pink-600 text-xs sm:text-sm">{currency(p.price)}</div>
                </div>

                <div className="flex gap-2 mt-2 sm:mt-3">
                  <button
                    onClick={() => addToCart(p)}
                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-pink-500 text-white rounded-full text-xs sm:text-sm font-semibold"
                  >
                    Add
                  </button>

                  <button
                    onClick={() => setRoute("product:" + p.id)}
                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-pink-300 text-pink-600 rounded-full text-xs sm:text-sm font-semibold"
                  >
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Personalized section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow">
        <h3 className="font-bold text-base sm:text-lg text-gray-800">✨ Personalized Gift</h3>
        <p className="text-gray-600 text-xs sm:text-sm mt-2">
          Create a custom candle with engraved message.
        </p>

        <button
          onClick={() => setRoute("personalized")}
          className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-sm sm:text-base transition"
        >
          Create Gift
        </button>
      </section>
    </div>
  );
}
