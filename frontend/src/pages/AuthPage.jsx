import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { registerUser, loginUser } from "../api/auth";
import "../App.css";

export default function AuthPage() {
  const { setUser, setToken, setRoute } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      console.log("Starting signup with:", { name: formData.name, email: formData.email });

      const response = await registerUser(
        formData.name,
        formData.email,
        formData.password
      );

      console.log("Signup response:", response);
      console.log("Response keys:", Object.keys(response || {}));
      console.log("Response.user:", response?.user);
      console.log("Response.user.id:", response?.user?.id);

      if (response.error) {
        console.log("❌ Response has error:", response.error);
        setError(response.error);
      } else if (response.success === false || !response.user) {
        console.log("❌ No user in response or success=false");
        setError(response.msg || "Signup failed");
      } else {
        console.log("✅ Signup successful, setting user and route");
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Store demo OTP if available
        if (response.demo && response.demoOTP) {
          localStorage.setItem("demoOTP", response.demoOTP);
          console.log("📧 Demo OTP saved:", response.demoOTP);
        }
        
        // Redirect to email verification
        const route = `verify:${response.user.id}`;
        console.log("🔄 Setting route to:", route);
        setRoute(route);
      }
    }
    catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed - Please check console");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      if (!formData.password.trim()) {
        setError("Password is required");
        setLoading(false);
        return;
      }

      console.log("Starting login with:", { email: formData.email });

      const response = await loginUser(formData.email, formData.password);

      console.log("Login response:", response);

      if (response.error) {
        setError(response.error);
      } else if (response.success === false || !response.user) {
        setError(response.msg || "Login failed");
      } else {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Redirect to home
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed - Please check console");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isSignup) {
      handleSignup(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-purple-900">
          Aurie Candles
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {isSignup && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
              <p className="text-red-500 text-sm mt-1">⚠️ Please enter a valid email (e.g., user@example.com)</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition duration-200"
          >
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              });
            }}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
