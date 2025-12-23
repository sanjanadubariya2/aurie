import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MockDB } from "./mockDb.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

let db = null;
let isFirebase = false;

export const initializeFirebase = async () => {
  try {
    if (db) {
      return db;
    }

    const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJSON) {
      console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT not found in .env, using Mock DB");
      db = new MockDB();
      isFirebase = false;
      return db;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJSON);
      
      if (!serviceAccount.project_id) {
        console.warn("⚠️  Firebase credentials incomplete, using Mock DB");
        db = new MockDB();
        isFirebase = false;
        return db;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || ""
      });

      db = admin.firestore();
      isFirebase = true;
      console.log("✅ Firestore initialized successfully");
      return db;
    } catch (parseErr) {
      console.warn("⚠️  Firebase credentials malformed, using Mock DB for development");
      db = new MockDB();
      isFirebase = false;
      return db;
    }
  } catch (err) {
    console.error("❌ Firebase initialization error:", err.message);
    console.warn("⚠️  Falling back to Mock DB");
    db = new MockDB();
    isFirebase = false;
    return db;
  }
};

export const getDB = () => {
  if (!db) {
    console.warn("⚠️  Database not initialized, initializing Mock DB...");
    db = new MockDB();
    isFirebase = false;
  }
  return db;
};

export const isFirebaseActive = () => isFirebase;

export default admin;
