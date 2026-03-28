import twilio from "twilio";

// ============ SMS CONFIGURATION ============
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client = null;
let twilioReady = false;

// Initialize Twilio
if (accountSid && authToken && fromPhone && accountSid !== "demo" && !accountSid.startsWith("AC")) {
  try {
    client = twilio(accountSid, authToken);
    twilioReady = true;
    console.log("✅ Twilio SMS service initialized");
  } catch (err) {
    console.warn("⚠️  Twilio initialization failed:", err.message);
    console.log("    Using Demo Mode for SMS");
  }
} else {
  console.log("ℹ️  Twilio not configured - Using Demo Mode");
  console.log(`    (Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)`);
}

// ============ SEND SMS ============
export const sendSMS = async (phoneNumber, message) => {
  try {
    // Demo mode if Twilio not configured
    if (!twilioReady || !client) {
      console.log("📱 [SMS Demo Mode] To:", phoneNumber);
      console.log("📱 [SMS Demo Mode] Message:", message);
      return { success: true, demo: true, message: "SMS queued (demo mode)" };
    }

    // Format phone number - add +91 if Indian number without country code
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      if (phoneNumber.length === 10) {
        formattedNumber = "+91" + phoneNumber;
      } else {
        formattedNumber = "+" + phoneNumber;
      }
    }

    console.log(`📱 [SMS] Sending to ${formattedNumber}`);

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedNumber,
    });

    console.log("✅ SMS sent:", result.sid);
    return { success: true, demo: false, sid: result.sid };
  } catch (err) {
    console.error("❌ SMS error:", err.message);
    return { success: false, demo: false, error: err.message || "Unknown error" };
  }
};

// ============ SEND OTP SMS ============
export const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your Aurie Candles verification code is: ${otp}. Valid for 10 minutes.`;
  console.log(`📱 [OTP SMS] Generated for ${phoneNumber}: ${otp}`);
  return sendSMS(phoneNumber, message);
};