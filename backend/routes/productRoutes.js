import express from "express";
import { getDB } from "../config/firebase.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const snapshot = await db.collection("products").get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(products);
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

export default router;
