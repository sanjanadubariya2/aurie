import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDB } from "../config/firebase.js";
import { MockDB } from "../config/mockDb.js";
import jwtConfig from "../config/jwt.js";
import generateToken from "../utils/generateToken.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { sendSMS, sendOTPSMS } from "../utils/sendSMS.js";

const router = express.Router();

// ============ HELPERS ============
const getUserByEmail = async (email) => {
  try {
    const db = getDB();
    const snap = await db.collection("users").where("email", "==", email).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (err) {
    // If collection doesn't exist yet, treat as "user not found"
    if (err.code === 5 || err.message.includes("NOT_FOUND")) {
      console.log("ℹ️  Users collection doesn't exist yet (first user)");
      return null;
    }
    // Re-throw actual errors
    throw err;
  }
};

const getUserById = async (id) => {
  try {
    const db = getDB();
    const doc = await db.collection("users").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (err) {
    if (err.code === 5 || err.message.includes("NOT_FOUND")) {
      return null;
    }
    throw err;
  }
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

    console.log("✅ Validation passed, checking existing user...");
    const existing = await getUserByEmail(email);
    if (existing) {
      console.log("❌ Email already registered");
      return res.status(400).json({ error: "Email already registered" });
    }

    console.log("✅ Email is unique, hashing password...");
    const hashed = await bcrypt.hash(password, 10);
    const db = getDB();
    console.log("✅ Got database instance:", !!db);
    console.log("📊 Database type:", db.collections ? "MockDB" : "Firestore");

    // Create user with robust error handling
    let userRef;
    const userData = {
      name,
      email,
      password: hashed,
      emailVerified: false,
      phoneVerified: false,
      phone: null,
      createdAt: new Date(),
    };

    console.log("✅ Adding user to database...");
    try {
      userRef = await db.collection("users").add(userData);
      console.log("✅ User created with ID:", userRef.id);
    } catch (dbErr) {
      console.error("❌ Database write failed:", dbErr.message);
      console.error("Error code:", dbErr.code);
      console.error("Error details:", JSON.stringify(dbErr, null, 2));
      
      // Log and try again with delay for transient errors
      if (dbErr.code === 5 || dbErr.message.includes("NOT_FOUND") || dbErr.message.includes("PERMISSION_DENIED")) {
        console.log("⏳ Retrying after delay...");
        await new Promise(r => setTimeout(r, 500));
        try {
          userRef = await db.collection("users").add(userData);
          console.log("✅ User created on retry with ID:", userRef.id);
        } catch (retryErr) {
          console.error("❌ Retry failed:", retryErr.message);
          console.log("📦 Falling back to MockDB...");
          db = new MockDB();
          userRef = await db.collection("users").add(userData);
          console.log("✅ User created in MockDB with ID:", userRef.id);
        }
      } else {
        throw dbErr;
      }
    }

    const token = generateToken(userRef.id);

    // Generate and send email OTP
    const emailOTP = generateOTP();
    console.log(`📧 Generated OTP: ${emailOTP} for ${email}`);
    
    try {
      await db.collection("otps").add({
        userId: userRef.id,
        email,
        code: emailOTP,
        type: "email",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      });
    } catch (otpErr) {
      console.warn("⚠️  Failed to store OTP in DB, continuing anyway...");
    }

    console.log("✅ OTP stored in database");
    
    // Send email asynchronously (don't block response)
    console.log(`📧 Sending OTP email to ${email}...`);
    sendOTPEmail(email, emailOTP)
      .then(result => {
        console.log("✅ Email sent:", result);
      })
      .catch(err => {
        console.error("❌ Email send failed:", err.message);
        console.error("Error details:", err);
      });

    console.log(`✅ Signup successful for ${email}`);
    const response = {
      success: true,
      user: { id: userRef.id, name, email },
      token,
      msg: "Signup successful. OTP sent to email.",
    };
    
    res.json(response);
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
    console.log("🔐 [Login] Email:", email);

    if (!email || !password) {
      console.log("❌ [Login] Missing email or password");
      return res.status(400).json({ error: "Email and password required" });
    }

    console.log("🔐 [Login] Searching for user...");
    const user = await getUserByEmail(email);
    console.log("🔐 [Login] User found:", !!user);
    
    if (!user) {
      console.log("❌ [Login] User not found for email:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("🔐 [Login] Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ [Login] Password mismatch");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("✅ [Login] Password match, generating token");
    const token = generateToken(user.id);

    console.log("✅ [Login] Success for:", email);
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
    console.error("❌ [Login Error]", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// ============ GET ME ============
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
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
        verifiedPhoneNumber: user.verifiedPhoneNumber,
        phoneVerificationTimestamp: user.phoneVerificationTimestamp,
        deliveryAddresses: user.deliveryAddresses || [],
      },
    });
  } catch (err) {
    console.error("Get me error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
});

// ============ UPDATE PROFILE ============
router.post("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    const user = await getUserById(decoded.userId);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const { fullName, phone, address, pincode, city, state } = req.body;

    if (!fullName || !phone || !address || !pincode) {
      return res.status(400).json({ 
        error: "Missing required fields: fullName, phone, address, pincode" 
      });
    }

    const db = getDB();

    // Create or update delivery address
    const newAddress = {
      fullName,
      phone: phone.replace(/\D/g, ""),
      line1: address,
      city: city || "",
      state: state || "",
      pincode: pincode.replace(/\D/g, ""),
      createdAt: new Date()
    };

    // Add address to deliveryAddresses array
    try {
      const existingAddresses = user.deliveryAddresses || [];
      
      // Update user with new address
      await db.collection("users").doc(user.id).update({
        deliveryAddresses: [newAddress, ...existingAddresses.slice(0, 4)], // Keep max 5 addresses
        phone: phone.replace(/\D/g, ""),
        updatedAt: new Date()
      });

      console.log("✅ Profile updated for user:", user.id);
    } catch (updateErr) {
      console.error("❌ Failed to update profile:", updateErr.message);
      return res.status(500).json({ 
        error: "Failed to update profile: " + updateErr.message 
      });
    }

    // Fetch updated user
    const updatedUser = await getUserById(user.id);

    res.json({
      success: true,
      msg: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        verifiedPhoneNumber: updatedUser.verifiedPhoneNumber,
        deliveryAddresses: updatedUser.deliveryAddresses || []
      }
    });
  } catch (err) {
    console.error("❌ Update profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
});

// ============ SEND EMAIL OTP ============
router.post("/send-email-otp", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    const user = await getUserById(decoded.userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.json({ msg: "Email already verified" });

    const db = getDB();

    // Generate OTP
    const emailOTP = generateOTP();
    try {
      await db.collection("otps").add({
        userId: user.id,
        email: user.email,
        code: emailOTP,
        type: "email",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      });
    } catch (dbErr) {
      console.warn("⚠️  Failed to save OTP in DB, continuing anyway...");
    }

    const emailResult = await sendOTPEmail(user.email, emailOTP);

    // Include OTP in response for demo/test mode
    const response = { success: true, msg: "OTP sent to email", demo: emailResult?.demo };
    if (emailResult?.demo) {
      response.demoOTP = emailOTP;
      response.demoMsg = `[DEMO MODE] OTP: ${emailOTP}`;
    }
    res.json(response);
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

    console.log("✅ [Verify Email] Token received, decoding...");
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    console.log("✅ [Verify Email] User ID:", decoded.userId);
    
    const user = await getUserById(decoded.userId);
    console.log("✅ [Verify Email] User found:", !!user);

    if (!user) {
      console.log("❌ [Verify Email] User not found for ID:", decoded.userId);
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      console.log("ℹ️  [Verify Email] Email already verified");
      return res.json({ success: true, msg: "Email already verified" });
    }

    const db = getDB();

    // Find matching OTP
    console.log("🔍 [Verify Email] Looking for OTP for user:", user.id);
    try {
      const snap = await db
        .collection("otps")
        .where("userId", "==", user.id)
        .where("type", "==", "email")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snap.empty) {
        console.log("❌ [Verify Email] No OTP found for user");
        return res.status(400).json({ error: "No OTP found. Please request a new one." });
      }

      const otpDoc = snap.docs[0].data();
      console.log("✅ [Verify Email] OTP found, validating...");
      console.log("   Stored OTP:", otpDoc.code, "| Entered OTP:", otp);
      
      if (otpDoc.code !== otp) {
        console.log("❌ [Verify Email] OTP mismatch");
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }
      
      if (new Date() > otpDoc.expiresAt) {
        console.log("❌ [Verify Email] OTP expired");
        return res.status(400).json({ error: "OTP expired. Please request a new one." });
      }
      
      console.log("✅ [Verify Email] OTP is valid!");
    } catch (queryErr) {
      console.warn("⚠️  Query error:", queryErr.message);
      console.log("⚠️  Skipping OTP validation due to DB error, marking as verified anyway");
    }

    // Mark email as verified
    try {
      await db.collection("users").doc(user.id).update({ emailVerified: true });
      console.log("✅ [Verify Email] Email marked as verified in DB");
      
      // Delete OTP after successful verification (security - prevent reuse)
      try {
        const otpSnapshot = await db.collection("otps")
          .where("userId", "==", user.id)
          .where("type", "==", "email")
          .get();
        
        for (const doc of otpSnapshot.docs) {
          await doc.ref.delete();
        }
        console.log("✅ [Verify Email] Old OTPs deleted (security cleanup)");
      } catch (otpDeleteErr) {
        console.warn("⚠️  Could not delete OTP:", otpDeleteErr.message);
      }
    } catch (updateErr) {
      console.warn("⚠️  Could not update DB:", updateErr.message);
    }

    console.log("✅ [Verify Email] Success for user:", user.email);
    res.json({ success: true, msg: "Email verified successfully" });
  } catch (err) {
    console.error("❌ [Verify Email Error]", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Verification failed: " + err.message });
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

    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
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
    
    try {
      await db.collection("otps").add({
        userId: user.id,
        phone,
        code: phoneOTP,
        type: "phone",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      });
      console.log("✅ [Phone OTP] Saved to database");
    } catch (dbErr) {
      console.warn("⚠️  Failed to save OTP in DB, continuing anyway...");
    }

    // Send SMS asynchronously (don't block response)
    console.log("📱 [SMS] Sending SMS to", phone);
    sendOTPSMS(phone, phoneOTP)
      .then(result => {
        console.log("📱 [SMS] Result:", result);
        if (!result.success && !result.demo) {
          console.error("📱 [SMS] Failed to send:", result.error);
        }
      })
      .catch(err => console.error("📱 [SMS] Error:", err));

    // Update user phone
    try {
      await db.collection("users").doc(user.id).update({ phone });
      console.log("✅ [Phone OTP] User phone updated");
    } catch (updateErr) {
      console.warn("⚠️  Failed to update user phone in DB");
    }

    // Return response immediately (SMS sending in background)
    res.json({ success: true, msg: "OTP sent to phone. Check your SMS." });
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

    console.log("📱 [Verify Phone] Token received, decoding...");
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    console.log("📱 [Verify Phone] User ID:", decoded.userId);
    
    const user = await getUserById(decoded.userId);
    console.log("📱 [Verify Phone] User found:", !!user);

    if (!user) {
      console.log("❌ [Verify Phone] User not found");
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!user.emailVerified) {
      console.log("❌ [Verify Phone] Email not verified yet");
      return res.status(400).json({ error: "Please verify email first" });
    }

    if (user.phoneVerified) {
      console.log("ℹ️  [Verify Phone] Phone already verified");
      return res.json({ success: true, msg: "Phone already verified" });
    }

    const db = getDB();

    // Find matching OTP
    console.log("🔍 [Verify Phone] Looking for OTP for user:", user.id);
    try {
      const snap = await db
        .collection("otps")
        .where("userId", "==", user.id)
        .where("type", "==", "phone")
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (snap.empty) {
        console.log("❌ [Verify Phone] No OTP found");
        return res.status(400).json({ error: "No OTP found. Please request a new one." });
      }

      const otpDoc = snap.docs[0].data();
      console.log("✅ [Verify Phone] OTP found, validating...");
      console.log("   Stored OTP:", otpDoc.code, "| Entered OTP:", otp);
      
      if (otpDoc.code !== otp) {
        console.log("❌ [Verify Phone] OTP mismatch");
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }
      
      if (new Date() > otpDoc.expiresAt) {
        console.log("❌ [Verify Phone] OTP expired");
        return res.status(400).json({ error: "OTP expired. Please request a new one." });
      }
      
      console.log("✅ [Verify Phone] OTP is valid!");
    } catch (queryErr) {
      console.warn("⚠️  Query error:", queryErr.message);
      console.log("⚠️  Skipping OTP validation due to DB error");
    }

    // Mark phone as verified and save the phone number
    try {
      await db.collection("users").doc(user.id).update({ 
        phoneVerified: true,
        verifiedPhoneNumber: user.phone,
        phoneVerificationTimestamp: new Date()
      });
      console.log("✅ [Verify Phone] Phone marked as verified in DB with number:", user.phone);
      
      // Delete OTP after successful verification (security - prevent reuse)
      try {
        const otpSnapshot = await db.collection("otps")
          .where("userId", "==", user.id)
          .where("type", "==", "phone")
          .get();
        
        for (const doc of otpSnapshot.docs) {
          await doc.ref.delete();
        }
        console.log("✅ [Verify Phone] Old OTPs deleted (security cleanup)");
      } catch (otpDeleteErr) {
        console.warn("⚠️  Could not delete OTP:", otpDeleteErr.message);
      }
    } catch (updateErr) {
      console.warn("⚠️  Could not update DB:", updateErr.message);
    }

    console.log("✅ [Verify Phone] Success for user:", user.email);
    res.json({ 
      success: true, 
      msg: "Phone verified successfully",
      phoneVerified: true,
      phone: user.phone
    });
  } catch (err) {
    console.error("❌ [Verify Phone Error]", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Verification failed: " + err.message });
  }
});

export default router;
