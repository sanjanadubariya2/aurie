import twilio from "twilio";

// ============ SMS CONFIGURATION ============
const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC536b5e61319836cdc31d61e65429a413";
const authToken = process.env.TWILIO_AUTH_TOKEN || "46782a03ed43f989d54cd9a3eb948e91";
const fromPhone = process.env.TWILIO_PHONE_NUMBER || "+1 478 280 2833";

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

    // Format phone number - add +91 if Indian number without country code
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      if (phoneNumber.length === 10) {
        formattedNumber = "+91" + phoneNumber; // India country code
      } else {
        formattedNumber = "+" + phoneNumber;
      }
    }

    console.log(`📱 [SMS] Sending to ${formattedNumber} (original: ${phoneNumber})`);

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedNumber,
    });

    console.log("✅ SMS sent:", result.sid);
    return { success: true, demo: false, sid: result.sid };
  } catch (err) {
    console.error("❌ SMS error:", err.message);
    console.error("   Error code:", err.code);
    console.error("   Full error:", err);
    return { success: false, error: err.message };
  }
};

// ============ SEND OTP SMS ============
export const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your Aurie Candles verification code is: ${otp}. Valid for 10 minutes.`;
  console.log(`📱 [OTP SMS] Generated for ${phoneNumber}: ${otp}`);
  return sendSMS(phoneNumber, message);
};