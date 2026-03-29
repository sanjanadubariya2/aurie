import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { sendPhoneOtp, verifyPhoneOtp, checkPhoneVerification, updateUserProfile } from "../api/auth";

export default function PhoneVerification() {
  const { user, setUser, setRoute, flashMsg, token } = useApp();
  
  const [shipping, setShipping] = useState(null);
  const [phone, setPhone] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Check if user is already phone verified - skip if so
  useEffect(() => {
    const checkAlreadyVerified = async () => {
      // Get token from context OR localStorage fallback
      const currentToken = token || localStorage.getItem("token");
      if (!currentToken) return;
      
      try {
        console.log("🔍 Checking if user already phone verified...");
        const response = await checkPhoneVerification(currentToken);
        
        // If phone is already verified, go straight to transaction
        if (response.user?.phoneVerified) {
          console.log("✅ User already verified! Redirecting to transaction...");
          setSuccess("Phone already verified! Redirecting to payment...");
          
          // Use first saved address if available
          if (response.user?.deliveryAddresses?.length > 0) {
            const firstAddress = response.user.deliveryAddresses[0];
            localStorage.setItem("aurie_selected_address", JSON.stringify(firstAddress));
          }
          
          // Update user context with Firestore data
          setUser(response.user);
          
          // Redirect to transaction after a brief delay
          setTimeout(() => setRoute("transaction"), 1000);
        } else {
          console.log("❌ Phone not verified yet. Need to verify.");
        }
      } catch (err) {
        console.log("ℹ️ First verification check (normal on initial load)", err.message);
      }
    };
    
    checkAlreadyVerified();
  }, [token, setRoute, setUser]);

  // Load shipping address on mount
  useEffect(() => {
    const savedShipping = localStorage.getItem("aurie_checkout_shipping");
    if (savedShipping) {
      const shippingData = JSON.parse(savedShipping);
      setShipping(shippingData);
      setPhone(shippingData.phone);
    }
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">You're not logged in</h2>
        <button
          onClick={() => setRoute("account")}
          className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-full"
        >
          Login to continue
        </button>
      </div>
    );
  }

  if (!shipping) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold">No Address Found</h2>
        <p className="text-gray-600 mt-2">Please add a delivery address first</p>
        <button
          onClick={() => setRoute("checkout")}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-full"
        >
          Add Address
        </button>
      </div>
    );
  }

  // Validate phone number (10 digits)
  const isValidPhone = (phoneNum) => {
    return /^\d{10}$/.test(phoneNum.replace(/\D/g, ""));
  };

  // Send OTP to phone
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      setError("Not logged in. Please login first.");
      return;
    }

    try {
      setLoading(true);
      const cleanPhone = phone.replace(/\D/g, "");
      console.log("📱 Sending phone OTP with token:", currentToken.substring(0, 20) + "...");
      
      const response = await sendPhoneOtp(currentToken, cleanPhone);

      console.log("✅ OTP response:", response);
      
      if (response.error) {
        setError(response.error);
      } else {
        setOtpSent(true);
        setShowOtpInput(true);
        setOtp("");
        setTimer(60); // 60 second countdown
        
        // Show demo OTP if in demo mode
        let successMsg = `OTP sent to ${phone.slice(-4)}***`;
        if (response.demo && response.demoOTP) {
          successMsg = `[DEMO] OTP: ${response.demoOTP}`;
          // Store demo OTP for easy access
          localStorage.setItem("demoPhoneOTP", response.demoOTP);
          console.log("📱 Demo OTP:", response.demoOTP);
        }
        setSuccess(successMsg);
        flashMsg(successMsg);
      }
    } catch (err) {
      console.error("❌ Failed to send OTP:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to send OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyPhoneOtp(currentToken, otp);

      console.log("✅ Verify response:", response);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Phone verified successfully!");
        setShowOtpInput(false);
        setOtpSent(false);
        setOtp("");
        flashMsg("✅ Phone number verified!");
        
        // Update user profile with address in Firestore
        if (shipping && user?.id) {
          try {
            console.log("💾 Saving address to Firestore...");
            const addressData = {
              fullName: shipping.fullName || user.name,
              phone: phone.replace(/\D/g, ""),
              address: shipping.address,
              pincode: shipping.pincode,
              city: shipping.city || "",
              state: shipping.state || ""
            };
            
            const updateResponse = await updateUserProfile(currentToken, addressData);
            if (!updateResponse.error) {
              console.log("✅ Address saved to Firestore");
            }
          } catch (err) {
            console.warn("⚠️ Failed to save address:", err.message);
          }
        }
        
        // Fetch fresh user data from backend to confirm verification
        try {
          console.log("📱 Fetching fresh user data with token:", currentToken?.substring(0, 20) + "...");
          const userResponse = await checkPhoneVerification(currentToken);
          console.log("✅ Fresh user data after verification:", userResponse);
          
          if (userResponse.user) {
            setUser({
              ...userResponse.user,
              phoneVerified: true,
              verifiedPhoneNumber: phone
            });
            console.log("✅ User state updated with verified status and address");
          }
        } catch (err) {
          console.error("❌ Could not fetch fresh user data:", err);
          // Fallback: update with local data
          setUser({
            ...user,
            phoneVerified: true,
            verifiedPhoneNumber: phone
          });
        }
        
        // Redirect to transaction page after 1.5 seconds
        console.log("⏳ Redirecting to transaction page...");
        setTimeout(() => {
          setRoute("transaction");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Invalid OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Verify Phone Number</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
          ✓ {success}
        </div>
      )}

      {/* Display shipping info */}
      {shipping && !showOtpInput && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p className="text-sm font-medium text-gray-700">Delivery Address Phone:</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{shipping.phone}</p>
          <p className="text-xs text-gray-600 mt-2">OTP will be sent to this number</p>
        </div>
      )}

      <div className="space-y-4">
        {!showOtpInput ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (10 digits)
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength="10"
                disabled={otpSent || loading}
                className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verification code will be sent to this number
              </p>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || otpSent}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? "Sending..." : otpSent ? "✓ OTP Sent" : "Send OTP"}
            </button>

            <button
              onClick={() => setRoute("checkout")}
              disabled={loading}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-semibold transition"
            >
              Back to Address
            </button>

            <button
              onClick={() => {
                console.log("⏭️  Skipping phone verification - proceeding to payment");
                setSuccess("Skipping phone verification... Proceeding to payment");
                setTimeout(() => setRoute("transaction"), 1500);
              }}
              disabled={loading}
              className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-2 rounded-lg font-semibold transition"
            >
              Skip Phone Verification →
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter 6-digit OTP
              </label>
              <p className="text-xs text-gray-600 mb-2">
                OTP sent to {phone.slice(0, 2)}****{phone.slice(-2)}
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full border-2 border-blue-300 rounded px-3 py-3 text-center text-3xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleSendOtp}
              disabled={timer > 0 || loading}
              className="w-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-300 py-2 rounded-lg font-semibold transition"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>

            <button
              onClick={() => {
                setShowOtpInput(false);
                setOtp("");
                setOtpSent(false);
                setPhone(shipping?.phone || "");
                setTimer(0);
              }}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-semibold transition"
            >
              Change Phone Number
            </button>
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Note:</strong> Phone verification is optional. Verifying your phone helps secure your account, but you can skip it if needed.
        </p>
        <p className="text-xs text-blue-800 mt-2">
          💡 <strong>Tip:</strong> If SMS is slow to arrive, you can verify later in your account settings.
        </p>
      </div>
    </div>
  );
}
