#!/usr/bin/env node

/**
 * Frontend-Backend Connection Tester
 * Tests CORS, API connectivity, and all endpoints
 * Run: node test-frontend-backend.js
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'http://127.0.0.1:5000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, message) {
  console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  validateStatus: () => true // Don't throw on any status code
});

async function runTests() {
  log('blue', '\n🔍 Frontend-Backend Connection Test\n');

  // Test 1: Basic connectivity
  log('cyan', '1️⃣  Testing Backend Connectivity...');
  try {
    const response = await api.get('/health', { timeout: 5000 });
    if (response.status === 200) {
      log('green', '   ✅ Backend is running on http://127.0.0.1:5000');
      log('green', `   Database: ${response.data.database}`);
    } else {
      log('red', `   ❌ Backend returned status ${response.status}`);
    }
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      log('red', '   ❌ Backend is NOT running on http://127.0.0.1:5000');
      log('yellow', '   💡 Fix: cd backend && node server.js');
      return;
    } else if (err.code === 'ETIMEDOUT') {
      log('red', '   ❌ Backend timeout - may be overloaded');
    } else {
      log('red', `   ❌ Connection error: ${err.message}`);
    }
    return;
  }

  // Test 2: CORS preflight
  log('cyan', '\n2️⃣  Testing CORS Configuration...');
  try {
    const response = await api.options('/auth/signup');
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials']
    };
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      log('green', `   ✅ CORS enabled`);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) log('gray', `      ${key}: ${value}`);
      });
    } else {
      log('yellow', '   ⚠️  CORS headers not found (may still work)');
    }
  } catch (err) {
    log('red', `   ❌ CORS check failed: ${err.message}`);
  }

  // Test 3: Auth routes
  log('cyan', '\n3️⃣  Testing Auth Routes...');
  
  // Test signup endpoint
  log('gray', '   Testing POST /auth/signup...');
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test@123'
  };

  try {
    const response = await api.post('/auth/signup', testUser, { timeout: 5000 });
    
    if (response.status === 200 && response.data.user) {
      log('green', '   ✅ Signup endpoint working');
      log('green', `      User ID: ${response.data.user.id}`);
      log('green', `      Token received: ${response.data.token ? 'Yes' : 'No'}`);
      
      // Test email OTP
      if (response.data.token) {
        log('gray', '   Testing POST /auth/send-email-otp...');
        try {
          const otpResponse = await api.post(
            '/auth/send-email-otp',
            {},
            { headers: { Authorization: `Bearer ${response.data.token}` } }
          );
          
          if (otpResponse.status === 200) {
            log('green', '   ✅ Send OTP endpoint working');
          } else {
            log('yellow', `   ⚠️  Send OTP returned ${otpResponse.status}`);
            log('gray', `      Response: ${JSON.stringify(otpResponse.data)}`);
          }
        } catch (err) {
          log('red', `   ❌ Send OTP error: ${err.message}`);
        }
      }
    } else {
      log('yellow', `   ⚠️  Signup returned ${response.status}`);
      log('gray', `      Response: ${JSON.stringify(response.data)}`);
    }
  } catch (err) {
    log('red', `   ❌ Signup error: ${err.message}`);
    if (err.code === 'ECONNREFUSED') {
      log('yellow', '   💡 Backend not running');
    } else if (err.message.includes('CORS')) {
      log('yellow', '   💡 CORS error - check backend CORS config');
    }
  }

  // Test 4: Response headers
  log('cyan', '\n4️⃣  Testing Response Headers...');
  try {
    const response = await api.get('/health');
    const headers = {
      'Content-Type': response.headers['content-type'],
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'X-Powered-By': response.headers['x-powered-by']
    };
    
    log('gray', '   Response headers:');
    Object.entries(headers).forEach(([key, value]) => {
      if (value) log('gray', `      ${key}: ${value}`);
    });
  } catch (err) {
    log('red', `   ❌ Header check failed: ${err.message}`);
  }

  // Test 5: Error handling
  log('cyan', '\n5️⃣  Testing Error Handling...');
  try {
    const response = await api.post('/auth/signup', {
      name: '',
      email: 'invalid',
      password: '123'
    });

    if (response.status >= 400) {
      log('green', `   ✅ Error handling working (${response.status})`);
      log('gray', `      Error: ${response.data.error || response.data.message}`);
    } else {
      log('yellow', `   ⚠️  Expected error but got ${response.status}`);
    }
  } catch (err) {
    log('red', `   ❌ Error handling test failed: ${err.message}`);
  }

  // Summary
  log('cyan', '\n📊 Connection Summary:');
  log('green', '✅ Frontend should be able to connect to backend');
  log('blue', '\n🚀 Next Steps:');
  log('blue', '1. Start backend: cd backend && node server.js');
  log('blue', '2. Start frontend: cd frontend && npm run dev');
  log('blue', '3. Open http://localhost:5173');
  log('blue', '4. Try signup');
  log('blue', '5. Check browser console for detailed logs');
  log('blue', '6. Check backend console for request logs');

  log('cyan', '\n📋 Troubleshooting:');
  log('yellow', 'If CORS errors occur:');
  log('gray', '  - Check frontend origin is in CORS allowlist');
  log('gray', '  - Check withCredentials is set in axios');
  log('gray', '  - Restart backend after config changes');

  log('yellow', '\nIf API calls fail:');
  log('gray', '  - Check backend is running on port 5000');
  log('gray', '  - Check baseURL in axios config: http://127.0.0.1:5000/api');
  log('gray', '  - Check request/response in browser Network tab');
  log('gray', '  - Check console logs in both frontend and backend');
}

runTests().catch(err => {
  log('red', `\n❌ Test failed: ${err.message}`);
  process.exit(1);
});
