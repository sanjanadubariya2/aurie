@echo off
REM ==========================================
REM  Environment Setup for Safe Deployment
REM  This script helps set up all environment
REM  variables correctly before deployment
REM ==========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   DEPLOYMENT ENVIRONMENT SETUP
echo ========================================
echo.

REM Check if backend/.env exists
if not exist "backend\.env" (
    echo [ERROR] backend\.env not found
    echo Please create the file first
    pause
    exit /b 1
)

echo [STEP 1] Backing up current .env
copy backend\.env backend\.env.backup >nul
echo Done! Backup saved as backend\.env.backup
echo.

echo [STEP 2] Verifying required variables
echo =====================================

set /p FIREBASE_PROJECT_ID="Enter Firebase Project ID (e.g., aurie-e7794): "
set /p ADMIN_EMAIL="Enter Admin Email (e.g., admin@test.com): "
set /p ADMIN_PASSWORD="Enter Admin Password: "
set /p JWT_SECRET="Enter JWT Secret (min 32 chars): "
set /p RAZORPAY_KEY_ID="Enter Razorpay Live Key ID (rzp_live_...): "
set /p RAZORPAY_KEY_SECRET="Enter Razorpay Key Secret: "
set /p TWILIO_ACCOUNT_SID="Enter Twilio Account SID: "
set /p TWILIO_AUTH_TOKEN="Enter Twilio Auth Token: "
set /p TWILIO_PHONE_NUMBER="Enter Twilio Phone Number: "

echo.
echo [STEP 3] Generating new JWT Secret
for /f "delims=" %%A in ('powershell -Command "[System.Guid]::NewGuid().ToString('N')" 2^>nul') do set JWT_SECRET=%%A
if "!JWT_SECRET!"=="" (
    echo Warning: Could not auto-generate JWT secret
    echo Using user-provided value
) else (
    echo Generated new JWT secret: !JWT_SECRET!
)
echo.

echo [STEP 4] Environment Variables Summary
echo =======================================
echo FIREBASE_PROJECT_ID=!FIREBASE_PROJECT_ID!
echo ADMIN_EMAIL=!ADMIN_EMAIL!
echo ADMIN_PASSWORD=!ADMIN_PASSWORD!
echo JWT_SECRET=!JWT_SECRET!
echo RAZORPAY_KEY_ID=!RAZORPAY_KEY_ID!
echo RAZORPAY_KEY_SECRET=!RAZORPAY_KEY_SECRET!
echo TWILIO_ACCOUNT_SID=!TWILIO_ACCOUNT_SID!
echo TWILIO_AUTH_TOKEN=!TWILIO_AUTH_TOKEN!
echo TWILIO_PHONE_NUMBER=!TWILIO_PHONE_NUMBER!
echo.

set /p CONFIRM="Does this look correct? (Y/N): "
if /i not "!CONFIRM!"=="Y" (
    echo Aborted. Restoring backup...
    copy backend\.env.backup backend\.env >nul
    pause
    exit /b 1
)

echo.
echo [STEP 5] Updating backend\.env
(
    echo FIREBASE_PROJECT_ID=!FIREBASE_PROJECT_ID!
    echo ADMIN_EMAIL=!ADMIN_EMAIL!
    echo ADMIN_PASSWORD=!ADMIN_PASSWORD!
    echo JWT_SECRET=!JWT_SECRET!
    echo RAZORPAY_KEY_ID=!RAZORPAY_KEY_ID!
    echo RAZORPAY_KEY_SECRET=!RAZORPAY_KEY_SECRET!
    echo TWILIO_ACCOUNT_SID=!TWILIO_ACCOUNT_SID!
    echo TWILIO_AUTH_TOKEN=!TWILIO_AUTH_TOKEN!
    echo TWILIO_PHONE_NUMBER=!TWILIO_PHONE_NUMBER!
    echo NODE_ENV=production
) > backend\.env

echo Updated backend\.env
echo.

echo [STEP 6] Running verification script
if exist "verify-deployment.js" (
    node verify-deployment.js
    if !errorlevel! neq 0 (
        echo.
        echo [ERROR] Verification failed!
        echo Please fix issues before deployment
        echo.
        set /p RESTORE="Restore backup? (Y/N): "
        if /i "!RESTORE!"=="Y" (
            copy backend\.env.backup backend\.env >nul
            echo Backup restored
        )
        pause
        exit /b 1
    )
) else (
    echo Warning: verify-deployment.js not found
    echo Skipping verification
)

echo.
echo ========================================
echo   ✅ SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Commit changes:
echo    git add backend\.env
echo    git commit -m "Update production environment"
echo    git push origin main
echo.
echo 2. Deploy to Railway:
echo    - Go to https://railway.app
echo    - Copy all variables from backend\.env
echo    - Paste into Railway Environment Variables
echo.
echo 3. Deploy to Vercel:
echo    - Frontend: VITE_API_URL=your-railway-url
echo    - Admin: VITE_API_URL=your-railway-url
echo.
echo Read QUICK_START_DEPLOYMENT.md for detailed steps
echo.
pause

endlocal
