import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MockDB } from "./mockDb.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

      console.log("🔥 Initializing Firebase Admin...");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: process.env.FIREBASE_DATABASE_URL || ""
      });

      console.log("✅ Firebase Admin initialized for project:", serviceAccount.project_id);
      db = admin.firestore();
      
      // Configure Firestore settings
      db.settings({
        ignoreUndefinedProperties: true,
        preferRest: false
      });

      console.log("🧪 Testing Firestore connectivity...");
      
      // Test write operation to verify Firestore is working (with 10 second timeout)
      try {
        const testDocRef = db.collection("_system").doc("_test_" + Date.now());
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firestore test timeout")), 10000)
        );
        
        // Race between the actual test and timeout
        await Promise.race([
          testDocRef.set({ test: true, timestamp: new Date() }),
          timeoutPromise
        ]);
        
        console.log("✅ Firestore write test passed");
        
        // Clean up test document
        await Promise.race([
          testDocRef.delete(),
          timeoutPromise
        ]);
        
        console.log("✅ Firestore delete test passed");
        
        console.log("✅ Firestore initialized successfully");
        isFirebase = true;
        return db;
      } catch (testErr) {
        console.error("❌ Firestore write test failed:", testErr.message);
        console.warn("⚠️  Firestore is not accessible, using Mock DB as fallback");
        console.log("Error details:", testErr.code, testErr.message);
        
        // Use MockDB as fallback
        db = new MockDB();
        isFirebase = false;
        return db;
      }

    } catch (parseErr) {
      console.warn("⚠️  Firebase credentials malformed, using Mock DB for development");
      console.log("Parse error:", parseErr.message);
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
