import twilio from "twilio";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function checkTwilio() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log("\n📱 Twilio Diagnostic Tool");
    console.log("==========================\n");

    if (!accountSid || accountSid === "demo") {
      console.log("❌ TWILIO_ACCOUNT_SID not configured");
      console.log("   Expected: AC... (starts with AC)");
      console.log("   Found:", accountSid || "NOT SET");
      return;
    }

    if (!authToken || authToken === "demo") {
      console.log("❌ TWILIO_AUTH_TOKEN not configured");
      return;
    }

    if (!phoneNumber || phoneNumber === "demo") {
      console.log("❌ TWILIO_PHONE_NUMBER not configured");
      console.log("   Expected: +1234567890");
      console.log("   Found:", phoneNumber || "NOT SET");
      return;
    }

    console.log("✅ Credentials found:");
    console.log("   Account SID:", accountSid.substring(0, 5) + "****");
    console.log("   Auth Token:", authToken.substring(0, 5) + "****");
    console.log("   From Number:", phoneNumber);

    console.log("\n📍 Test 1: Initialize Twilio client");
    try {
      const client = twilio(accountSid, authToken);
      console.log("✅ Twilio client initialized successfully");

      console.log("\n📍 Test 2: Verify account");
      const account = await client.api.accounts(accountSid).fetch();
      console.log("✅ Account verified!");
      console.log("   Status:", account.status);
      console.log("   Type:", account.type);

      if (account.status !== "active") {
        console.log("❌ WARNING: Account is " + account.status);
        console.log("   Please check: https://www.twilio.com/console");
      }

      console.log("\n📍 Test 3: Check message capacity");
      try {
        const messages = await client.messages.list({ limit: 1 });
        console.log("✅ Can access message API");
      } catch (err) {
        console.log("❌ Cannot access message API:", err.message);
      }

      console.log("\n🎉 Twilio is configured correctly!");
      console.log("\n📝 If SMS still not received:");
      console.log("1. Make sure you verified the phone number in Twilio");
      console.log("2. Go to: https://www.twilio.com/console/phone-numbers/verified");
      console.log("3. Your phone (9930404511) should be listed");
      console.log("4. If not, add it as a Verified Caller ID");
      console.log("5. You'll get an SMS with a code to verify");

      process.exit(0);
    } catch (err) {
      console.log("❌ Twilio client error:", err.message);
      console.log("\nPossible issues:");
      console.log("1. Invalid credentials");
      console.log("2. Trial account expired");
      console.log("3. Account balance too low");
      console.log("4. API temporarily unavailable");
      console.log("\nFix:");
      console.log("- Check credentials at: https://www.twilio.com/console");
      console.log("- Verify account is active and has balance");
      console.log("- Check phone number is verified");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkTwilio();
