import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  verified: { type: Boolean, default: false },
  verificationCode: String,
  deliveryAddresses: [
    {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String
    }
  ],
  otp: String,
  otpExpires: Date,
  phoneVerified: { type: Boolean, default: false },
  verifiedPhoneNumber: String,
  phoneVerificationTimestamp: Date
});

export default mongoose.model("User", userSchema);
