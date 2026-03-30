import twilio from "twilio";
import { logger } from "./logger.js";

// ============ SMS CONFIGURATION ============
let client = null;
let twilioReady = false;
let initialized = false;
let fromPhone = null;
let initError = null;

// Lazy initialization function - STRICT MODE (fail if not configured)
const initializeTwilio = () => {
  if (initialized) return;
  initialized = true;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  fromPhone = process.env.TWILIO_PHONE_NUMBER;

  // Check all required credentials
  const hasAllCredentials = accountSid && authToken && fromPhone && 
                           accountSid !== "demo" && 
                           accountSid.startsWith("AC");

  if (!hasAllCredentials) {
    initError = "Twilio SMS not configured. Required environment variables: " +
                "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER";
    logger.sms(initError, "error", {
      hasSID: !!accountSid,
      hasToken: !!authToken,
      hasPhone: !!fromPhone,
      sidValid: accountSid?.startsWith("AC"),
    });
    twilioReady = false;
    return;
  }

  // Try to initialize Twilio
  try {
    client = twilio(accountSid, authToken);
    twilioReady = true;
    logger.sms("Twilio SMS service initialized successfully", "info");
  } catch (err) {
    initError = `Twilio initialization failed: ${err.message}`;
    logger.sms(initError, "error", { error: err.message });
    twilioReady = false;
  }
};

// ============ SEND SMS ============
export const sendSMS = async (phoneNumber, message) => {
  // Initialize on first call
  if (!initialized) {
    initializeTwilio();
  }

  // Fail explicitly if not configured - NO DEMO MODE
  if (!twilioReady || !client) {
    const error = initError || "Twilio SMS service is not available";
    logger.sms("SMS send failed - service not configured", "error", { 
      phone: phoneNumber,
      error 
    });
    throw new Error(error);
  }

  try {
    // Format phone number - add +91 if Indian number without country code
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      if (phoneNumber.length === 10) {
        formattedNumber = "+91" + phoneNumber;
      } else {
        formattedNumber = "+" + phoneNumber;
      }
    }

    logger.sms(`Sending SMS to ${formattedNumber}`, "info", { 
      originalPhone: phoneNumber,
      messagePreview: message.substring(0, 50)
    });

    const result = await client.messages.create({
      body: message,
      from: fromPhone,
      to: formattedNumber,
    });

    logger.sms("SMS sent successfully", "info", { 
      sid: result.sid,
      to: formattedNumber 
    });
    
    return { success: true, sid: result.sid };
  } catch (err) {
    logger.sms("SMS send failed", "error", { 
      phone: phoneNumber,
      error: err.message
    });
    throw err;
  }
};

// ============ SEND OTP SMS ============
export const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your Aurie Candles verification code is: ${otp}. Valid for 10 minutes.`;
  logger.sms(`Generated OTP for ${phoneNumber}: ${otp}`, "info");
  return await sendSMS(phoneNumber, message);
};