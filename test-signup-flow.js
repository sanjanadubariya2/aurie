// Test the signup flow - see if user.id is returned properly
const http = require("http");

const testEmail = `test${Date.now()}@example.com`;

console.log("🧪 Testing Signup Flow...\n");
console.log(`📧 Test email: ${testEmail}\n`);

const signupData = JSON.stringify({
  name: "Test User",
  email: testEmail,
  password: "Test@123"
});

const options = {
  hostname: "127.0.0.1",
  port: 5000,
  path: "/api/auth/signup",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": signupData.length,
    "Origin": "http://localhost:5173"
  }
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("✅ Response received:\n");
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      console.log("\n🔍 Checking response structure:\n");
      
      if (json.user) {
        console.log("✅ user object exists");
        if (json.user.id) {
          console.log("✅ user.id exists:", json.user.id);
          console.log("✅ This means VerifyEmail page WILL appear!");
          console.log(`✅ Route will be set to: verify:${json.user.id}`);
        } else if (json.user._id) {
          console.log("❌ user._id exists but user.id is missing!");
          console.log("❌ This will PREVENT VerifyEmail page from appearing");
          console.log("❌ Need to fix backend to send user.id");
        } else {
          console.log("❌ Neither user.id nor user._id found");
        }
      } else {
        console.log("❌ user object not found");
      }
      
      if (json.token) {
        console.log("✅ token exists:", json.token.substring(0, 20) + "...");
      } else {
        console.log("❌ token not found");
      }
      
    } catch (e) {
      console.log("❌ Failed to parse response:", e.message);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("❌ Error:", e.message);
  console.error("Make sure backend is running on http://127.0.0.1:5000");
});

req.write(signupData);
req.end();

console.log("📤 Sending signup request...\n");
