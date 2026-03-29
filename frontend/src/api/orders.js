import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurie_user')
    ? JSON.parse(localStorage.getItem('aurie_user')).token
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Place Order
export const placeOrderAPI = (orderData) => API.post('/orders/place', orderData);

// Get user orders
export const getUserOrders = (userId) => API.get(`/orders/${userId}`);

export default API;
