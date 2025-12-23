import { initializeFirebase } from "./firebase.js";

export const connectDB = async () => {
  try {
    await initializeFirebase();
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
};
