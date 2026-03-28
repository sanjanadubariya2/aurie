import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t py-10 mt-10">
      <div className="max-w-6xl mx-auto text-sm p-4">
        <div className="flex justify-between flex-wrap gap-6">
          <div>
            <div className="font-bold text-pink-600 text-lg">Aurie Candles</div>
            <p className="mt-2 text-gray-600">Handmade candles, thoughtful gifts.</p>
          </div>

          <div>
            <div className="font-semibold mb-1">Contact</div>
            <a href="mailto:support@aurie.com" className="text-pink-600">support@aurie.com</a>
          </div>

          <div>
            <div className="font-semibold mb-1">Follow</div>
            <div className="flex gap-4">
              <a href="https://instagram.com/shopaurie" className="text-pink-600">Instagram</a>
              <a href="https://youtube.com" className="text-pink-600">YouTube</a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} Aurie Candles. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
