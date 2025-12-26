import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function testSMSDelivery() {
  console.log("\n📱 SMS Delivery Diagnostic");
  console.log("==========================\n");

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  console.log("Configuration:");
  console.log("  From Phone:", fromPhone);
  console.log("  Account SID:", accountSid?.substring(0, 5) + "****");
  console.log("  Auth Token:", authToken?.substring(0, 5) + "****");

  if (accountSid === "demo") {
    console.log(
      "\n❌ Twilio not configured. Using demo mode."
    );
    console.log("   SMS will NOT be sent in demo mode");
    process.exit(1);
  }

  try {
    const client = twilio(accountSid, authToken);

    console.log("\n📍 Test 1: Check Account Balance");
    try {
      const account = await client.api.accounts(accountSid).fetch();
      console.log("✅ Account Status:", account.status);
      console.log("   Type:", account.type);

      if (account.status !== "active") {
        console.log("❌ WARNING: Account is not active!");
        console.log("   Please activate at: https://www.twilio.com/console");
      }
    } catch (err) {
      console.log("❌ Could not fetch account:", err.message);
    }

    console.log("\n📍 Test 2: Check Verified Phone Numbers");
    try {
      const phones = await client.incomingPhoneNumbers.list({ limit: 10 });
      if (phones.length === 0) {
        console.log(
          "⚠️  No incoming phone numbers found"
        );
        console.log("   Go to: https://www.twilio.com/console/phone-numbers");
      } else {
        console.log("✅ Verified phone numbers:");
        phones.forEach((phone) => {
          console.log("   -", phone.phoneNumber);
        });
      }
    } catch (err) {
      console.log("⚠️  Could not list phones:", err.message);
    }

    console.log("\n📍 Test 3: India Number SMS (Trial Account)");
    console.log("   Trial accounts have SMS limitations:");
    console.log("   - Cannot send to unverified numbers");
    console.log("   - Can only send to numbers in verified list");
    console.log("   - May have country restrictions");
    console.log("   - Full SMS body disclosure required");

    console.log("\n📍 Test 4: Required Verified Recipients");
    try {
      const validated = await client.validationRequests.list({ limit: 10 });
      console.log("✅ Validated recipient numbers:");
      if (validated.length === 0) {
        console.log("   None - Trial accounts can only send to verified numbers");
        console.log("   Go to: https://www.twilio.com/console/phone-numbers/verified");
      } else {
        validated.forEach((req) => {
          console.log("   -", req.phoneNumber, "Status:", req.status);
        });
      }
    } catch (err) {
      console.log("⚠️  Could not list validated numbers:", err.message);
    }

    console.log("\n📍 Test 5: Send Test SMS to +919930404511");
    console.log("   (Using a test number)");
    try {
      const message = await client.messages.create({
        body: "Test SMS from Aurie Candles. OTP: 123456",
        from: fromPhone,
        to: "+919930404511",
      });
      console.log("✅ SMS sent successfully!");
      console.log("   SID:", message.sid);
      console.log("   Status:", message.status);
    } catch (err) {
      console.log("❌ SMS sending failed:", err.message);
      console.log("   Code:", err.code);

      if (
        err.message.includes(
          "not in a valid format for the destination country"
        )
      ) {
        console.log("   Issue: Phone number format issue for India");
      }

      if (
        err.message.includes(
          "The phone number is not yet verified"
        )
      ) {
        console.log("   Issue: TRIAL ACCOUNT - Phone must be in verified list");
        console.log("   Fix: Add to verified recipients at:");
        console.log("   https://www.twilio.com/console/phone-numbers/verified");
      }

      if (
        err.message.includes(
          "account does not have the capability to originate Message requests"
        )
      ) {
        console.log("   Issue: Account not enabled for SMS");
        console.log("   Fix: Add SMS capability at:");
        console.log("   https://www.twilio.com/console/sms/getting-started/build");
      }
    }

    console.log("\n📋 Summary:");
    console.log("============");
    console.log("For SMS to work:");
    console.log("1. Account must be active (trial or paid)");
    console.log("2. From number must be verified");
    console.log("3. Recipient number must be verified (for trial)");
    console.log("4. Account must have SMS messaging enabled");
    console.log("5. Phone number must be in valid format");

    console.log("\nFor India (+91) numbers:");
    console.log("1. Use format: +919876543210");
    console.log("2. Must have 10 digits after +91");
    console.log("3. Trial accounts: Add to verified list first");
    console.log("4. Paid accounts: Most numbers should work");

    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}

testSMSDelivery();
