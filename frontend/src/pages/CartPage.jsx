import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { currency, isWinter } from "../data/helpers";
import { checkPhoneVerification } from "../api/auth";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, setRoute, user, setSavedAddress, token } = useApp();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);

  // Check if user's phone is already verified and has saved address
  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Get user from context
        if (!user?.id || !token) {
          console.log("❌ No user or token");
          // Still check user.phoneVerified directly from context
          if (user?.phoneVerified) {
            console.log("✅ User already has phoneVerified flag in context");
            setPhoneVerified(true);
          }
          setVerificationChecked(true);
          return;
        }
        
        console.log("🔍 Checking verification for user:", user.id);
        const response = await checkPhoneVerification(token);
        console.log("✅ Phone verification response:", response);
        
        if (response.user?.phoneVerified) {
          setPhoneVerified(true);
          console.log("✅ Phone verified from backend:", response.user.phoneVerified);
        } else {
          setPhoneVerified(false);
        }
        
        // Check if user has saved addresses in database
        if (response.user?.deliveryAddresses && response.user.deliveryAddresses.length > 0) {
          console.log("📍 User has saved addresses:", response.user.deliveryAddresses);
          setHasAddress(true);
          // Save the address data to context (Firestore data)
          const savedAddr = response.user.deliveryAddresses[0];
          console.log("✏️ Loading saved address:", savedAddr);
          setSavedAddress({
            fullName: savedAddr.fullName || user.name,
            phone: savedAddr.phone,
            pincode: savedAddr.pincode,
            address: savedAddr.line1,
            city: savedAddr.city,
            state: savedAddr.state
          });
        } else {
          console.log("⚠️ User has no saved addresses");
          setHasAddress(false);
        }
      } catch (err) {
        console.error("❌ Error checking phone verification:", err);
        // Fallback: check user.phoneVerified directly
        if (user?.phoneVerified) {
          setPhoneVerified(true);
        }
      } finally {
        setVerificationChecked(true);
      }
    };
    checkVerification();
  }, [user?.id, user?.name, user?.phoneVerified, token, setSavedAddress]);

  const handleCheckout = () => {
    const isPhoneVerified = user?.phoneVerified || phoneVerified;
    
    console.log("🛒 Checkout button clicked");
    console.log("   - phoneVerified (state):", phoneVerified);
    console.log("   - user.phoneVerified (context):", user?.phoneVerified);
    console.log("   - hasAddress:", hasAddress);
    console.log("   - isPhoneVerified (combined):", isPhoneVerified);
    
    // If phone verified AND has address, go directly to transaction
    if (isPhoneVerified && hasAddress) {
      console.log("✅ Phone verified with address → Transaction");
      setRoute("transaction");
    }
    // If phone verified but NO address, go to address page
    else if (isPhoneVerified && !hasAddress) {
      console.log("✅ Phone verified, no address → Checkout for address");
      setRoute("checkout");
    }
    // If phone NOT verified, go to checkout (handles address + verification)
    else {
      console.log("⚠️ Phone not verified → Checkout for address + verification");
      setRoute("checkout");
    }
  };

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = isWinter() ? subtotal * 0.25 : 0;
  const total = Math.round(subtotal - discount + (cart.length ? 50 : 0));

  return (
    <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800">🛒 Your Cart</h2>

      {cart.length === 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">Cart is empty.</p>
          <button
            onClick={() => setRoute("home")}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map(it => (
            <div
              key={it.id}
              className="flex items-center gap-3 border-b pb-3 last:border-b-0"
            >
              <img
                src={it.images[0]}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                alt={it.title}
              />

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-base line-clamp-2">{it.title}</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-1">
                  {currency(it.price)}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQty(it.id, it.qty - 1)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                >
                  −
                </button>

                <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold">{it.qty}</div>

                <button
                  onClick={() => updateQty(it.id, it.qty + 1)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(it.id)}
                className="text-red-500 text-xs sm:text-sm font-semibold flex-shrink-0 ml-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* PRICE CARD */}
        {cart.length > 0 && (
          <div>
            <div className="p-3 sm:p-4 border rounded-xl sticky top-20">
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{currency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600">Winter Discount</span>
                <span className="font-semibold text-green-600">-{currency(discount)}</span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm mb-3">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{currency(cart.length ? 50 : 0)}</span>
              </div>

              <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-3 text-pink-600">
                <span>Total</span>
                <span>{currency(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-4 w-full px-4 py-2 sm:py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold text-sm sm:text-base transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
