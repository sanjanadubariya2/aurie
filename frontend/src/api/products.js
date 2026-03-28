import { API } from "./axios.js";

// Normalize product fields from admin (name, image) to frontend (title, images array)
export const normalizeProduct = (product) => {
  return {
    id: product.id,
    title: product.title || product.name || "Untitled",
    name: product.name || product.title,
    price: parseFloat(product.price) || 0,
    description: product.description || "",
    category: product.category || "Candles",
    stock: parseInt(product.stock) || 0,
    images: product.images ? (Array.isArray(product.images) ? product.images : [product.images]) : [product.image || ""],
    image: product.image || (product.images ? product.images[0] : ""),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

// Get all products from Firestore via backend
export const getProducts = () => 
  API.get("/products")
    .then((res) => {
      const products = (res.data || []).map(normalizeProduct);
      console.log("✅ Normalized", products.length, "products");
      return products;
    })
    .catch((err) => {
      console.error("❌ Get Products Error:", err);
      return [];
    });

// Get single product by ID
export const getProductById = (productId) =>
  API.get(`/products/${productId}`)
    .then((res) => {
      const product = normalizeProduct(res.data || {});
      return product;
    })
    .catch((err) => {
      console.error("❌ Get Product Error:", err);
      return null;
    });

// Search products by name or description
export const searchProducts = (query) =>
  API.get(`/products/search?q=${encodeURIComponent(query)}`)
    .then((res) => (res.data || []).map(normalizeProduct))
    .catch((err) => {
      console.error("❌ Search Products Error:", err);
      return [];
    });

export default {
  getProducts,
  getProductById,
  searchProducts,
  normalizeProduct
};
