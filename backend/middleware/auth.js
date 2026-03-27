import jwt from "jsonwebtoken";
import { getDB } from "../config/firebase.js";
import jwtConfig from "../config/jwt.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Not authorized - no token" });

  try {
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    const db = getDB();
    
    // Get user from Firestore
    const userDoc = await db.collection("users").doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.user = { id: userDoc.id, ...userDoc.data() };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
