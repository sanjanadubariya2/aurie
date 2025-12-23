# ✅ Signup → OTP Verification Flow

## How It Works

### Step 1: User Clicks Signup
1. User fills signup form (Name, Email, Password, Confirm Password)
2. Frontend validates input
3. User clicks "Sign Up" button

### Step 2: User Sees Verification Page
After successful signup, the page **automatically redirects** to the OTP verification page.

```
AuthPage (Signup Form)
    ↓ [Form Submitted]
    ↓ [Backend creates user]
    ↓ [Backend generates OTP]
    ↓ [Backend sends OTP email]
    ↓
VerifyEmail (OTP Entry Page) ← NEW PAGE APPEARS HERE
```

### Step 3: User Enters OTP
1. User receives OTP in email (6 digits)
2. User enters OTP on the verification page
3. User clicks "Verify OTP"

### Step 4: User Verified
1. Backend verifies OTP is correct
2. Email marked as verified
3. **Page redirects to Home**
4. User can now use their account

## What Actually Happens

### Component Flow:

```
AppProvider
  ├─ Router
  │   ├─ If route = "signup" → AuthPage
  │   ├─ If route = "verify:userId" → VerifyEmail
  │   └─ If route = "home" → Home
  │
  └─ Context (AppContext)
      ├─ user (logged in user)
      ├─ token (JWT token)
      └─ route (current page)
```

### State Management:

```javascript
// In AuthPage after signup:
const response = await registerUser(name, email, password);

if (response.user) {
  setUser(response.user);        // Save user
  setToken(response.token);      // Save token
  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.user));
  
  // Redirect to verification page
  setRoute(`verify:${response.user.id}`);
}

// Router sees "verify:3" and renders:
<VerifyEmail userId="3" />

// VerifyEmail gets token and user from context
const { token, user, setRoute } = useApp();
```

## Data Flow

### Signup Request:
```
Frontend → Backend
POST /api/auth/signup
{
  name: "John Doe",
  email: "john@gmail.com",
  password: "hashedPassword"
}
```

### Signup Response:
```
Backend → Frontend
200 OK
{
  success: true,
  user: {
    id: "3",
    name: "John Doe",
    email: "john@gmail.com",
    emailVerified: false
  },
  token: "jwt_token_here"
}
```

### OTP Email Sent:
```
Backend → Gmail
Subject: Aurie Candles - Email Verification
Body: Your verification code is: 123456
```

### OTP Verification Request:
```
Frontend → Backend
POST /api/auth/verify-email-otp
Authorization: Bearer jwt_token_here
{
  otp: "123456"
}
```

### OTP Verification Response:
```
Backend → Frontend
200 OK
{
  success: true,
  msg: "Email verified successfully"
}
```

## File Structure

```
frontend/
├─ src/
│  ├─ pages/
│  │  ├─ AuthPage.jsx          ← Signup form
│  │  └─ VerifyEmail.jsx       ← OTP verification page
│  │
│  ├─ api/
│  │  └─ auth.js               ← API calls
│  │
│  ├─ router/
│  │  └─ Router.jsx            ← Route logic
│  │
│  ├─ context/
│  │  └─ AppContext.jsx        ← State management
│  │
│  └─ App.jsx                  ← Main app
```

## Frontend Pages

### 1. AuthPage.jsx - Signup Form

**Input Fields:**
- Name (required)
- Email (required, validated)
- Password (required, min 6 chars)
- Confirm Password (required, must match)

**Validation:**
- Name not empty
- Email format valid
- Passwords match
- Password at least 6 characters

**After Signup:**
- Stores user and token in context
- Stores in localStorage (persists across page refresh)
- Redirects to VerifyEmail page

### 2. VerifyEmail.jsx - OTP Entry

**Display:**
- Shows user's email address
- Shows instruction: "We sent an OTP to {email}"
- Large OTP input field (6 digits)

**Buttons:**
- "Verify OTP" - Checks OTP against backend
- "Resend OTP" - Sends OTP again

**Error Handling:**
- Shows specific error messages
- "OTP must be 6 digits"
- "Session expired"
- "Invalid OTP"

