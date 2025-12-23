#!/usr/bin/env node

/**
 * Backend Verification Script
 * 
 * Tests if the backend is properly configured and running
 * Run: node verify-backend.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function verifyBackend() {
  log('blue', '\n🔍 Backend Verification Checklist\n');

  let allChecks = true;

  // Check 1: .env file exists
  log('cyan', '1️⃣  Checking .env file...');
  const envPath = resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log('green', '   ✅ .env file exists');
    
    dotenv.config({ path: envPath });
    
    if (process.env.EMAIL_USER) {
      log('green', `   ✅ EMAIL_USER configured: ${process.env.EMAIL_USER}`);
    } else {
      log('red', '   ❌ EMAIL_USER not set in .env');
      allChecks = false;
    }
    
    if (process.env.EMAIL_PASS) {
      log('green', '   ✅ EMAIL_PASS configured (hidden)');
    } else {
      log('red', '   ❌ EMAIL_PASS not set in .env');
      allChecks = false;
    }

    if (process.env.JWT_SECRET) {
      log('green', '   ✅ JWT_SECRET configured');
    } else {
      log('red', '   ❌ JWT_SECRET not set in .env');
      allChecks = false;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      log('green', '   ✅ FIREBASE_SERVICE_ACCOUNT configured');
    } else {
      log('red', '   ❌ FIREBASE_SERVICE_ACCOUNT not set in .env');
      allChecks = false;
    }
  } else {
    log('red', '   ❌ .env file not found');
    allChecks = false;
  }

  // Check 2: Dependencies installed
  log('cyan', '\n2️⃣  Checking dependencies...');
  const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
  const requiredDeps = ['express', 'nodemailer', 'firebase-admin', 'bcryptjs', 'jsonwebtoken'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      log('green', `   ✅ ${dep} installed`);
    } else {
      log('red', `   ❌ ${dep} not found in package.json`);
      allChecks = false;
    }
  }

  // Check 3: Backend running
  log('cyan', '\n3️⃣  Checking if backend is running...');
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/health', {
      timeout: 3000
    });
    log('green', '   ✅ Backend is running on port 5000');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      log('yellow', '   ⚠️  Backend is NOT running');
      log('yellow', '   Start with: node server.js');
      allChecks = false;
    } else {
      log('red', `   ❌ Error: ${err.message}`);
    }
  }

  // Check 4: Email routes exist
  log('cyan', '\n4️⃣  Checking email routes...');
  const routesFile = fs.readFileSync(resolve(__dirname, 'routes/authRoutes.js'), 'utf-8');
  const requiredRoutes = [
    '/signup',
    '/send-email-otp',
    '/verify-email-otp',
    '/login'
  ];

  for (const route of requiredRoutes) {
    if (routesFile.includes(route)) {
      log('green', `   ✅ Route "${route}" found`);
    } else {
      log('red', `   ❌ Route "${route}" not found`);
      allChecks = false;
    }
  }

  // Check 5: Email utility configured
  log('cyan', '\n5️⃣  Checking email utility...');
  const emailFile = fs.readFileSync(resolve(__dirname, 'utils/sendEmail.js'), 'utf-8');
  if (emailFile.includes('nodemailer') && emailFile.includes('sendOTPEmail')) {
    log('green', '   ✅ Email utility is configured');
  } else {
    log('red', '   ❌ Email utility is not properly configured');
    allChecks = false;
  }

  // Summary
  log('cyan', '\n📊 Summary:');
  if (allChecks) {
    log('green', '\n✅ All checks passed! Backend is ready.\n');
    log('yellow', 'Next steps:');
    log('blue', '1. Make sure backend is running: node server.js');
    log('blue', '2. Start frontend: cd frontend && npm run dev');
    log('blue', '3. Test signup and email verification');
  } else {
    log('red', '\n❌ Some checks failed. Fix the issues above.\n');
    log('yellow', 'Common fixes:');
    log('blue', '1. Run: npm install (in backend folder)');
    log('blue', '2. Create .env file with EMAIL_USER and EMAIL_PASS');
    log('blue', '3. Ensure Gmail credentials are valid');
  }
}

verifyBackend().catch(err => {
  log('red', `\n❌ Verification error: ${err.message}`);
  process.exit(1);
});
