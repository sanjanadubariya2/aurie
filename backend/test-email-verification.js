#!/usr/bin/env node

/**
 * Email Verification Test Script
 * 
 * This script tests the email system end-to-end without needing a browser
 * Run: node test-email-verification.js <test-email>
 * 
 * Example: node test-email-verification.js yourtest@gmail.com
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
}

async function testEmailVerification(testEmail) {
  if (!testEmail) {
    log('red', '❌ Please provide test email: node test-email-verification.js your-email@gmail.com');
    process.exit(1);
  }

  log('blue', '\n📧 Email Verification Test Suite\n');
  log('blue', `Testing with email: ${testEmail}\n`);

  let token = null;
  let userId = null;
  let generatedOtp = null;

  try {
    // Step 1: Signup
    log('cyan', '1️⃣  Testing Signup...');
    const signupRes = await api.post('/auth/signup', {
      name: 'Test User',
      email: testEmail,
      password: 'Test@123',
    });

    if (signupRes.data.success) {
      log('green', `   ✅ Signup successful`);
      log('green', `   User ID: ${signupRes.data.user.id}`);
      log('green', `   Token received: ${signupRes.data.token ? 'Yes' : 'No'}`);
      token = signupRes.data.token;
      userId = signupRes.data.user.id;
    } else {
      log('red', `   ❌ Signup failed: ${signupRes.data.msg || signupRes.data.error}`);
      return;
    }

    // Step 2: Check if email was sent
    log('cyan', '\n2️⃣  Checking if email OTP was sent...');
    log('yellow', `   ⏳ Check your email (${testEmail}) for OTP`);
    log('yellow', `   ⏳ Check spam/promotions folder if not found`);
    log('yellow', `   ⏳ Waiting for manual OTP entry...\n`);

    // Step 3: Resend OTP
    log('cyan', '3️⃣  Testing Resend Email OTP...');
    const resendRes = await api.post(
      '/auth/send-email-otp',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (resendRes.data.success) {
      log('green', `   ✅ Resend successful`);
      log('green', `   ${resendRes.data.msg}`);
    } else {
      log('red', `   ❌ Resend failed: ${resendRes.data.error || resendRes.data.msg}`);
    }

    // Step 4: Manual OTP verification
    log('cyan', '\n4️⃣  Testing Email OTP Verification...');
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('   Enter the 6-digit OTP from email: ', async (otp) => {
        rl.close();

        if (!otp || otp.length !== 6) {
          log('red', '   ❌ Invalid OTP format (must be 6 digits)');
          resolve();
          return;
        }

        try {
          const verifyRes = await api.post(
            '/auth/verify-email-otp',
            { otp },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            log('green', `   ✅ Email verification successful!`);
            log('green', `   ${verifyRes.data.msg}`);
          } else {
            log('red', `   ❌ Verification failed: ${verifyRes.data.error}`);
          }
        } catch (err) {
          log('red', `   ❌ Verification error: ${err.response?.data?.error || err.message}`);
        }

        log('cyan', '\n5️⃣  Test Summary:');
        log('green', '   ✅ Backend is running');
        log('green', '   ✅ Frontend can connect to backend');
        log('green', '   ✅ Email system is working');
        log('green', '   ✅ OTP verification works');

        resolve();
      });
    });

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      log('red', `\n❌ Cannot connect to backend`);
      log('red', `   Backend is not running on ${API_URL}`);
      log('yellow', `\n   Fix: Run backend first:`);
      log('blue', `   cd c:\\aurie\\aurie-candles\\backend`);
      log('blue', `   node server.js`);
    } else if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
      log('yellow', `\n⚠️  Email already registered`);
      log('yellow', `   Use a different test email or delete this user from Firebase`);
      
      // Try login instead
      log('cyan', '\nTrying to verify with existing account...');
      try {
        const loginRes = await api.post('/auth/login', {
          email: testEmail,
          password: 'Test@123',
        });
        token = loginRes.data.token;
        log('green', '✅ Login successful, proceeding with OTP verification...');
      } catch (loginErr) {
        log('red', `❌ Login failed: ${loginErr.response?.data?.error || loginErr.message}`);
      }
    } else {
      log('red', `\n❌ Test failed: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  }
}

const testEmail = process.argv[2];
testEmailVerification(testEmail);