**After Verification:**
- Shows success message
- Waits 1.5 seconds
- Redirects to Home page

## API Endpoints Used

### 1. Signup
```
POST /api/auth/signup
Body: { name, email, password }
Response: { user, token }
```

### 2. Send OTP
```
POST /api/auth/send-email-otp
Header: Authorization: Bearer {token}
Response: { success, msg }
```

### 3. Verify OTP
```
POST /api/auth/verify-email-otp
Header: Authorization: Bearer {token}
Body: { otp }
Response: { success, msg }
```

## Complete User Journey

```
1. User visits app
   ↓
2. Sees "Sign Up" button
   ↓
3. Enters name, email, password
   ↓
4. Clicks "Sign Up"
   ↓
5. Frontend sends signup request
   ↓
6. Backend creates user & generates OTP
   ↓
7. Backend sends OTP to email
   ↓
8. Frontend gets response with token
   ↓
9. Frontend redirects to VerifyEmail page ← NEW PAGE APPEARS
   ↓
10. User sees "We sent OTP to john@gmail.com"
    ↓
11. User receives email with OTP
    ↓
12. User enters OTP (123456) on the page
    ↓
13. User clicks "Verify OTP"
    ↓
14. Frontend sends OTP to backend
    ↓
15. Backend verifies OTP matches
    ↓
16. Backend marks user.emailVerified = true
    ↓
17. Frontend gets success response
    ↓
18. Shows "✅ Email verified successfully!"
    ↓
19. Waits 1.5 seconds
    ↓
20. Redirects to Home page ← USER CAN NOW USE APP
    ↓
21. User is logged in and verified ✅
```

## Testing the Flow

### Step 1: Start Backend
```bash
cd backend
node server.js
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Go to Signup
```
http://localhost:5173
Click "Sign Up"
```

### Step 4: Fill Signup Form
```
Name: Test User
Email: your-email@gmail.com
Password: Test@123
Confirm: Test@123
Click "Sign Up"
```

### Step 5: Check Redirection
```
✅ Should see VerifyEmail page
✅ Page title: "Verify Email"
✅ Shows "We sent an OTP to your-email@gmail.com"
```

### Step 6: Enter OTP
```
✅ Check your email for OTP
✅ OTP format: 6 digits (e.g., 123456)
✅ Enter into form field
✅ Click "Verify OTP"
```

### Step 7: Verify Success
```
✅ Should see "✅ Email verified successfully!"
✅ After 1.5 seconds, redirects to Home
✅ You are logged in! 🎉
```

## Debugging

### Open Browser Console (F12):

**You should see:**
```
📤 [API] POST http://127.0.0.1:5000/api/auth/signup
📥 [API] Response 200: {user: {...}, token: "..."}
Starting signup with: {name, email}
Signup response: {user: {...}, token: "..."}

VerifyEmail loaded with: {userId: "3", token: true, user: "john@gmail.com"}

📤 [API] POST http://127.0.0.1:5000/api/auth/verify-email-otp
📥 [API] Response 200: {success: true}
Verification response: {success: true}
✅ Email verified successfully!
```

### Backend Console:

**You should see:**
```
[timestamp] POST /api/auth/signup
📧 Generated OTP: 123456 for john@gmail.com
📧 [EMAIL] Sending to: john@gmail.com
✅ [EMAIL] Sent successfully!

[timestamp] POST /api/auth/verify-email-otp
Verify email OTP error: (none, should succeed)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| After signup, page doesn't change | Check browser console for errors |
| VerifyEmail page shows error | Check token is saved properly |
| OTP entry field not accepting input | Try clearing form and retry |
| OTP verification shows "Invalid OTP" | Check OTP matches exactly |
| Page won't redirect to Home | Check backend email verification logic |
| Session expired error | Signup didn't save token properly |

## Summary

✅ **Signup Form** → AuthPage.jsx  
✅ **After Signup** → Automatically redirects to VerifyEmail.jsx  
✅ **OTP Entry** → VerifyEmail.jsx accepts 6-digit code  
✅ **After Verification** → Redirects to Home page  
✅ **User Logged In** → Can now browse app  

**Complete flow takes about 30 seconds!**
