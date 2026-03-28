import React, { createContext, useContext, useState, useEffect } from "react";
import { uid, LS, isWinter } from "../data/helpers";
import { SEEDED } from "../data/products";
import { getProducts, normalizeProduct } from "../api/products.js";
import { io } from "socket.io-client";

const AppContext = createContext();
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export function AppProvider({ children }) {
  // Fetch products from Firestore via backend API
  const [products, setProducts] = useState(() => {
    try {
      // Try to load from localStorage first (cached)
      return LS.get("aurie_products", SEEDED);
    } catch (e) {
      console.error("Error loading products from cache:", e);
      return SEEDED;
    }
  });

  // Load fresh products from backend on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log("📦 Fetching products from Firestore...");
        const firebaseProducts = await getProducts();
        
        if (firebaseProducts && firebaseProducts.length > 0) {
          console.log("✅ Loaded", firebaseProducts.length, "products from Firestore");
          setProducts(firebaseProducts);
          LS.set("aurie_products", firebaseProducts);
        } else {
          console.log("⚠️ No products in Firestore, using seeded data");
          setProducts(SEEDED);
        }
      } catch (err) {
        console.error("❌ Failed to load products from Firestore:", err.message);
        console.log("Using cached or seeded products as fallback");
      }
    };

    loadProducts();

    // Set up Socket.io listener for real-time product updates
    let socket;
    try {
      console.log("🔌 Connecting to Socket.io...");
      socket = io("http://127.0.0.1:5000", {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socket.on("connect", () => {
        console.log("✅ Connected to Socket.io server");
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.io server");
      });

      socket.on("connect_error", (error) => {
        console.log("⚠️ Socket.io connection error:", error.message);
      });

      // Listen for product created
      socket.on("productCreated", (newProduct) => {
        console.log("✨ New product added via Socket:", newProduct.name || newProduct.title);
        const normalized = normalizeProduct(newProduct);
        setProducts((prev) => {
          const updated = [normalized, ...prev];
          LS.set("aurie_products", updated);
          return updated;
        });
      });

      // Listen for product updated
      socket.on("productUpdated", (updatedProduct) => {
        console.log("🔄 Product updated via Socket:", updatedProduct.name || updatedProduct.title);
        const normalized = normalizeProduct(updatedProduct);
        setProducts((prev) => {
          const updated = prev.map((p) =>
            p.id === normalized.id ? normalized : p
          );
          LS.set("aurie_products", updated);
          return updated;
        });
      });

      // Listen for product deleted
      socket.on("productDeleted", (productId) => {
        console.log("🗑️ Product deleted via Socket:", productId);
        setProducts((prev) => {
          const updated = prev.filter((p) => p.id !== productId);
          LS.set("aurie_products", updated);
          return updated;
        });
      });
    } catch (err) {
      console.error("❌ Socket.io initialization error:", err.message);
    }

    // Return cleanup function
    return () => {
      if (socket) {
        socket.off("productCreated");
        socket.off("productUpdated");
        socket.off("productDeleted");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.disconnect();
      }
    };
  }, []);

  const [cart, setCart] = useState(() => LS.get("aurie_cart", []));
  const [user, setUser] = useState(() => LS.get("aurie_user", null));
  const [token, setToken] = useState(() => LS.get("aurie_token", null));
  const [orders, setOrders] = useState(() => LS.get("aurie_orders", []));
  const [route, setRoute] = useState("home");
  const [flash, setFlash] = useState(null);
  const [favorites, setFavorites] = useState(() => LS.get("aurie_favorites", []));
  const [savedAddress, setSavedAddress] = useState(null);

  // Persist to LocalStorage
  useEffect(() => LS.set("aurie_cart", cart), [cart]);
  useEffect(() => LS.set("aurie_user", user), [user]);
  useEffect(() => LS.set("aurie_token", token), [token]);
  useEffect(() => LS.set("aurie_orders", orders), [orders]);
  useEffect(() => LS.set("aurie_products", products), [products]);

  // Flash Messages
  function flashMsg(text) {
    setFlash(text);
    setTimeout(() => setFlash(null), 1500);
  }

  // Cart Functions
  const addToCart = (p) => {
    setCart((c) => {
      const f = c.find((x) => x.id === p.id);
      if (f) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...p, qty: 1 }];
    });
    flashMsg("Added to cart");
  };

  const updateQty = (id, qty) =>
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty } : i))
        .filter((i) => i.qty > 0)
    );

  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  // Favorites
  const toggleFav = (id) =>
    setFavorites((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      LS.set("aurie_favorites", next);
      return next;
    });

  // Mock Payment API
  async function mockPayment() {
    return new Promise((res) =>
      setTimeout(() => res({ success: true, txId: uid("tx_") }), 700)
    );
  }

  // Place Order
  async function placeOrder({ method, shippingAddress, card, upiId, razorpayOrderId }) {
    if (!user) throw new Error("Login required");
    if (cart.length === 0) throw new Error("Cart empty");

    const pay = await mockPayment();

    const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = isWinter() ? subtotal * 0.25 : 0;
    const shipping = cart.length ? 50 : 0;
    const total = Math.round(subtotal - discount + shipping);

    const orderData = {
      items: cart,
      subtotal,
      discount,
      shipping,
      total,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: shippingAddress.phone,
      paymentMethod: method,
      paymentStatus: pay.success ? "paid" : "pending",
      status: "Order Placed",
      shippingAddress,
      card: card ? { last4: card.last4, name: card.name } : null,
      upiId: upiId || null,
      razorpayOrderId: razorpayOrderId || null,
      createdAt: new Date()
    };

    // Also save to backend Firestore
    try {
      const { placeOrder: placeOrderAPI } = await import("../api/payment.js");
      const backendResponse = await placeOrderAPI(orderData);
      
      if (backendResponse && backendResponse.id) {
        orderData._id = backendResponse.id;
      } else {
        orderData._id = uid("order_");
      }
    } catch (err) {
      console.warn("Failed to save order to backend:", err);
      orderData._id = uid("order_");
    }

    setOrders((o) => [orderData, ...o]);
    LS.set("aurie_orders", [orderData, ...orders]);

    clearCart();
    return orderData;
  }

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        user,
        token,
        orders,
        favorites,
        savedAddress,
        setSavedAddress,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        toggleFav,
        placeOrder,
        setUser,
        setToken,
        setRoute,
        route,
        flash,
        flashMsg,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
