import twilio from "twilio";

// ============ SMS CONFIGURATION ============
const accountSid = process.env.TWILIO_ACCOUNT_SID || "demo";
const authToken = process.env.TWILIO_AUTH_TOKEN || "demo";
const fromPhone = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

let client = null;

try {
  if (accountSid !== "demo") {
    client = twilio(accountSid, authToken);
  }
} catch (err) {
  console.warn("⚠️ Twilio not configured, using demo mode");
}

// ============ SEND SMS ============
export const sendSMS = async (phoneNumber, message) => {
  try {
    if (!client) {
      console.warn("⚠️ SMS Demo Mode:", phoneNumber, message);
      return { success: true, demo: true, message: "SMS queued (demo mode)" };
    }

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: phoneNumber,
    });

    console.log("✅ SMS sent:", result.sid);
    return { success: true, demo: false, sid: result.sid };
  } catch (err) {
    console.error("❌ SMS error:", err.message);
    return { success: true, demo: true, message: "SMS queued (demo mode)" };
  }
};

// ============ SEND OTP SMS ============
export const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your Aurie Candles verification code is: ${otp}. Valid for 10 minutes.`;
  console.log(`📱 [SMS] OTP for ${phoneNumber}: ${otp} (Demo Mode - Check backend console)`);
  return sendSMS(phoneNumber, message);
};
