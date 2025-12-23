# 🧪 How to Test the Signup → OTP Flow

## Prerequisites

✅ Backend running on http://127.0.0.1:5000  
✅ Frontend running on http://localhost:5173  
✅ Firebase credentials configured (or using Mock DB)  
✅ Gmail credentials configured for email  

## Step-by-Step Test

### Step 1: Start Backend
```bash
cd c:\aurie\aurie-candles\backend
node server.js
```

**Expected Output:**
```
✅ Aurie Candles Backend
📦 Server running on http://localhost:5000
🔗 API: http://localhost:5000/api
💾 Database: Firestore (with Mock DB fallback)

📧 Email Configuration:
   User: sanjanadubariya2@gmail.com
   Password configured: true
   Service: Gmail SMTP

✅ Email service ready to send emails
```

### Step 2: Start Frontend
```bash
cd c:\aurie\aurie-candles\frontend
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 3: Open Browser
Go to: **http://localhost:5173**

### Step 4: Open DevTools
Press **F12** to open browser console.  
You'll use this to debug.

### Step 5: Click Sign Up Tab

**You should see:**
- Form with 4 fields: Name, Email, Password, Confirm Password
- "Sign Up" button
- Text saying "Don't have an account? Sign Up"

### Step 6: Fill Signup Form

**Example:**
```
Name:            Test User
Email:           your-email@gmail.com
Password:        Test@123
Confirm Password: Test@123
```

**Check Form Validation:**
- ✅ Name field accepts text
- ✅ Email field accepts email format
- ✅ Password field accepts 6+ characters
- ✅ Confirm field must match

### Step 7: Click "Sign Up" Button

**Watch Console (F12):**
```
📤 [API] POST http://127.0.0.1:5000/api/auth/signup
```

**Watch Backend Console:**
```
POST /api/auth/signup
  Origin: http://localhost:5173
  Content-Type: application/json

📧 Generated OTP: 123456 for your-email@gmail.com
📧 [EMAIL] Sending to: your-email@gmail.com
✅ [EMAIL] Sent successfully!
```

### Step 8: Watch Page Change

**Expected:**
✨ **NEW PAGE SHOULD APPEAR!**

You should see:
```
┌─────────────────────────────────┐
│  Verify Email                   │
│                                 │
│  We sent an OTP to              │
│  your-email@gmail.com           │
│                                 │
│  Enter 6-Digit OTP              │
│  [      ]  ← Large input field  │
│                                 │
│  [  Verify OTP  ]               │
│  [  Resend OTP  ]               │
│                                 │
│  💡 Didn't receive? ...         │
│                                 │
│  Back to Signup ← Link          │
└─────────────────────────────────┘
```

**Console Output:**
```
📥 [API] Response 200: {user: {...}, token: "..."}
Starting signup with: {name: "Test User", email: "your-email@gmail.com"}
Signup response: {user: {id: "3", name: "Test User", ...}, token: "jwt..."}

