import Razorpay from "razorpay";
import crypto from "crypto";
import { getDB } from "../config/firebase.js";

// Initialize Razorpay instance with fallback for missing keys
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET
    });
  } else {
    console.warn("⚠️  Razorpay keys not configured - payment functionality disabled");
  }
} catch (err) {
  console.warn("⚠️  Razorpay initialization failed:", err.message);
}

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: "Payment service not configured" });
    }

    const { amount, description, customerId } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      description: description || "Aurie Candles Purchase",
      notes: {
        customerId: customerId || "guest"
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY
    });
  } catch (err) {
    console.error("Razorpay Order Creation Error:", err);
    res.status(500).json({ message: "Failed to create payment order", error: err.message });
  }
};

// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ message: "Payment service not configured" });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Payment details are required" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order in Firestore
    if (orderId) {
      const db = getDB();
      const doc = await db.collection("orders").doc(orderId).get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Order not found" });
      }

      await db.collection("orders").doc(orderId).update({
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: "Confirmed",
        updatedAt: new Date()
      });

      const updatedOrder = { id: orderId, ...doc.data() };

      return res.json({
        message: "Payment verified successfully",
        order: updatedOrder
      });
    }

    res.json({
      message: "Payment verified successfully",
      paymentId: razorpayPaymentId
    });
  } catch (err) {
    console.error("Payment Verification Error:", err);
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
};

// Handle Payment Failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (orderId) {
      const db = getDB();
      await db.collection("orders").doc(orderId).update({
        paymentStatus: "failed",
        status: "Order Placed",
        updatedAt: new Date()
      });
    }

    res.json({
      message: "Payment failure recorded",
      reason
    });
  } catch (err) {
    console.error("Payment Failure Handler Error:", err);
    res.status(500).json({ message: "Failed to record payment failure", error: err.message });
  }
};

