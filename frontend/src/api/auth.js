import { API } from "./axios.js";

// AUTH ENDPOINTS
export const registerUser = (name, email, password) =>
  API.post("/auth/signup", { name, email, password })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Signup API Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Signup failed";
      return { error: errorMsg };
    });

export const loginUser = (email, password) =>
  API.post("/auth/login", { email, password })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Login API Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Login failed";
      return { error: errorMsg };
    });

export const getMe = (token) =>
  API.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Get User Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to fetch user";
      return { error: errorMsg };
    });

// EMAIL VERIFICATION ENDPOINTS
export const sendEmailOtp = (token) =>
  API.post(
    "/auth/send-email-otp",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then((res) => res.data)
    .catch((err) => {
      console.error("Send Email OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to send OTP";
      return { error: errorMsg };
    });

export const verifyEmailOtp = (token, otp) =>
  API.post(
    "/auth/verify-email-otp",
    { otp },
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then((res) => res.data)
    .catch((err) => {
      console.error("Verify Email OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Verification failed";
      return { error: errorMsg };
    });

// PHONE VERIFICATION ENDPOINTS
export const sendPhoneOtp = (token, phone) =>
  API.post(
    "/auth/send-phone-otp",
    { phone },
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then((res) => res.data)
    .catch((err) => {
      console.error("Send Phone OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to send OTP";
      return { error: errorMsg };
    });

export const verifyPhoneOtp = (token, otp) =>
  API.post(
    "/auth/verify-phone-otp",
    { otp },
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then((res) => res.data)
    .catch((err) => {
      console.error("Verify Phone OTP Error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Verification failed";
      return { error: errorMsg };
    });

// ADDITIONAL ENDPOINTS
export const checkPhoneVerification = (token) => {
  if (!token) {
    console.error("❌ No token provided to checkPhoneVerification");
    return Promise.reject(new Error("No token"));
  }
  
  return API.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => {
      console.log("✅ checkPhoneVerification response:", res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("❌ checkPhoneVerification error:", err);
      throw err;
    });
};

// UPDATE USER PROFILE WITH ADDRESS
export const updateUserProfile = (token, profileData) => {
  if (!token) {
    console.error("❌ No token provided");
    return Promise.reject(new Error("No token"));
  }
  
  return API.post(
    "/auth/update-profile",
    profileData,
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then((res) => {
      console.log("✅ Profile updated:", res.data);
      return res.data;
    })
    .catch((err) => {
      console.error("❌ Update profile error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to update profile";
      return { error: errorMsg };
    });
};

