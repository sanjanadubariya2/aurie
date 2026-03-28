import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BASE64_PLACEHOLDERS } from "../assets/placeholders";
import { uid } from "../data/helpers";

export default function Personalized() {
  const { addToCart, setRoute } = useApp();

  const [text, setText] = useState("");
  const [fragrance, setFragrance] = useState("Lavender");

  function createGift() {
    const p = {
      id: uid("pp_"),
      title: `Personalized Candle - "${text}"`,
      category: "Personalized",
      price: 599,
      images: [BASE64_PLACEHOLDERS[0]],
      description: `Personalized with: ${text}`
    };

    addToCart(p);
    setRoute("cart");
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">Create Personalized Candle</h2>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <label className="text-sm">Engraved Message</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Happy Birthday"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <label className="text-sm mt-3 block">Fragrance</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={fragrance}
            onChange={e => setFragrance(e.target.value)}
          >
            <option>Lavender</option>
            <option>Rose</option>
            <option>Winter Spice</option>
          </select>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="h-40 w-full bg-pink-50 rounded flex items-center justify-center">
            Preview
          </div>

          <button
            onClick={createGift}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-full"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
