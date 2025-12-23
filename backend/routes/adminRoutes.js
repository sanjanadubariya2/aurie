import express from "express";
import { getDB } from "../config/firebase.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getIO } from "../utils/socket.js";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // For demo: check if email matches admin email
    // In production, store admin users in database with hashed passwords
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aurie.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = password === ADMIN_PASSWORD;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken("admin");
    const admin = {
      id: "admin",
      name: "Admin",
      email: ADMIN_EMAIL
    };

    res.json({
      message: "Admin login successful",
      admin,
      token
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Helper function to get user by ID
const getUserById = async (userId) => {
  const db = getDB();
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// Get all orders (for admin dashboard)
router.get("/all", async (req, res) => {
  try {
    const db = getDB();
    const snapshot = await db.collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders = [];
    for (const doc of snapshot.docs) {
      const orderData = { id: doc.id, ...doc.data() };
      
      // Get user details
      if (orderData.userId) {
        const user = await getUserById(orderData.userId);
        if (user) {
          orderData.user = {
            name: user.name,
            email: user.email,
            phone: user.phone
          };
        }
      }
      
      orders.push(orderData);
    }

    res.json(orders);
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// Get order by ID
router.get("/:orderId", async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection("orders").doc(req.params.orderId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = { id: doc.id, ...doc.data() };

    // Get user details
    if (orderData.userId) {
      const user = await getUserById(orderData.userId);
      if (user) {
        orderData.user = {
          name: user.name,
          email: user.email,
          phone: user.phone
        };
      }
    }

    res.json(orderData);
  } catch (err) {
    console.error("Fetch Order Error:", err);
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
});

// Update order status - WITH SOCKET NOTIFICATION
router.post("/:orderId/update-status", async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "Order Placed",
      "Confirmed",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const db = getDB();
    const doc = await db.collection("orders").doc(orderId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = doc.data();

    // Update payment status if order is delivered
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === "Delivered" && orderData.paymentStatus === "pending") {
      updateData.paymentStatus = "paid";
    }

    await db.collection("orders").doc(orderId).update(updateData);

    const updatedOrder = { id: orderId, ...orderData, ...updateData };

    // Emit socket events
    const io = getIO();
    if (io) {
      console.log("🔔 Emitting orderUpdated event for order:", orderId);
      io.emit('orderUpdated', updatedOrder);
      io.emit('orderStatusUpdate', {
        orderId,
        status,
        message: `Order status updated to ${status}`
      });
    }

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
});

// Confirm order (from admin)
router.post("/:orderId/confirm", async (req, res) => {
  try {
    const { orderId } = req.params;

    const db = getDB();
    const doc = await db.collection("orders").doc(orderId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = doc.data();

    // Update status to Confirmed
    await db.collection("orders").doc(orderId).update({
      status: "Confirmed",
      updatedAt: new Date()
    });

    const updatedOrder = { id: orderId, ...orderData, status: "Confirmed", updatedAt: new Date() };

    // Emit socket event
    const io = getIO();
    if (io) {
      console.log("🔔 Order confirmed by admin:", orderId);
      io.emit('orderConfirmed', {
        orderId,
        status: "Confirmed",
        customerName: orderData.customerName
      });
    }

    res.json({
      message: "Order confirmed successfully",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Confirm Order Error:", err);
    res.status(500).json({ message: "Failed to confirm order", error: err.message });
  }
});

// Get order statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const db = getDB();

    // Get all orders
    const snapshot = await db.collection("orders").get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push(doc.data());
    });

    const total = orders.length;
    const pending = orders.filter(o => o.status === "Order Placed").length;
    const confirmed = orders.filter(o => o.status === "Confirmed").length;
    const shipped = orders.filter(o => o.status === "Shipped").length;
    const delivered = orders.filter(o => o.status === "Delivered").length;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      revenue
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch statistics", error: err.message });
  }
});

export default router;
