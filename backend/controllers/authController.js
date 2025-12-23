import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getDB } from "../config/firebase.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = getDB();

    // Check if user already exists
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!userQuery.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user in Firestore
    const userRef = await db.collection("users").add({
      name,
      email,
      password: hashed,
      verified: false,
      createdAt: new Date(),
      phoneVerified: false,
      favorites: [],
      deliveryAddresses: []
    });

    const userId = userRef.id;

    res.json({
      success: true,
      user: {
        id: userId,
        name,
        email,
        verified: false
      },
      token: generateToken(userId)
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // Find user by email
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Compare password
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        id: userId,
        name: userData.name,
        email: userData.email,
        verified: userData.verified || false
      },
      token: generateToken(userId)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
};
