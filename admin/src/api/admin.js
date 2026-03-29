import API from './axios';

// Orders
export const getAllOrders = () => API.get('/admin/all');
export const getOrderById = (orderId) => API.get(`/admin/${orderId}`);
export const updateOrderStatus = (orderId, status) => 
  API.post(`/admin/${orderId}/update-status`, { status });

// Products
export const getProducts = () => API.get('/admin/products');
export const getProductById = (productId) => API.get(`/admin/products/${productId}`);
export const createProduct = (productData) => API.post('/admin/products', productData);
export const updateProduct = (productId, productData) => 
  API.put(`/admin/products/${productId}`, productData);
export const deleteProduct = (productId) => API.delete(`/admin/products/${productId}`);

// Customers
export const getCustomers = () => API.get('/admin/customers');
export const getCustomerDetails = (customerId) => API.get(`/admin/customers/${customerId}`);

// Statistics
export const getStats = () => API.get('/admin/stats/summary');

// Admin auth
export const adminLogin = (credentials) => API.post('/admin/login', credentials);
export const adminLogout = () => API.post('/admin/logout');

