import API from './axios';

// Orders
export const getAllOrders = () => API.get('/api/admin/all');
export const getOrderById = (orderId) => API.get(`/api/admin/${orderId}`);
export const updateOrderStatus = (orderId, status) => 
  API.post(`/api/admin/${orderId}/update-status`, { status });

// Products
export const getProducts = () => API.get('/api/admin/products');
export const getProductById = (productId) => API.get(`/api/admin/products/${productId}`);
export const createProduct = (productData) => API.post('/api/admin/products', productData);
export const updateProduct = (productId, productData) => 
  API.put(`/api/admin/products/${productId}`, productData);
export const deleteProduct = (productId) => API.delete(`/api/admin/products/${productId}`);

// Customers
export const getCustomers = () => API.get('/api/admin/customers');
export const getCustomerDetails = (customerId) => API.get(`/api/admin/customers/${customerId}`);

// Statistics
export const getStats = () => API.get('/api/admin/stats/summary');

// Admin auth
export const adminLogin = (credentials) => API.post('/api/admin/login', credentials);
export const adminLogout = () => API.post('/api/admin/logout');

