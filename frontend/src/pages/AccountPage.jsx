import React, { useState, useEffect } from "react";
import { loginUser, registerUser, checkPhoneVerification, updateUserProfile } from "../api/auth";
import { useApp } from "../context/AppContext";

export default function AccountPage() {
  const { user, setUser, setToken, orders, setRoute, token, flashMsg } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Address Management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check phone verification status when user logs in
  useEffect(() => {
    const checkVerification = async () => {
      if (!user?.id || !token) {
        console.log("⚠️ Missing user or token");
        return;
      }
      
      try {
        console.log("🔍 Checking phone verification...");
        const response = await checkPhoneVerification(token);
        console.log("✅ Phone verification response:", response);
        if (response.user?.phoneVerified) {
          setPhoneVerified(true);
          // Also update user in context with fresh data from backend
          setUser(response.user);
          console.log("✅ User updated from backend:", response.user);
        } else {
          setPhoneVerified(false);
        }
      } catch (err) {
        console.error("❌ Error checking verification:", err);
      }
    };
    
    checkVerification();
  }, [user?.id, token, setUser]);

  async function handleLogin() {
    setError("");

    if (!loginEmail || !loginPassword) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(loginEmail, loginPassword);

      console.log("Login response:", res);

      if (res.error) {
        setError(res.error);
      } else if (!res.user || !res.user.id) {
        setError(res.msg || "Login failed - no user data");
      } else {
        // Store user and token
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        setLoginEmail("");
        setLoginPassword("");
        setRoute("home");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Login failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    setError("");

    if (!signupName || !signupEmail || !signupPassword) {
      setError("All fields are required.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await registerUser(signupName, signupEmail, signupPassword);

      console.log("Signup response:", res);

      if (res.error) {
        setError(res.error);
      } else if (!res.user || !res.user.id) {
        setError(res.msg || "Signup failed - no user ID");
      } else {
        // Store user and token in context and localStorage
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Clear form
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");

        // Redirect to verify email page
        setRoute(`verify:${res.user.id}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Signup failed.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (!user)
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg mt-10 mb-10">
        {!isSignup ? (
          // LOGIN FORM
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                }}
                className="text-orange-500 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          // SIGNUP FORM
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                }}
                className="text-orange-500 hover:underline font-semibold"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    );

  const myOrders = orders.filter(o => o.userId === user.id);

  // Address Management Functions
  const validateAddress = () => {
    setAddressError("");
    
    if (!newAddress.fullName.trim()) {
      setAddressError("Full name is required");
      return false;
    }
    if (!newAddress.phone.trim() || !/^\d{10}$/.test(newAddress.phone.replace(/\D/g, ""))) {
      setAddressError("Valid 10-digit phone number required");
      return false;
    }
    if (!newAddress.line1.trim()) {
      setAddressError("Address is required");
      return false;
    }
    if (newAddress.line1.trim().length < 10) {
      setAddressError("Address must be at least 10 characters");
      return false;
    }
    if (!newAddress.pincode.trim() || !/^\d{6}$/.test(newAddress.pincode.replace(/\D/g, ""))) {
      setAddressError("Valid 6-digit pincode required");
      return false;
    }
    
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    try {
      setAddressLoading(true);
      setAddressError("");

      const addressData = {
        fullName: newAddress.fullName.trim(),
        phone: newAddress.phone.replace(/\D/g, ""),
        address: newAddress.line1.trim(),
        city: newAddress.city.trim() || "",
        state: newAddress.state.trim() || "",
        pincode: newAddress.pincode.replace(/\D/g, "")
      };

      console.log("💾 Saving address:", addressData);
      const response = await updateUserProfile(token, addressData);

      if (response.error) {
        setAddressError(response.error);
      } else {
        console.log("✅ Address saved successfully");
        // Update user context with new addresses
        if (response.user) {
          setUser(response.user);
        }
        
        // Reset form
        setNewAddress({
          fullName: "",
          phone: "",
          line1: "",
          city: "",
          state: "",
          pincode: ""
        });
        setShowAddForm(false);
        setEditingIdx(null);
        flashMsg("✅ Address saved successfully");
      }
    } catch (err) {
      console.error("❌ Error saving address:", err);
      setAddressError(err.message || "Failed to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddress = (idx) => {
    const addr = user.deliveryAddresses[idx];
    setNewAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode
    });
    setEditingIdx(idx);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (idx) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      setAddressLoading(true);
      
      // Create new addresses array without the deleted one
      const updatedAddresses = user.deliveryAddresses.filter((_, i) => i !== idx);
      
      // If deleting primary (idx 0), we need to save a new primary
      if (updatedAddresses.length > 0) {
        // Update to make the next address the primary
        const addr = updatedAddresses[0];
        const response = await updateUserProfile(token, {
          fullName: addr.fullName,
          phone: addr.phone,
          address: addr.line1,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        });

        if (response.error) {
          console.error("Failed to delete address:", response.error);
          flashMsg("❌ Failed to delete address");
        } else {
          setUser(response.user);
          flashMsg("✅ Address deleted");
        }
      } else {
        // No addresses left, just update user
        setUser({
          ...user,
          deliveryAddresses: []
        });
        flashMsg("✅ Address deleted");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      flashMsg("❌ Error deleting address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingIdx(null);
    setNewAddress({
      fullName: "",
      phone: "",
      line1: "",
      city: "",
      state: "",
      pincode: ""
    });
    setAddressError("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>

        {/* User Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Personal Information</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="font-semibold text-green-600">✓ Verified</p>
              </div>
            </div>
          </div>

          {/* Phone Verification Status */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-700">Phone Verification</h3>
            
            {phoneVerified || user?.phoneVerified ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-semibold">✓ Phone Verified</p>
                <p className="text-xs text-green-600 mt-1">{user?.verifiedPhoneNumber || "Your phone number is verified for payments"}</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700 font-semibold">⚠️ Verification Pending</p>
                <p className="text-xs text-yellow-600 mt-1">Verify your phone to enable all payment methods</p>
                <button
                  onClick={() => setRoute("phone-verify")}
                  className="mt-3 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition"
                >
                  Verify Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-700">Saved Delivery Addresses</h3>
            {!showAddForm && (user?.deliveryAddresses?.length || 0) < 5 && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setNewAddress({
                    fullName: user.name,
                    phone: user?.verifiedPhoneNumber || "",
                    line1: "",
                    city: "",
                    state: "",
                    pincode: ""
                  });
                }}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
              >
                + Add Address
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                {editingIdx !== null ? "Edit Address" : "Add New Address"}
              </h4>

              {addressError && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                  {addressError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="9876543210"
                    maxLength="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <textarea
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    placeholder="House number, street name, area"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="400001"
                    maxLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={addressLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {addressLoading ? "Saving..." : "Save Address"}
                  </button>
                  <button
                    onClick={handleCancelForm}
                    disabled={addressLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {user?.deliveryAddresses && user.deliveryAddresses.length > 0 ? (
            <div className="space-y-3">
              {user.deliveryAddresses.map((addr, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">Address {idx + 1}</h4>
                    <div className="flex gap-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {idx === 0 ? "Primary" : "Secondary"}
                      </span>
                      <button
                        onClick={() => handleEditAddress(idx)}
                        className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs font-medium transition"
                      >
                        ✏️ Edit
                      </button>
                      {user.deliveryAddresses.length > 1 && (
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          disabled={addressLoading}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 rounded text-xs font-medium transition"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{addr.fullName}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Street Address</p>
                      <p className="font-semibold text-gray-900">{addr.line1}</p>
                    </div>
                    
                    {(addr.city || addr.state) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-gray-600">City</p>
                          <p className="font-semibold text-gray-900">{addr.city || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">State</p>
                          <p className="font-semibold text-gray-900">{addr.state || "N/A"}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Pincode</p>
                        <p className="font-semibold text-gray-900">{addr.pincode}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{addr.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-3">No saved addresses yet</p>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setNewAddress({
                    fullName: user.name,
                    phone: user?.verifiedPhoneNumber || "",
                    line1: "",
                    city: "",
                    state: "",
                    pincode: ""
                  });
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition"
              >
                Add Your First Address
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => setRoute("home")}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          >
            Continue Shopping
          </button>
          
          <button
            onClick={() => setUser(null)}
            className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* My Orders Section */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h3>

        {myOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No orders yet.</p>
            <button
              onClick={() => setRoute("home")}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map(o => (
              <div
                key={o.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">Order {o.id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{o.items?.length || 0} items</div>
                    <div className="text-sm text-gray-600">₹{o.total || 0}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {o.paymentMethod}
                    </span>
                    <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {o.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setRoute("order:" + o.id)}
                    className="px-3 py-1 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded font-medium text-sm transition"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
