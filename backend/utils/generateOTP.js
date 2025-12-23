// ============ OTP GENERATION ============
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============ OTP VALIDATION ============
export const validateOTP = (storedOTP, providedOTP, expiresAt) => {
  if (Date.now() > expiresAt) {
    return { valid: false, error: "OTP has expired" };
  }
  
  if (storedOTP !== providedOTP) {
    return { valid: false, error: "Invalid OTP" };
  }
  
  return { valid: true };
};

// ============ OTP EXPIRATION TIME ============
export const getOTPExpiry = (minutes = 5) => {
  return Date.now() + minutes * 60 * 1000;
};
