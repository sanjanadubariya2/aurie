import express from "express";
import { getDB } from "../config/firebase.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getIO } from "../utils/socket.js";
import { sendOrderConfirmationToCustomer } from "../utils/sendEmail.js";

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

// ============ PRODUCTS MANAGEMENT ============
// MUST COME BEFORE /:orderId ROUTE TO AVOID ROUTE MATCHING CONFLICTS

// Get all products
router.get("/products", async (req, res) => {
  try {
    const db = getDB();
    const snapshot = await db.collection("products").get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json({ message: "Products retrieved", products });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// Get single product
router.get("/products/:productId", async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection("products").doc(req.params.productId).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
});

// Create product
router.post("/products", async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const db = getDB();
    const newProduct = {
      name,
      price: parseFloat(price),
      description: description || "",
      image: image || "",
      category: category || "Candles",
      stock: parseInt(stock) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection("products").add(newProduct);
    const createdProduct = { id: docRef.id, ...newProduct };
    
    console.log("✅ Product created:", docRef.id);
    
    // Emit Socket.io event for real-time updates
    const io = getIO();
    if (io) {
      console.log("🔔 Emitting productCreated event for:", createdProduct.name);
      io.emit('productCreated', createdProduct);
    }
    
    res.json({ 
      message: "Product created successfully", 
      product: createdProduct 
    });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});

// Update product
router.put("/products/:productId", async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;
    const db = getDB();
    const productRef = db.collection("products").doc(req.params.productId);

    const doc = await productRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {
      ...(name && { name }),
      ...(price && { price: parseFloat(price) }),
      ...(description !== undefined && { description }),
      ...(image && { image }),
      ...(category && { category }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      updatedAt: new Date()
    };

    await productRef.update(updateData);
    const updatedProduct = { id: req.params.productId, ...doc.data(), ...updateData };
    
    console.log("✅ Product updated:", req.params.productId);
    
    // Emit Socket.io event for real-time updates
    const io = getIO();
    if (io) {
      console.log("🔔 Emitting productUpdated event for:", updatedProduct.name);
      io.emit('productUpdated', updatedProduct);
    }
    
    res.json({ 
      message: "Product updated successfully", 
      product: updatedProduct 
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

// Delete product
router.delete("/products/:productId", async (req, res) => {
  try {
    const db = getDB();
    const productRef = db.collection("products").doc(req.params.productId);

    const doc = await productRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    await productRef.delete();
    
    console.log("✅ Product deleted:", req.params.productId);
    
    // Emit Socket.io event for real-time updates
    const io = getIO();
    if (io) {
      console.log("🔔 Emitting productDeleted event for:", req.params.productId);
      io.emit('productDeleted', req.params.productId);
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

// ============ ORDERS MANAGEMENT ============

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

    // Send confirmation email to customer when status changes to Confirmed
    if (status === "Confirmed" && orderData.status !== "Confirmed") {
      try {
        await sendOrderConfirmationToCustomer(updatedOrder);
        console.log("✅ Customer confirmation email sent for status update");
      } catch (emailErr) {
        console.warn("⚠️ Failed to send customer confirmation email:", emailErr.message);
        // Don't fail the status update if email fails
      }
    }

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

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationToCustomer({
        id: orderId,
        ...updatedOrder
      });
      console.log("✅ Customer confirmation email sent");
    } catch (emailErr) {
      console.warn("⚠️ Failed to send customer confirmation email:", emailErr.message);
      // Don't fail the confirmation if email fails
    }

    // Emit socket event
    const io = getIO();
    if (io) {
      console.log("🔔 Order confirmed by admin:", orderId);
      io.emit('orderConfirmed', {
        orderId,
        status: "Confirmed",
        customerName: orderData.customerName
      });
      io.emit('orderUpdated', updatedOrder);
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
// ============ CUSTOMERS MANAGEMENT ============

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    const db = getDB();
    const snapshot = await db.collection("users").get();
    const customers = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      customers.push({ 
        id: doc.id, 
        name: userData.name || 'Unknown',
        email: userData.email || '',
        phone: userData.phone || '',
        emailVerified: userData.emailVerified || false,
        phoneVerified: userData.phoneVerified || false,
        createdAt: userData.createdAt || null
      });
    });
    console.log(`✅ Retrieved ${customers.length} customers from database`);
    res.json({ message: "Customers retrieved", customers });
  } catch (err) {
    console.error("Get Customers Error:", err);
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
});

// Get customer details with orders
router.get("/customers/:customerId", async (req, res) => {
  try {
    const db = getDB();
    const customerDoc = await db.collection("users").doc(req.params.customerId).get();
    
    if (!customerDoc.exists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customerData = customerDoc.data();

    // Get customer's orders
    const ordersSnapshot = await db.collection("orders")
      .where("userId", "==", req.params.customerId)
      .get();
    
    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Retrieved customer ${req.params.customerId} with ${orders.length} orders`);

    res.json({ 
      id: customerDoc.id,
      name: customerData.name || 'Unknown',
      email: customerData.email || '',
      phone: customerData.phone || '',
      emailVerified: customerData.emailVerified || false,
      phoneVerified: customerData.phoneVerified || false,
      createdAt: customerData.createdAt || null,
      orders
    });
  } catch (err) {
    console.error("Get Customer Error:", err);
    res.status(500).json({ message: "Failed to fetch customer", error: err.message });
  }
});

// ============ ORDER MANAGEMENT - ENHANCED ============

// Update order status (Pending → Confirmed → Shipped → Delivered)
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Order Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Valid statuses: " + validStatuses.join(", ") 
      });
    }

    const db = getDB();
    const orderRef = db.collection("orders").doc(req.params.orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      statusHistory: [...(doc.data().statusHistory || []), { status, updatedAt: new Date() }]
    };

    await orderRef.update(updateData);

    // Emit real-time update via socket
    const io = getIO();
    if (io) {
      io.emit("orderUpdated", { id: req.params.orderId, ...doc.data(), ...updateData });
    }

    console.log("✅ Order status updated:", req.params.orderId, "→", status);
    res.json({ 
      message: "Order status updated successfully", 
      order: { id: req.params.orderId, ...doc.data(), ...updateData } 
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ message: "Failed to update order status", error: err.message });
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
    const revenue = orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

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
