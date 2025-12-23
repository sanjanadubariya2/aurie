import express from "express";
import { getDB } from "../config/firebase.js";
import { getIO } from "../utils/socket.js";

const router = express.Router();

// Helper function to get user by ID
const getUserById = async (userId) => {
  const db = getDB();
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// Place a new order
router.post("/place", async (req, res) => {
  try {
    const { items, subtotal, discount, shipping, total, userId, customerName, customerEmail, customerPhone, paymentMethod, paymentStatus, shippingAddress, razorpayOrderId } = req.body;

    console.log("📦 New order received:", { userId, customerName, total });

    const db = getDB();
    
    // Create order in Firestore
    const orderRef = await db.collection("orders").add({
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      razorpayOrderId: razorpayOrderId || null,
      subtotal,
      discount,
      shipping,
      total,
      status: paymentStatus === "paid" ? "Confirmed" : "Order Placed",
      trackingId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const orderId = orderRef.id;
    const newOrder = {
      id: orderId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      razorpayOrderId: razorpayOrderId || null,
      subtotal,
      discount,
      shipping,
      total,
      status: paymentStatus === "paid" ? "Confirmed" : "Order Placed",
      trackingId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("✅ Order saved to Firestore:", orderId);

    // Emit socket event to admins
    const io = getIO();
    if (io) {
      console.log("🔔 Emitting newOrder event to admin dashboard");
      io.emit('newOrder', newOrder);
      io.emit('orderStatusUpdate', {
        orderId,
        status: newOrder.status,
        message: `New order placed by ${customerName}`
      });
    } else {
      console.log("⚠️ Socket.io not initialized");
    }

    res.status(201).json({ ...newOrder, id: orderId });
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

// Get user's orders
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const db = getDB();
    const snapshot = await db.collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json(orders);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get specific order by ID
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const db = getDB();
    const doc = await db.collection("orders").doc(orderId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Add delivery address
router.post("/add-address", async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (!userId || !address) {
      return res.status(400).json({ message: "UserId and address are required" });
    }

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const existingAddresses = user.deliveryAddresses || [];
    existingAddresses.push(address);

    const db = getDB();
    await db.collection("users").doc(userId).update({
      deliveryAddresses: existingAddresses,
      updatedAt: new Date()
    });

    res.json({ msg: "Address saved", addresses: existingAddresses });
  } catch (err) {
    console.error("Add Address Error:", err);
    res.status(500).json({ message: "Failed to add address" });
  }
});

export default router;

