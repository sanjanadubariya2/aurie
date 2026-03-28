import { API } from "./axios.js";

// Payment endpoints
export const createPaymentOrder = (data) => 
  API.post("/payments/create", data);

export const verifyPayment = (data) => 
  API.post("/payments/verify", data);

export const handlePaymentFailure = (data) => 
  API.post("/payments/failure", data);

// Order endpoints
export const placeOrder = (orderData) =>
  API.post("/orders/place", orderData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Place Order Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to place order";
      return { error: errorMsg };
    });

export const getUserOrders = (userId, token) =>
  API.get(`/orders/${userId}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Get Orders Error:", err);
      return [];
    });

export const getOrderDetails = (orderId) =>
  API.get(`/orders/order/${orderId}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Get Order Details Error:", err);
      return null;
    });

// Address endpoints
export const saveAddress = (addressData, token) =>
  API.post("/orders/add-address", addressData, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => {
      console.log("✅ Address saved:", res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("Save Address Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to save address";
      return { error: errorMsg };
    });