VerifyEmail loaded with: {userId: "3", token: true, user: "your-email@gmail.com"}
```

### Step 9: Check Email

**Go to Gmail:**
1. Open Gmail in new tab (https://gmail.com)
2. Log in if needed
3. Check inbox for email from "noreply@aurie.com"
4. Subject: "Aurie Candles - Email Verification"
5. Body should contain: "Your email verification code is: 123456" (or similar 6 digits)

**If email not received:**
- Check spam folder
- Check promotions tab
- Wait a few seconds (Gmail can be slow)
- Check Firebase is fixed (if using actual database)

### Step 10: Copy OTP

**From the email:**
- Find the 6-digit code (e.g., 123456)
- Copy it

### Step 11: Enter OTP on Verification Page

**Back to browser:**
1. Click the OTP input field
2. Paste or type the OTP (e.g., 123456)
3. Input should accept only numbers
4. Should show all 6 digits: [123456]

### Step 12: Click "Verify OTP"

**Watch Console:**
```
📤 [API] POST http://127.0.0.1:5000/api/auth/verify-email-otp
```

**Watch Backend:**
```
POST /api/auth/verify-email-otp
Verify email OTP error: (should be empty - no error)
```

### Step 13: Verify Success

**Expected:**
```
✅ Success!
✅ Email verified successfully!
Redirecting...
```

**Then after 1.5 seconds:**
- 🏠 **Redirects to Home page**

### Step 14: Confirm Login

**On Home page:**
- ✅ You should see the home page content
- ✅ You are logged in!
- ✅ User name might show in header (if header shows it)

## Troubleshooting

### Issue 1: Page Doesn't Change to VerifyEmail

**Check:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors in red
4. Take screenshot of error
5. Check Backend console for errors

**Possible Causes:**
- Backend error on signup
- Token not being saved
- Router not updating

**Fix:**
- Check backend logs for error message
- Refresh page
- Try different email

### Issue 2: No Email Received

**Check:**
1. Backend console shows email sent ✅
2. Gmail inbox (not spam)
3. Gmail promotions tab
4. Gmail social tab
5. Gmail other tab

**Possible Causes:**
- Gmail settings blocking email
- App password invalid
- Firebase not configured
- Email sent to wrong account

**Fix:**
- Check Gmail settings
- Regenerate Gmail app password
- Fix Firebase credentials
- Try different email

### Issue 3: OTP Verification Fails

**Error:** "Invalid OTP"

**Check:**
1. OTP matches exactly (6 digits)
2. No extra spaces
3. Correct OTP from email
4. OTP not expired (10 minute limit)

**Fix:**
- Copy OTP exactly from email
- Try resending OTP
- Check exact format (no spaces)

### Issue 4: "Session Expired" Error

**Check:**
1. Token saved in localStorage
2. Browser hasn't cleared cache
3. Tab is still open

**Fix:**
- Refresh page
- Try signup again
- Clear browser cache

### Issue 5: Form Won't Submit

**Check:**
1. All fields filled
2. Passwords match
3. Password at least 6 chars
4. Email format valid

**Fix:**
- Fill all required fields
- Make sure passwords match
- Use strong password
- Use valid email format

## Success Criteria ✅

- [ ] 1. Signup form visible
- [ ] 2. Form accepts input
- [ ] 3. Clicking "Sign Up" works
- [ ] 4. Page changes to VerifyEmail
- [ ] 5. Shows user's email address
- [ ] 6. OTP input visible
- [ ] 7. Email received in Gmail
- [ ] 8. OTP entered successfully
- [ ] 9. Clicking "Verify" works
- [ ] 10. Shows success message
- [ ] 11. Redirects to Home
- [ ] 12. User is logged in

## What Each Button Does

### "Sign Up" Button
- Validates form
- Sends to backend
- Creates user
- Generates OTP
- Sends email
- Shows VerifyEmail page

### "Verify OTP" Button
- Checks OTP length (must be 6)
- Sends OTP to backend
- Verifies OTP is correct
- Updates user verified status
- Redirects to home

### "Resend OTP" Button
- Generates new OTP
- Sends new email
- Clears input field
- Shows success message

### "Back to Login" Link
- Takes you back to signup form
- You can try again

## Console Logging

### Frontend Console Shows:
```
📤 API request being sent
📥 API response received
"Starting signup..."
"Signup response: ..."
"VerifyEmail loaded..."
"Verifying OTP..."
"Verification response: ..."
"✅ Email verified!"
```

### Backend Console Shows:
```
POST /api/auth/signup
  Origin: http://localhost:5173
📧 Generated OTP: 123456
📧 [EMAIL] Sending to: test@gmail.com
✅ [EMAIL] Sent successfully!

POST /api/auth/verify-email-otp
(Should have no error)
```

## Timing

- Signup form → 0s
- Fill form → 5s
- Click signup → 10s
- Backend processing → 1s
- Email sent → 11s
- Page redirects → 12s
- User receives email → 15-30s
- User enters OTP → 20s
- Click verify → 21s
- Backend verification → 1s
- Redirect to home → 23s

**Total time: ~20-30 seconds**

## That's It! 🎉

Now you know exactly how to test the complete signup → OTP verification flow!

If everything works, you'll see:
✅ Signup form
✅ VerifyEmail page appears
✅ Email received
✅ OTP verified
✅ Logged in to home page

Success! 🚀
