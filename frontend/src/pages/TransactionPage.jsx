import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { currency, isWinter } from "../data/helpers";
import { sendPhoneOtp, verifyPhoneOtp, checkPhoneVerification } from "../api/auth";
import { createPaymentOrder, verifyPayment, handlePaymentFailure } from "../api/payment";

export default function TransactionPage() {
  const { cart, placeOrder, setRoute, user, flashMsg, savedAddress, token } = useApp();

  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Address from CartPage (MongoDB) or CheckoutAddress (new entry)
  const [shipping, setShipping] = useState(null);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Phone OTP verification
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // UPI verification
  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  // Card verification
  const [cardVerified, setCardVerified] = useState(false);

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = isWinter() ? subtotal * 0.25 : 0;
  const total = Math.round(subtotal - discount + (cart.length ? 50 : 0));

  // Load shipping address from MongoDB via context or localStorage as fallback
  useEffect(() => {
    if (savedAddress) {
      // Use address from MongoDB (passed via context from CartPage)
      setShipping(savedAddress);
    } else {
      // Fallback: check localStorage if user entered new address in CheckoutAddress
      const savedShipping = localStorage.getItem("aurie_checkout_shipping");
      if (savedShipping) {
        setShipping(JSON.parse(savedShipping));
      }
    }
  }, [savedAddress]);

  // Check phone verification status on component load and when user changes
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
        }
      } catch (err) {
        console.log("❌ Phone verification check failed:", err);
      }
    };
    
    checkVerification();
  }, [user?.id, token]);

  // Validate card number (basic)
  const isValidCardNumber = (num) => {
    return /^\d{13,19}$/.test(num.replace(/\s/g, ""));
  };

  // Validate expiry date
  const isValidExpiry = (date) => {
    return /^\d{2}\/\d{2}$/.test(date);
  };

  // Validate CVV
  const isValidCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  // Validate UPI ID
  const isValidUPI = (upi) => {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(upi);
  };

  // Verify UPI
  const handleVerifyUPI = () => {
    setError("");
    if (!upiId.trim()) {
      setError("UPI ID is required");
      return;
    }
    if (!isValidUPI(upiId)) {
      setError("Invalid UPI format. Example: name@upi or name@okhdfcbank");
      return;
    }
    setUpiVerified(true);
    flashMsg("UPI verified successfully!");
  };

  // Verify Card
  const handleVerifyCard = () => {
    setError("");
    if (!cardNumber.trim() || !cardName.trim() || !expiryDate.trim() || !cvv.trim()) {
      setError("All card details are required");
      return;
    }
    if (!isValidCardNumber(cardNumber)) {
      setError("Invalid card number. Must be 13-19 digits");
      return;
    }
    if (!isValidExpiry(expiryDate)) {
      setError("Invalid expiry date. Format: MM/YY");
      return;
    }
    if (!isValidCVV(cvv)) {
      setError("Invalid CVV. Must be 3-4 digits");
      return;
    }
    setCardVerified(true);
    flashMsg("Card verified successfully!");
  };

  // Send phone OTP via backend
  const handleSendPhoneOtp = async () => {
    if (!shipping?.phone) {
      setError("Phone number not found in address");
      return;
    }

    // Validate phone format
    if (!/^\d{10}$/.test(shipping.phone)) {
      setError("Invalid phone number format. Phone must be 10 digits.");
      return;
    }

    if (!user?.id) {
      setError("User not logged in");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      console.log("📱 Sending OTP request with:", {
        userId: user.id,
        phone: shipping.phone
      });
      
      const response = await sendPhoneOtp({
        userId: user.id,
        phone: shipping.phone
      });
      
      console.log("✅ OTP sent successfully:", response.data);
      setOtpSent(true);
      setShowPhoneOtp(true);
      setPhoneOtp("");
      flashMsg(`OTP sent to ${shipping.phone.slice(-4)}***`);
    } catch (err) {
      console.error("❌ Failed to send OTP - Full Error:", err);
      console.error("Response Data:", err.response?.data);
      console.error("Error Message:", err.message);
      
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to send OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verify phone OTP via backend
  const handleVerifyPhoneOtp = async () => {
    console.log("🔐 Verifying OTP:", phoneOtp);
    
    if (!phoneOtp) {
      setError("Please enter OTP");
      return;
    }

    if (phoneOtp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    if (!user?.id) {
      setError("User not logged in");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      console.log("📤 Sending verification request:", {
        userId: user.id,
        otp: phoneOtp
      });
      
      const response = await verifyPhoneOtp({
        userId: user.id,
        otp: phoneOtp
      });
      
      console.log("✅ OTP verified successfully:", response.data);
      setPhoneVerified(true);
      setShowPhoneOtp(false);
      setPhoneOtp("");
      setOtpSent(false);
      flashMsg("Phone verified successfully!");
    } catch (err) {
      console.error("❌ OTP verification failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Invalid OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError("All card fields are required");
      return false;
    }

    if (!isValidCardNumber(cardNumber)) {
      setError("Invalid card number");
      return false;
    }

    if (!isValidExpiry(expiryDate)) {
      setError("Expiry date must be MM/YY");
      return false;
    }

    if (!isValidCVV(cvv)) {
      setError("Invalid CVV");
      return false;
    }

    return true;
  };

  async function handlePlace() {
    setError("");

    if (!shipping) {
      setError("Please add delivery address first");
      setRoute("checkout");
      return;
    }

    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    // Phone verification required for ALL payment methods
    if (!phoneVerified) {
      setError("Please verify your phone number to complete your order");
      return;
    }

    // UPI verification required if UPI is selected
    if (method === "UPI") {
      if (!upiVerified) {
        setError("Please verify your UPI to complete your order");
        return;
      }
    }

    // Card verification required if CARD is selected
    if (method === "CARD") {
      if (!cardVerified) {
        setError("Please verify your card to complete your order");
        return;
      }
    }

    try {
      setLoading(true);
      
      // UPI-specific message
      if (method === "UPI") {
        flashMsg("📱 Sending UPI payment request to " + upiId + "...");
      }
      
      console.log("🛒 Starting checkout with method:", method);

      // For COD, place order directly
      if (method === "COD") {
        console.log("📦 Placing COD order...");
        await placeOrder({
          method,
          shippingAddress: shipping,
          upiId: null,
          card: null,
          paymentStatus: "pending"
        });
        console.log("✅ COD order placed successfully");
        flashMsg("✅ Order placed! You'll pay on delivery.");
        localStorage.removeItem("aurie_checkout_shipping");
        setRoute("account");
        return;
      }

      // For UPI and CARD, use Razorpay
      console.log("💳 Creating Razorpay payment order...");
      const paymentResponse = await createPaymentOrder({
        amount: total,
        description: `Order for ${user.email}`,
        customerId: user.id
      });
      console.log("✅ Razorpay order created:", paymentResponse.data.id);

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: paymentResponse.data.key,
          amount: paymentResponse.data.amount,
          currency: "INR",
          name: "Aurie Candles",
          description: `Order Payment - ₹${total}`,
          order_id: paymentResponse.data.id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: shipping.phone
          },
          theme: { color: "#ff6b6b" },
          method: {
            upi: method === "UPI",
            card: method === "CARD",
            wallet: false,
            netbanking: false,
            emandate: false
          },
          handler: async function(response) {
            try {
              // UPI-specific message
              if (method === "UPI") {
                flashMsg("✅ Payment request approved in your UPI app! Processing...");
              }
              
              console.log("✅ Payment successful! Creating order...");
              // Create order first
              const orderResponse = await placeOrder({
                method,
                shippingAddress: shipping,
                upiId: method === "UPI" ? upiId : null,
                card: method === "CARD" ? { last4: cardNumber.slice(-4), name: cardName } : null,
                razorpayOrderId: paymentResponse.data.id,
                paymentStatus: "paid"
              });

              console.log("✅ Order created:", orderResponse);

              // Then verify payment
              await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderResponse.id || orderResponse._id
              });

              flashMsg("🎉 Payment successful! Money transferred to Aurie Candles. Order confirmed.");
              localStorage.removeItem("aurie_checkout_shipping");
              setTimeout(() => setRoute("account"), 1500);
            } catch (err) {
              console.error("❌ Error:", err);
              setError("Payment verified but order creation failed: " + err.message);
              try {
                await handlePaymentFailure({
                  orderId: orderResponse?.id || orderResponse?._id,
                  reason: "Order creation failed"
                });
              } catch (e) {
                console.error("Error handling payment failure:", e);
              }
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function() {
              console.log("❌ Payment cancelled/denied by user - UPI payment not approved");
              setError("❌ UPI payment denied. Please try again or use another payment method.");
              setLoading(false);
            }
          }
        };

        console.log("🔓 Opening Razorpay modal for", method);
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setError("Error: " + (err.message || "Failed to process payment"));
      setLoading(false);
    }
  }

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
        <h2 className="text-xl font-semibold">Delivery Address Required</h2>
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

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6">Complete Your Order</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Verified Address & Phone Summary */}
      {shipping && phoneVerified && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-green-900 mb-3">✓ Verified Delivery Details</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{shipping.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-semibold">{shipping.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Pincode</p>
              <p className="font-semibold">{shipping.pincode}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">{shipping.address.substring(0, 30)}...</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Address & Payment */}
        <div className="md:col-span-2">
          {/* Delivery Address */}
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-3">Delivery Address</h3>
            <p className="text-sm"><strong>Name:</strong> {shipping.fullName}</p>
            <p className="text-sm"><strong>Phone:</strong> {shipping.phone}</p>
            <p className="text-sm"><strong>Pincode:</strong> {shipping.pincode}</p>
            <p className="text-sm"><strong>Address:</strong> {shipping.address}</p>
            <button
              onClick={() => setRoute("checkout")}
              className="mt-3 px-3 py-1 text-orange-500 border border-orange-500 rounded text-sm"
            >
              Edit Address
            </button>
          </div>

          {/* Payment Method */}
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-3">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={method === "COD"}
                  onChange={() => setMethod("COD")}
                  className="mr-2"
                />
                <span>Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  checked={method === "UPI"}
                  onChange={() => setMethod("UPI")}
                  className="mr-2"
                />
                <span>UPI Payment</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  checked={method === "CARD"}
                  onChange={() => setMethod("CARD")}
                  className="mr-2"
                />
                <span>Debit/Credit Card</span>
              </label>
            </div>
          </div>

          {/* UPI Details */}
          {method === "UPI" && (
            <div className="border rounded-lg p-4 mb-6 bg-purple-50">
              <h3 className="font-bold text-lg mb-4">UPI Payment</h3>

              {!upiVerified ? (
                <>
                  <div className="mb-3">
                    <label className="text-sm font-medium">UPI ID</label>
                    <input
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                      className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: name@upi or name@bankname</p>
                  </div>
                  <button
                    onClick={handleVerifyUPI}
                    disabled={!upiId || loading}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 rounded font-medium transition"
                  >
                    {loading ? "Verifying..." : "Verify UPI"}
                  </button>
                </>
              ) : (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <p className="text-green-700 font-bold text-lg mb-2">✓ UPI Verified</p>
                    <p className="text-sm text-green-600 mb-3">{upiId}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Payment Amount</p>
                    <p className="text-3xl font-bold text-orange-600 mb-3">₹{total}</p>
                    <p className="text-xs text-gray-500">Will be transferred to Aurie Candles</p>
                  </div>

                  {/* Info box about what happens */}
                  <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-4">
                    <p className="text-xs text-blue-800 font-medium mb-2">💡 How it works:</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>Click "Pay Now" to send payment request to your UPI app</li>
                      <li>Approve the ₹{total} payment in your bank/UPI app</li>
                      <li>Money will transfer to Aurie Candles Razorpay account</li>
                      <li>Order will be automatically confirmed</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        // Generate UPI string for QR code
                        const upiString = `upi://pay?pa=${upiId}&pn=AurieCandles&am=${total}&tn=Order%20Payment`;
                        // Open in new window or download QR
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`, '_blank');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-medium transition flex items-center justify-center gap-2"
                    >
                      <span>📱 QR Code</span>
                    </button>
                    
                    <button
                      onClick={handlePlace}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded font-bold transition"
                    >
                      {loading ? "Sending Request..." : "💰 Pay Now"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 text-center font-medium">
                    Choose: Scan QR code in your UPI app OR click "Pay Now"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Card Details */}
          {method === "CARD" && (
            <div className="border rounded-lg p-4 mb-6 bg-blue-50">
              <h3 className="font-bold text-lg mb-4">Card Verification</h3>

              {!cardVerified ? (
                <>
                  <div className="mb-3">
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <input
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-sm font-medium">Card Number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                      maxLength="19"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-sm font-medium">Expiry (MM/YY)</label>
                      <input
                        placeholder="12/25"
                        value={expiryDate}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) {
                            val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          }
                          setExpiryDate(val);
                        }}
                        maxLength="5"
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">CVV</label>
                      <input
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        maxLength="4"
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyCard}
                    disabled={!cardNumber || !cardName || !expiryDate || !cvv || loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded font-medium transition"
                  >
                    {loading ? "Verifying..." : "Verify Card"}
                  </button>
                </>
              ) : (
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-green-700 text-sm font-medium">✓ Card verified: {cardNumber.slice(-4)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="border rounded-lg p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>

            <div className="space-y-2 text-sm mb-4 pb-4 border-b">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.qty}</span>
                  <span>{currency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Winter Discount</span>
                  <span>-{currency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{currency(cart.length ? 50 : 0)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlace}
              disabled={loading || !phoneVerified || (method === "UPI" && !upiVerified) || (method === "CARD" && !cardVerified)}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? "Processing..." : !phoneVerified ? "Verify Phone First" : method === "UPI" && !upiVerified ? "Verify UPI First" : method === "CARD" && !cardVerified ? "Verify Card First" : method === "UPI" && upiVerified ? `Pay ₹${total} via UPI` : method === "CARD" && cardVerified ? `Pay ₹${total} via Card` : "Place Order"}
            </button>

            <button
              onClick={() => setRoute("checkout")}
              className="w-full mt-2 border border-gray-300 py-2 rounded-lg text-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
