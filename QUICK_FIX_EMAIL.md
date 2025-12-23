# 🚀 Quick Fix Guide - Email Not Being Received

Your backend and frontend ARE properly linked! Here's how to fix the email issue.

## Immediate Action Items

### 1. Check if Backend is Running ⚡
```bash
cd c:\aurie\aurie-candles\backend
node server.js
```

**Look for these lines:**
```
✅ Aurie Candles Backend
✅ Email service ready to send emails
```

If you see `❌ Email service verification failed`, skip to Step 3.

### 2. Test Email with Your Account 📧

In a separate terminal:
```bash
cd c:\aurie\aurie-candles\backend
node test-email-verification.js your-personal-email@gmail.com
```

Follow the prompts to test signup and OTP verification.

### 3. If Emails Still Don't Arrive ❌

**Most likely**: Gmail credentials are wrong or revoked.

Go to: https://myaccount.google.com/apppasswords

1. Select "Mail" dropdown → choose "Mail"
2. Select "Device" dropdown → choose "Windows Computer"
3. Click "Generate"
4. Copy the 16-character App Password (with spaces)

### 4. Update Your .env File 🔑

Open: `c:\aurie\aurie-candles\backend\.env`

Find this section:
```
EMAIL_USER=sanjanadubariya2@gmail.com
EMAIL_PASS=cvjl ebkw ppfo ters
```

Replace `EMAIL_PASS` with the new App Password you just generated.

### 5. Restart Backend 🔄

```bash
# Press Ctrl+C to stop current backend
# Then restart:
node server.js
```

Look for: `✅ Email service ready to send emails`

### 6. Try Signup Again 🧪

- Go to frontend (http://localhost:5173 or wherever it runs)
- Sign up with your personal Gmail account
- Wait for email

### 7. Check Gmail Folders 📫

- [ ] Check Inbox
- [ ] Check Spam folder
- [ ] Check Promotions tab
- [ ] Check Other folder

Mark email as "Not Spam" if found in spam.

## If Still Not Working

### Option A: Verify Credentials Are Working
```bash
cd c:\aurie\aurie-candles\backend

# Open Node REPL
node

# In the REPL, paste this:
import('nodemailer').then(m => {
  const transporter = m.default.createTransport({
    service: 'gmail',
    auth: {
      user: 'sanjanadubariya2@gmail.com',
      pass: 'YOUR_NEW_APP_PASSWORD'  // Replace with new password
    }
  });
  
  transporter.verify((err, success) => {
    if (err) console.error('❌ Failed:', err.message);
    else console.log('✅ Gmail connection works!');
    process.exit(0);
  });
});
```

### Option B: Add Extra Debug Logging

Edit `c:\aurie\aurie-candles\backend\utils\sendEmail.js`

After line 19, add:
```javascript
console.log('🔍 DEBUG: Attempting to connect to Gmail');
console.log('🔍 DEBUG: Email user:', process.env.EMAIL_USER);
console.log('🔍 DEBUG: Password length:', process.env.EMAIL_PASS?.length);
```

Then restart and try signup again.

### Option C: Try Different Gmail Account

Test with a personal Gmail account (not corporate):
1. Create test email at gmail.com
2. Get App Password for new account
3. Update .env with new credentials
4. Restart backend
5. Try signup

## System Status

| Component | Status | What to Check |
|-----------|--------|---------------|
| Backend ↔ Frontend | ✅ OK | Backend logs show requests |
| Routes Connected | ✅ OK | `/api/auth/signup` works |
| Firebase | ✅ OK | OTPs being stored |
| Gmail SMTP | ⚠️ ISSUE | Credentials invalid or revoked |

## What Should Happen (Normal Flow)

1. **User signs up**
   - Frontend sends: POST /api/auth/signup
   - Backend receives and logs it

2. **Backend generates OTP**
   - Backend shows: `📧 Generated OTP: 123456`

3. **Backend sends email**
   - Backend shows: `✅ [EMAIL] Sent successfully!`

4. **Email arrives**
   - Check your Gmail inbox
   - Subject: "Aurie Candles - Email Verification"

5. **User enters OTP**
   - User copies OTP from email
   - Enters into verification page

6. **Verification succeeds**
   - Backend shows: `✅ Email verified successfully`
   - Frontend redirects to home

## Common Error Messages & Fixes

### Error: "Username and Password not accepted"
**Fix**: Update App Password from https://myaccount.google.com/apppasswords

### Error: "ENOTFOUND smtp.gmail.com"
**Fix**: Network/firewall issue. Try different network.

### Error: "OTP expired"
**Fix**: 10-minute window. User must verify within 10 minutes.

### Error: "No OTP found"
**Fix**: User didn't sign up properly or OTP wasn't created.

## Files to Check

- **Backend Server**: `c:\aurie\aurie-candles\backend\server.js` ✅
- **Auth Routes**: `c:\aurie\aurie-candles\backend\routes\authRoutes.js` ✅
- **Email Utility**: `c:\aurie\aurie-candles\backend\utils\sendEmail.js` ✅
- **Credentials**: `c:\aurie\aurie-candles\backend\.env` ⚠️ (UPDATE THIS)
- **Frontend Signup**: `c:\aurie\aurie-candles\frontend\src\pages\AuthPage.jsx` ✅
- **Frontend Verify**: `c:\aurie\aurie-candles\frontend\src\pages\VerifyEmail.jsx` ✅

## 🎯 Bottom Line

Your system IS properly linked. Just fix the Gmail credentials and it will work!

**Next step**: Generate new App Password at https://myaccount.google.com/apppasswords
