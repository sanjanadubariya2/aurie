import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

async function checkRazorpay() {
  try {
    const key = process.env.RAZORPAY_KEY;
    const secret = process.env.RAZORPAY_SECRET;

    console.log("\n💳 Razorpay Configuration Check");
    console.log("=================================\n");

    if (!key || key === "rzp_test_xxxxx") {
      console.log("❌ RAZORPAY_KEY not configured");
      console.log("   Found:", key || "NOT SET");
      console.log("\n📝 To get your key:");
      console.log("1. Go to: https://dashboard.razorpay.com");
      console.log("2. Click Settings → API Keys");
      console.log("3. Copy your Key ID (starts with rzp_test_)");
      console.log("4. Add to .env: RAZORPAY_KEY=your_key_here");
      process.exit(1);
    }

    if (!secret || secret === "xxxxxxx") {
      console.log("❌ RAZORPAY_SECRET not configured");
      console.log("   Found:", secret || "NOT SET");
      console.log("\n📝 To get your secret:");
      console.log("1. Go to: https://dashboard.razorpay.com");
      console.log("2. Click Settings → API Keys");
      console.log("3. Copy your Key Secret");
      console.log("4. Add to .env: RAZORPAY_SECRET=your_secret_here");
      process.exit(1);
    }

    console.log("✅ Credentials found:");
    console.log("   Key:", key.substring(0, 15) + "****");
    console.log("   Secret:", secret.substring(0, 10) + "****");

    console.log("\n📍 Test 1: Initialize Razorpay");
    try {
      const razorpay = new Razorpay({
        key_id: key,
        key_secret: secret,
      });
      console.log("✅ Razorpay initialized successfully");

      console.log("\n📍 Test 2: Create test order");
      try {
        const order = await razorpay.orders.create({
          amount: 50000, // 500 INR in paise
          currency: "INR",
          receipt: "test_" + Date.now(),
          description: "Test Order",
        });

        console.log("✅ Test order created!");
        console.log("   Order ID:", order.id);
        console.log("   Amount:", order.amount / 100, "INR");
        console.log("   Status:", order.status);

        console.log("\n🎉 Razorpay is fully configured!");
        console.log("\n📝 Next steps:");
        console.log("1. Restart backend: node server.js");
        console.log("2. Go to app: http://localhost:5173");
        console.log("3. Add items to cart");
        console.log("4. Click Checkout → Pay Now");
        console.log("5. Use test card: 4111111111111111");
        console.log("6. Expiry: 12/25, CVV: 123");

        process.exit(0);
      } catch (orderErr) {
        console.log("❌ Failed to create order:", orderErr.message);
        console.log("   This might mean:");
        console.log("   - Wrong API credentials");
        console.log("   - API key is live key instead of test key");
        console.log("   - Rate limit exceeded");
        process.exit(1);
      }
    } catch (initErr) {
      console.log("❌ Razorpay initialization failed:", initErr.message);
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  }
}

checkRazorpay();
