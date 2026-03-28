import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { checkPhoneVerification } from "../api/auth";

export default function CheckoutAddress() {
  const { cart, setRoute, user, flashMsg } = useApp();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user already has verified phone
  useEffect(() => {
    const checkVerification = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await checkPhoneVerification({ userId: user.id });
        if (response.data?.phoneVerified && response.data?.verifiedPhoneNumber) {
          setPhoneVerified(true);
          setPhone(response.data.verifiedPhoneNumber);
          
          // Load saved address from localStorage
          const savedShipping = localStorage.getItem("aurie_checkout_shipping");
          if (savedShipping) {
            const shipping = JSON.parse(savedShipping);
            setFullName(shipping.fullName);
            setPincode(shipping.pincode);
            setAddress(shipping.address);
          }
        }
      } catch (err) {
        console.error("Error checking verification:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkVerification();
  }, [user?.id]);

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

  // Validate phone number (10 digits)
  const isValidPhone = (phoneNum) => {
    return /^\d{10}$/.test(phoneNum.replace(/\D/g, ""));
  };

  // Validate pincode
  const isValidPincode = (pin) => {
    return /^\d{6}$/.test(pin);
  };

  const handleContinue = async () => {
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (!pincode.trim()) {
      setError("Pincode is required");
      return;
    }

    if (!isValidPincode(pincode)) {
      setError("Pincode must be 6 digits");
      return;
    }

    if (!address.trim()) {
      setError("Address is required");
      return;
    }

    if (address.trim().length < 10) {
      setError("Address must be at least 10 characters");
      return;
    }

    // Save shipping info to localStorage
    const shipping = { 
      fullName: fullName.trim(), 
      phone: phone.replace(/\D/g, ""),
      pincode: pincode.trim(), 
      address: address.trim(),
      city: "",
      state: ""
    };
    
    localStorage.setItem("aurie_checkout_shipping", JSON.stringify(shipping));
    flashMsg("Address saved!");
    
    // If phone already verified, go directly to transaction page
    // Otherwise, go to phone verification page
    if (phoneVerified) {
      console.log("✅ Phone verified - proceeding to transaction");
      flashMsg("Address saved. Proceeding to payment...");
      setRoute("transaction");
    } else {
      console.log("⚠️ Phone not verified - redirecting to verification");
      flashMsg("Address saved. Verifying phone...");
      setRoute("phone-verify");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow mt-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Delivery Address</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits) *</label>
          {phoneVerified ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
              <p className="text-green-700 font-semibold">✓ {phone}</p>
              <p className="text-xs text-green-600 mt-1">Phone already verified</p>
            </div>
          ) : (
            <>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength="10"
                className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">Phone verification required for all payment methods</p>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (6 digits) *</label>
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            maxLength="6"
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House number, street, city, state"
            rows="4"
            className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{address.length} / minimum 10 characters</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleContinue}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
        >
          Continue to Payment
        </button>

        <button
          onClick={() => setRoute("cart")}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition"
        >
          Back to Cart
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Note:</strong> Phone verification is required for all payment methods (COD, UPI, Card) for security purposes.
        </p>
      </div>
    </div>
  );
}
