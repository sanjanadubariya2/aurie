// Centralized JWT configuration - single source of truth
// This ensures all token creation and verification uses the same secret

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY = "7d";

export default {
  JWT_SECRET,
  TOKEN_EXPIRY,
};
