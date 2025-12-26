#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Checks all critical configurations before deploying
 * Run this before deploying to catch issues early
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, type = 'info') {
  const prefix = {
    error: `${colors.red}❌${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    info: `${colors.blue}ℹ️${colors.reset}`,
  };

  console.log(`${prefix[type]} ${message}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`${description} exists`, 'success');
    return true;
  } else {
    log(`${description} missing: ${filePath}`, 'error');
    return false;
  }
}

function checkEnvVar(envPath, varName) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes(`${varName}=`)) {
      const value = envContent.match(new RegExp(`${varName}=([^\n]*)`));
      if (value && value[1].trim()) {
        log(`${varName} is set`, 'success');
        return true;
      } else {
        log(`${varName} is empty`, 'warning');
        return false;
      }
    } else {
      log(`${varName} not found in .env`, 'error');
      return false;
    }
  } catch (err) {
    log(`Cannot read .env: ${err.message}`, 'error');
    return false;
  }
}

console.log('\n========================================');
console.log('   🚀 DEPLOYMENT VERIFICATION SCRIPT');
console.log('========================================\n');

let allChecks = [];

// ========== BACKEND CHECKS ==========
console.log(`${colors.blue}[1] BACKEND CONFIGURATION${colors.reset}`);
console.log('-----------------------------------');

allChecks.push(checkFileExists('backend/.env', 'Backend .env'));
allChecks.push(checkFileExists('backend/server.js', 'Backend server.js'));
allChecks.push(checkFileExists('backend/config/firebase.js', 'Firebase config'));

const requiredBackendVars = [
  'FIREBASE_PROJECT_ID',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
];

console.log('\nChecking Backend Environment Variables:');
for (const varName of requiredBackendVars) {
  if (checkEnvVar('backend/.env', varName)) {
    allChecks.push(true);
  } else {
    allChecks.push(false);
  }
}

// ========== FRONTEND CHECKS ==========
console.log(`\n${colors.blue}[2] FRONTEND CONFIGURATION${colors.reset}`);
console.log('-----------------------------------');

allChecks.push(checkFileExists('frontend/package.json', 'Frontend package.json'));
allChecks.push(checkFileExists('frontend/vite.config.js', 'Frontend vite.config.js'));
allChecks.push(checkFileExists('frontend/src/api/axios.js', 'Frontend axios config'));

// ========== ADMIN CHECKS ==========
console.log(`\n${colors.blue}[3] ADMIN DASHBOARD CONFIGURATION${colors.reset}`);
console.log('-----------------------------------');

allChecks.push(checkFileExists('admin/package.json', 'Admin package.json'));
allChecks.push(checkFileExists('admin/vite.config.js', 'Admin vite.config.js'));
allChecks.push(checkFileExists('admin/src/api/admin.js', 'Admin API config'));

// ========== GIT CHECKS ==========
console.log(`\n${colors.blue}[4] GIT REPOSITORY STATUS${colors.reset}`);
console.log('-----------------------------------');

allChecks.push(checkFileExists('.git', 'Git repository'));
allChecks.push(checkFileExists('.gitignore', '.gitignore file'));

// ========== PACKAGE CHECKS ==========
console.log(`\n${colors.blue}[5] DEPENDENCIES${colors.reset}`);
console.log('-----------------------------------');

try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf-8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf-8'));
  const adminPkg = JSON.parse(fs.readFileSync('admin/package.json', 'utf-8'));

  log('Backend package.json valid', 'success');
  log('Frontend package.json valid', 'success');
  log('Admin package.json valid', 'success');

  allChecks.push(true, true, true);
} catch (err) {
  log(`Package.json error: ${err.message}`, 'error');
  allChecks.push(false, false, false);
}

// ========== CRITICAL FILES ==========
console.log(`\n${colors.blue}[6] CRITICAL APPLICATION FILES${colors.reset}`);
console.log('-----------------------------------');

const criticalFiles = [
  'backend/routes/adminRoutes.js',
  'backend/controllers/authController.js',
  'backend/controllers/paymentController.js',
  'backend/models/User.js',
  'backend/models/Order.js',
  'backend/models/Product.js',
  'frontend/src/App.jsx',
  'frontend/src/pages/CheckoutAddress.jsx',
  'admin/src/pages/DashboardPage.jsx',
  'admin/src/pages/ProductsPage.jsx',
];

for (const file of criticalFiles) {
  allChecks.push(checkFileExists(file, file));
}

// ========== SUMMARY ==========
console.log(`\n${'='.repeat(40)}`);

const passCount = allChecks.filter(c => c === true).length;
const failCount = allChecks.filter(c => c === false).length;
const totalCount = allChecks.length;

console.log(`\n${colors.blue}VERIFICATION SUMMARY${colors.reset}`);
console.log(`Total Checks: ${totalCount}`);
console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);

if (failCount === 0) {
  console.log(`\n${colors.green}✅ ALL CHECKS PASSED! Ready for deployment.${colors.reset}\n`);
  console.log('Next steps:');
  console.log('1. npm run build  (in frontend and admin directories)');
  console.log('2. git push origin main');
  console.log('3. Deploy to Railway (backend)');
  console.log('4. Deploy to Vercel (frontend + admin)');
  console.log('5. Follow DEPLOYMENT_WITHOUT_BREAKPOINTS.md for detailed steps\n');
  process.exit(0);
} else {
  console.log(`\n${colors.red}❌ SOME CHECKS FAILED!${colors.reset}`);
  console.log(`Fix the ${failCount} issue(s) above before deploying.\n`);
  console.log('Common fixes:');
  console.log('- Check backend/.env has all required variables');
  console.log('- Verify FIREBASE_PRIVATE_KEY is correctly formatted');
  console.log('- Update API URLs to production values');
  console.log('- Run: npm install in each directory\n');
  process.exit(1);
}
