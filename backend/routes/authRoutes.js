import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDB } from "../config/firebase.js";
import generateToken from "../utils/generateToken.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { sendOTPSMS } from "../utils/sendSMS.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ============ HELPERS ============
const getUserByEmail = async (email) => {
  const db = getDB();
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

const getUserById = async (id) => {
  const db = getDB();
  const doc = await db.collection("users").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ============ SIGNUP ============
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔐 Signup attempt:", { name, email });

    if (!name || !email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "Name, email, password required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("❌ Invalid email format");
      return res.status(400).json({ error: "Invalid email" });
    }

    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({ error: "Password min 6 chars" });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      console.log("❌ Email already registered");
      return res.status(400).json({ error: "Email already registered" });
    }

    console.log("✅ Validation passed, hashing password...");
    const hashed = await bcrypt.hash(password, 10);
    const db = getDB();

    console.log("✅ Adding user to database...");
    const userRef = await db.collection("users").add({
      name,
      email,
      password: hashed,
      emailVerified: false,
      phoneVerified: false,
      phone: null,
      createdAt: new Date(),
    });

    console.log("✅ User created with ID:", userRef.id);
    const token = jwt.sign({ userId: userRef.id }, JWT_SECRET, { expiresIn: "7d" });

    // Generate and send email OTP
    const emailOTP = generateOTP();
    console.log(`📧 Generated OTP: ${emailOTP} for ${email}`);
    
    await db.collection("otps").add({
      userId: userRef.id,
      email,
      code: emailOTP,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    });

    console.log("✅ OTP stored in database");
    const emailResult = await sendOTPEmail(email, emailOTP);
    console.log("Email result:", emailResult);

    console.log(`✅ Signup successful for ${email}`);
    res.json({
      success: true,
      user: { id: userRef.id, name, email },
      token,
      msg: emailResult.success ? "Signup successful. Check email for OTP." : "Signup successful but email may not have been sent. Try resending.",
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Signup failed: " + err.message });
  }
});

// ============ LOGIN ============
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ============ GET ME ============
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error("Get me error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
});

// ============ SEND EMAIL OTP ============
router.post("/send-email-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.json({ msg: "Email already verified" });

    const db = getDB();

    // Generate OTP
    const emailOTP = generateOTP();
    await db.collection("otps").add({
      userId: user.id,
      email: user.email,
      code: emailOTP,
      type: "email",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    await sendOTPEmail(user.email, emailOTP);

    res.json({ success: true, msg: "OTP sent to email" });
  } catch (err) {
    console.error("Send email OTP error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ============ VERIFY EMAIL OTP ============
router.post("/verify-email-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: "OTP required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const db = getDB();

    // Find matching OTP
    const snap = await db
      .collection("otps")
      .where("userId", "==", user.id)
      .where("type", "==", "email")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) return res.status(400).json({ error: "No OTP found" });

    const otpDoc = snap.docs[0].data();
    if (otpDoc.code !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > otpDoc.expiresAt) return res.status(400).json({ error: "OTP expired" });

    // Mark email as verified
    await db.collection("users").doc(user.id).update({ emailVerified: true });

    res.json({ success: true, msg: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email OTP error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ============ SEND PHONE OTP ============
router.post("/send-phone-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("📱 [Phone OTP Request] Token received:", !!token);
    
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { phone } = req.body;
    console.log("📱 [Phone OTP Request] Phone:", phone);
    
    if (!phone) return res.status(400).json({ error: "Phone required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("📱 [Phone OTP Request] User ID:", decoded.userId);
    
    const user = await getUserById(decoded.userId);
    console.log("📱 [Phone OTP Request] User found:", !!user);
    console.log("📱 [Phone OTP Request] Email verified:", user?.emailVerified);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.emailVerified) {
      console.log("❌ [Phone OTP] Email not verified yet");
      return res.status(400).json({ error: "Please verify email first" });
    }

    const db = getDB();

    // Generate OTP
    const phoneOTP = generateOTP();
    console.log(`📱 [Phone OTP] Generated for ${phone}: ${phoneOTP}`);
    
    await db.collection("otps").add({
      userId: user.id,
      phone,
      code: phoneOTP,
      type: "phone",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });

    console.log("✅ [Phone OTP] Saved to database");

    // Send SMS
    console.log("📱 [SMS] Sending SMS to", phone);
    const smsResult = await sendOTPSMS(phone, phoneOTP);
    console.log("📱 [SMS] Result:", smsResult);

    if (!smsResult.success) {
      console.error("❌ [SMS] Failed:", smsResult);
      return res.status(500).json({ error: "Failed to send SMS: " + smsResult.message });
    }

    // Update user phone
    await db.collection("users").doc(user.id).update({ phone });
    console.log("✅ [Phone OTP] User phone updated");

    res.json({ success: true, msg: "OTP sent to phone", demo: smsResult.demo });
  } catch (err) {
    console.error("❌ [Phone OTP Error]", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Failed to send OTP: " + err.message });
  }
});

// ============ VERIFY PHONE OTP ============
router.post("/verify-phone-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: "OTP required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.emailVerified) return res.status(400).json({ error: "Verify email first" });

    const db = getDB();

    // Find matching OTP
    const snap = await db
      .collection("otps")
      .where("userId", "==", user.id)
      .where("type", "==", "phone")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) return res.status(400).json({ error: "No OTP found" });

    const otpDoc = snap.docs[0].data();
    if (otpDoc.code !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > otpDoc.expiresAt) return res.status(400).json({ error: "OTP expired" });

    // Mark phone as verified
    await db.collection("users").doc(user.id).update({ phoneVerified: true });

    res.json({ success: true, msg: "Phone verified successfully" });
  } catch (err) {
    console.error("Verify phone OTP error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
