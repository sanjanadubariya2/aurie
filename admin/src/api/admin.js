import API from './axios';

// Orders
export const getAllOrders = () => API.get('/api/admin/all');
export const getOrderById = (orderId) => API.get(`/api/admin/${orderId}`);
export const updateOrderStatus = (orderId, status) => 
  API.post(`/api/admin/${orderId}/update-status`, { status });

// Admin auth
export const adminLogin = (credentials) => API.post('/api/admin/login', credentials);
export const adminLogout = () => API.post('/api/admin/logout');
