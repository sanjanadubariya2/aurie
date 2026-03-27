import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

export default function generateToken(userId) {
  return jwt.sign({ userId }, jwtConfig.JWT_SECRET, { expiresIn: jwtConfig.TOKEN_EXPIRY });
}
