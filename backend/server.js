import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeFirebase, isFirebaseActive } from "./config/firebase.js";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { setIO } from "./utils/socket.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Firebase/Mock DB
initializeFirebase();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL || "https://aurie-production.up.railway.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
setIO(io);

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:3000",
      "https://aurie-production.up.railway.app",
      "https://aurie-frontend-diu9uetwk-sanjanadubariya2-5518s-projects.vercel.app",
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Check if origin is in allowed list or is a Vercel preview deployment
    const isVercelPreview = origin && origin.includes("vercel.app");
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS: Origin not allowed: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  console.log("  Origin:", req.get("origin") || "none");
  console.log("  Content-Type:", req.get("content-type") || "none");
  next();
});

// ============ ROUTES ============
app.get("/", (req, res) => {
  res.json({ message: "✅ Aurie Candles API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: "firestore (with Mock DB fallback)",
    timestamp: new Date()
  });
});

// Auth routes
app.use("/api/auth", authRoutes);
console.log("✅ Auth routes registered at /api/auth");

// Admin routes
app.use("/api/admin", adminRoutes);
console.log("✅ Admin routes registered at /api/admin");

// Product routes
app.use("/api/products", productRoutes);
console.log("✅ Product routes registered at /api/products");

// Order routes
app.use("/api/orders", orderRoutes);
console.log("✅ Order routes registered at /api/orders");

// 404 handler
app.use((req, res) => {
  console.warn(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  const dbStatus = isFirebaseActive() 
    ? "✅ Firestore" 
    : "⚠️  MockDB (Firestore not available)";
  
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  ✅ Aurie Candles Backend              ║`);
  console.log(`║  📦 http://localhost:${PORT}`.padEnd(41) + "║");
  console.log(`║  📊 Database: ${dbStatus}`.padEnd(41) + "║");
  console.log(`║  🔌 Socket.io: ✅ Enabled`.padEnd(41) + "║");
  console.log(`╚════════════════════════════════════════╝\n`);
  
  if (!isFirebaseActive()) {
    console.log(`⚠️  NOTE: Firestore API is not enabled.`);
    console.log(`   Data will NOT persist across server restarts.`);
    console.log(`   To enable Firestore:`);
    console.log(`   1. Go to: https://console.cloud.google.com/`);
    console.log(`   2. Enable "Cloud Firestore API"`);
    console.log(`   3. Create a Firestore database`);
    console.log(`   4. Restart the backend`);
    console.log(`   📖 See FIRESTORE_SETUP_GUIDE.md for detailed steps\n`);
  }
});

