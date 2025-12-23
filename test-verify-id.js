// Direct API test - verify the signup endpoint returns user.id
const http = require("http");

const testEmail = `test${Date.now()}@example.com`;

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
    "Content-Length": signupData.length
  }
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("\n✅ SIGNUP RESPONSE:\n", JSON.stringify(json, null, 2));
      
      if (json.user && json.user.id) {
        console.log("\n✅ SUCCESS! user.id exists:", json.user.id);
        console.log("✅ Route will be set to: verify:" + json.user.id);
        console.log("✅ VerifyEmail page WILL appear!");
      } else {
        console.log("\n❌ FAILED! user.id missing");
        console.log("Response:", json);
      }
    } catch (e) {
      console.log("Error parsing response:", e.message);
      console.log("Raw:", data);
    }
  });
});

req.on("error", e => console.error("❌ Error:", e.message));
req.write(signupData);
req.end();

console.log("📤 Testing signup endpoint...\n");
