import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BASE64_PLACEHOLDERS } from "../assets/placeholders";
import { PRODUCT_CATEGORIES } from "../data/categories";

export default function Navbar() {
  const { cart, setRoute } = useApp();
  const [showCat, setShowCat] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = PRODUCT_CATEGORIES.map((name, idx) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name: name,
    img: BASE64_PLACEHOLDERS[idx % BASE64_PLACEHOLDERS.length]
  }));

  const count = cart.reduce((s, it) => s + (it.qty || 0), 0);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setRoute("search:" + searchQuery.trim());
      setSearchQuery("");
      setMobileMenu(false);
    }
  };

  const handleNavClick = (route) => {
    setRoute(route);
    setMobileMenu(false);
    setShowCat(false);
  };

  return (
    <header className="backdrop-blur bg-white/80 sticky top-0 shadow z-50 w-full">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div onClick={() => handleNavClick("home")} className="cursor-pointer flex items-center gap-2 flex-shrink-0">
              <svg width="46" height="46">
                <circle cx="23" cy="23" r="20" fill="#FDE8FF" />
              </svg>
              <span className="text-2xl font-extrabold text-purple-700">Aurie</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6 items-center flex-1 ml-8">
              <button onClick={() => handleNavClick("home")} className="hover:text-purple-600 whitespace-nowrap">
                Home
              </button>

              {/* Categories Dropdown */}
              <div className="relative">
                <button onClick={() => setShowCat(v => !v)} className="hover:text-purple-600 whitespace-nowrap font-medium">
                  Categories ▾
                </button>

                <AnimatePresence>
                  {showCat && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full bg-white border border-gray-200 shadow-xl rounded-xl mt-3 z-50 w-72 overflow-hidden"
                    >
                      {categories.map((c, idx) => (
                        <button
                          key={c.id}
                          onClick={() => handleNavClick("category:" + c.name)}
                          className="w-full flex gap-4 p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                        >
                          <img src={c.img} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-800 text-sm">{c.name}</div>
                            <div className="text-xs text-gray-500 mt-1">Explore collection</div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => handleNavClick("new")} className="hover:text-purple-600 whitespace-nowrap">
                New Arrival
              </button>
              <button onClick={() => handleNavClick("personalized")} className="hover:text-purple-600 whitespace-nowrap">
                Personalized Gift
              </button>
              <button onClick={() => handleNavClick("about")} className="hover:text-purple-600 whitespace-nowrap">
                About Us
              </button>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search candles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 ml-2"
              />
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? (
                  <X className="text-gray-600" size={24} />
                ) : (
                  <Menu className="text-gray-600" size={24} />
                )}
              </button>

              {/* Account Icon */}
              <button onClick={() => handleNavClick("account")}>
                <User className="text-pink-600 hover:scale-110 transition" size={24} />
              </button>

              {/* Cart Icon */}
              <button onClick={() => handleNavClick("cart")} className="relative">
                <ShoppingCart className="text-purple-600 hover:scale-110 transition" size={24} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full text-xs px-2">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t mt-4 pt-4 flex flex-col gap-4"
              >
                <button onClick={() => handleNavClick("home")} className="text-left hover:text-purple-600">
                  Home
                </button>

                {/* Mobile Categories */}
                <div>
                  <button onClick={() => setShowCat(!showCat)} className="text-left hover:text-purple-600 w-full">
                    Categories ▾
                  </button>

                  {showCat && (
                    <div className="flex flex-col gap-3 ml-4 mt-3 border-l-2 border-purple-300 pl-4">
                      {categories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleNavClick("category:" + c.name)}
                          className="flex items-center gap-3 text-left hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <img src={c.img} className="w-10 h-10 rounded-lg object-cover shadow-sm flex-shrink-0" />
                          <div>
                            <div className="font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-500">Shop now</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => handleNavClick("new")} className="text-left hover:text-purple-600">
                  New Arrival
                </button>
                <button onClick={() => handleNavClick("personalized")} className="text-left hover:text-purple-600">
                  Personalized Gift
                </button>
                <button onClick={() => handleNavClick("about")} className="text-left hover:text-purple-600">
                  About Us
                </button>

                {/* Mobile Search */}
                <input
                  type="text"
                  placeholder="Search candles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
