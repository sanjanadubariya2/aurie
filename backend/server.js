import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeFirebase } from "./config/firebase.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Firebase/Mock DB
initializeFirebase();

const app = express();

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
      "http://127.0.0.1:3000"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
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

// Product routes
app.use("/api/products", productRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

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
app.listen(PORT, () => {
  console.log(`\n✅ Aurie Candles Backend`);
  console.log(`📦 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💾 Database: Firestore (with Mock DB fallback)\n`);
});

