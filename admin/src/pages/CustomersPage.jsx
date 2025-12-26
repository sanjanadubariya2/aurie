import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomerDetails } from '../api/admin';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomers();
      setCustomers(response.data.customers || []);
      setError('');
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const response = await getCustomerDetails(customer.id);
      setCustomerDetails(response.data);
      console.log('Customer Details:', response.data);
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      setError('Failed to load customer details');
    }
  };

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emailVerifiedCustomers = filteredCustomers.filter(c => c.emailVerified);
  const phoneVerifiedCustomers = filteredCustomers.filter(c => c.phoneVerified);

  const CustomerTable = ({ data, title, emptyMessage }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">{title} ({data.length})</h2>
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Name</th>
                <th className="px-4 py-2 text-left font-semibold">Email</th>
                <th className="px-4 py-2 text-left font-semibold">Phone</th>
                <th className="px-4 py-2 text-left font-semibold">Joined</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(customer => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{customer.name || 'N/A'}</td>
                  <td className="px-4 py-2">{customer.email || 'N/A'}</td>
                  <td className="px-4 py-2">{customer.phone || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleSelectCustomer(customer)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>
        <p className="text-gray-600">Total Customers: {customers.length}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Email Verified Customers */}
        <div>
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center py-8">Loading customers...</div>
          ) : (
            <CustomerTable
              data={emailVerifiedCustomers}
              title="✅ Email Verified Customers"
              emptyMessage="No email verified customers found"
            />
          )}
        </div>

        {/* Phone Verified Customers */}
        <div>
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center py-8">Loading customers...</div>
          ) : (
            <CustomerTable
              data={phoneVerifiedCustomers}
              title="📱 Phone Verified Customers"
              emptyMessage="No phone verified customers found"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Customer Details */}
        <div>
          {selectedCustomer ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Customer Details</h2>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="font-semibold">{selectedCustomer.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold text-sm">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="font-semibold">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email Verified</p>
                  <p className="font-semibold">
                    {selectedCustomer.emailVerified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone Verified</p>
                  <p className="font-semibold">
                    {selectedCustomer.phoneVerified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              {customerDetails ? (
                <div>
                  <h3 className="font-bold mb-3 border-t pt-3">Orders ({(customerDetails.orders || []).length})</h3>
                  {(!customerDetails.orders || customerDetails.orders.length === 0) ? (
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetails.orders.map(order => (
                        <div key={order.id} className="bg-gray-50 p-2 rounded text-sm">
                          <p className="font-semibold">#{order.id}</p>
                          <p className="text-gray-600">₹{order.totalAmount || order.total || 0}</p>
                          <p className="text-xs text-gray-500">{order.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Select a customer to view orders...</p>
              )}

              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetails(null);
                }}
                className="w-full mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-600 text-sm">Total Customers</p>
          <p className="text-3xl font-bold text-pink-600">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-600 text-sm">Email Verified</p>
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => c.emailVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-600 text-sm">Phone Verified</p>
          <p className="text-3xl font-bold text-blue-600">
            {customers.filter(c => c.phoneVerified).length}
          </p>
        </div>
      </div>
    </div>
  );
}
