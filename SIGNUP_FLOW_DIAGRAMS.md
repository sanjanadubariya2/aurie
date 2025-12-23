# 📊 Signup → OTP Flow Diagrams

## High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  STEP 1: Signup Form                                    │
│  ┌──────────────────────────────────┐                  │
│  │ AuthPage (SignUp Tab)            │                  │
│  │ ─────────────────────────────    │                  │
│  │ Name:        [_____________]     │                  │
│  │ Email:       [_____________]     │                  │
│  │ Password:    [_____________]     │                  │
│  │ Confirm:     [_____________]     │                  │
│  │                                  │                  │
│  │ [       SIGN UP BUTTON       ]   │                  │
│  └──────────────────────────────┘   │                  │
│               ↓                       │                  │
│  STEP 2: Verification Page (APPEARS)│                  │
│  ┌──────────────────────────────────┐                  │
│  │ VerifyEmail Page                 │                  │
│  │ ─────────────────────────────    │                  │
│  │ "Verify Email"                   │                  │
│  │ We sent OTP to john@gmail.com    │                  │
│  │                                  │                  │
│  │ Enter OTP:  [____________]       │                  │
│  │ (6 digits)                       │                  │
│  │                                  │                  │
│  │ [    VERIFY OTP BUTTON       ]   │                  │
│  │ [   RESEND OTP BUTTON        ]   │                  │
│  │                                  │                  │
│  │ 💡 Didn't receive? Check spam   │                  │
│  └──────────────────────────────────┘                  │
│               ↓                       │                  │
│  STEP 3: Redirect to Home           │                  │
│  ┌──────────────────────────────────┐                  │
│  │ Home Page                        │                  │
│  │ ✅ You are logged in!            │                  │
│  └──────────────────────────────────┘                  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Request-Response Cycle

```
┌──────────────────────┐                ┌──────────────────────┐
│                      │                │                      │
│  FRONTEND            │                │  BACKEND             │
│  (Browser)           │                │  (Node.js Server)    │
│                      │                │                      │
│  AuthPage            │                │                      │
│  ┌────────────────┐  │                │                      │
│  │ Sign Up Form   │  │                │                      │
│  └────────────────┘  │                │                      │
│         │            │                │                      │
│         │ registerUser()               │                      │
│         │ POST /auth/signup            │                      │
│         ├───────────────────────────→  │  ┌────────────────┐  │
│         │ {name, email, password}      │  │ Create User    │  │
│         │                              │  │ Hash Password  │  │
│         │                              │  │ Generate OTP   │  │
│         │                              │  │ Save to Firebase│ │
│         │                              │  │ Send Email     │  │
│         │                              │  └────────────────┘  │
│         │ ← {user, token}              │                      │
│         │←───────────────────────────  │                      │
│         │                              │                      │
│  saveToContext()                       │                      │
│  setRoute("verify:3")                  │                      │
│  (Router updates)                      │                      │
│         │                              │                      │
│  VerifyEmail                           │                      │
│  ┌────────────────┐                    │                      │
│  │ OTP Form       │                    │                      │
│  │ (NEW PAGE!)    │                    │                      │
│  │ [Enter OTP]    │                    │                      │
│  └────────────────┘                    │                      │
│         │                              │                      │
│         │ verifyEmailOtp(token, otp)   │                      │
│         │ POST /verify-email-otp       │                      │
│         ├───────────────────────────→  │  ┌────────────────┐  │
│         │ {otp: "123456"}              │  │ Check OTP      │  │
│         │ Headers: token               │  │ Not Expired?   │  │
│         │                              │  │ Update User    │  │
│         │                              │  │ emailVerified  │  │
│         │                              │  └────────────────┘  │
│         │ ← {success: true}            │                      │
│         │←───────────────────────────  │                      │
│         │                              │                      │
│  setRoute("home")                      │                      │
│  (Redirects to Home)                   │                      │
│                                        │                      │
└──────────────────────┘                └──────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────┐
│              AppContext (Global State)               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  INITIAL STATE:                                     │
│  ┌──────────────────────┐                          │
│  │ user: null           │                          │
│  │ token: null          │                          │
│  │ route: "signup"      │                          │
│  └──────────────────────┘                          │
│           ↓                                         │
│  AFTER SIGNUP:                                     │
│  ┌──────────────────────┐                          │
│  │ user: {              │                          │
│  │   id: "3",           │                          │
│  │   name: "John",      │                          │
│  │   email: "j@g.com",  │                          │
│  │   emailVerified:     │                          │
│  │     false            │  ← Not yet verified      │
│  │ }                    │                          │
│  │ token: "jwt..."      │                          │
│  │ route: "verify:3"    │                          │
│  └──────────────────────┘                          │
│           ↓                                         │
│  AFTER OTP VERIFICATION:                           │
│  ┌──────────────────────┐                          │
│  │ user: {              │                          │
│  │   id: "3",           │                          │
│  │   name: "John",      │                          │
│  │   email: "j@g.com",  │                          │
│  │   emailVerified:     │                          │
│  │     true             │  ← Verified! ✅          │
│  │ }                    │                          │
│  │ token: "jwt..."      │                          │
│  │ route: "home"        │                          │
│  └──────────────────────┘                          │
│                                                    │
└─────────────────────────────────────────────────────┘
```

## Router Logic

```
┌────────────────────────────────────────┐
│         Router.jsx                      │
├────────────────────────────────────────┤
│                                         │
│  const { route } = useApp()             │
│                                         │
│  if (route.startsWith("verify:")) {    │
│     const userId = route.split(":")[1] │
│     ↓                                   │
│     return <VerifyEmail userId={id} /> │
│     ↓                                   │
│     (NEW PAGE APPEARS HERE!) ✨        │
│  }                                      │
│                                         │
│  if (route === "signup") {              │
│     return <AuthPage />                 │
│  }                                      │
│                                         │
│  if (route === "home") {                │
│     return <Home />                     │
│  }                                      │
│                                         │
└────────────────────────────────────────┘
```

## Email Journey

```
┌─────────────────┐
│  User Signup    │
│  Form Submitted │
└────────┬────────┘
         │
         ↓
┌──────────────────────────────┐
│   Backend Processing          │
│  ┌──────────────────────────┐│
│  │ 1. Create user           ││
│  │ 2. Generate 6-digit OTP  ││
│  │    (e.g., 123456)        ││
│  │ 3. Store in Firebase     ││
│  │    (10-min expiry)        ││
│  │ 4. Create email          ││
│  └──────────────────────────┘│
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   Gmail SMTP Connection       │
│   (smtp.gmail.com:587)        │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   Email Sent                  │
│   ┌──────────────────────────┐│
│   │ From: noreply@aurie.com  ││
│   │ To: user@gmail.com       ││
│   │ Subject: Verify Email    ││
│   │ Body: Your code: 123456  ││
│   └──────────────────────────┘│
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   User's Email Inbox         │
│   (Gmail, Yahoo, Outlook)    │
│   ✉️ "Verify your email"     │
│   Code: 123456               │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   User Sees VerifyEmail Page │
│   On Frontend                │
│   "Enter OTP: [123456]"      │
│   Click "Verify"             │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   Backend Verification       │
│   ✅ OTP matches             │
│   ✅ Not expired             │
│   ✅ Mark user verified      │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│   ✅ Success!                │
│   Redirect to Home           │
│   User can browse app        │
└──────────────────────────────┘
```

## Timeline

```
Timeline: User Signup & Email Verification
═════════════════════════════════════════════

T+0s     User opens http://localhost:5173
         │
T+5s     User fills signup form
         │ Name: Test User
         │ Email: test@gmail.com
         │ Password: Test@123
         │
T+10s    User clicks "Sign Up" button
         ├─ Frontend sends POST /auth/signup
         │
T+11s    Backend receives signup
         ├─ Creates user in Firebase
         ├─ Generates OTP: 123456
         ├─ Sends email to test@gmail.com
         │
T+12s    Frontend receives response
         ├─ Saves user & token to context
         ├─ Route changes to "verify:3"
         ├─ ✨ NEW PAGE APPEARS! ✨
         │
T+13s    User sees VerifyEmail page
         │ "We sent OTP to test@gmail.com"
         │
T+15s    User receives email
         ├─ Gmail inbox shows OTP email
         ├─ Code: 123456
         │
T+20s    User copies OTP from email
         ├─ Enters: 123456
         ├─ Clicks "Verify OTP"
         │
T+21s    Frontend sends OTP to backend
         ├─ POST /verify-email-otp
         │
T+22s    Backend verifies
         ├─ OTP matches ✅
         ├─ Not expired ✅
         ├─ Sets emailVerified: true
         │
T+23s    Frontend shows success
         │ "✅ Email verified successfully!"
         │
T+24.5s  Frontend redirects
         ├─ setRoute("home")
         ├─ Redirects to home page
         │
T+25s    User sees Home page
         ├─ Logged in ✅
         ├─ Email verified ✅
         ├─ Can browse products
         │
         ✅ PROCESS COMPLETE!
```

## Component Hierarchy

```
App.jsx
│
└─ AppProvider
   │
   ├─ Router (Conditional Rendering)
   │  │
   │  ├─ route="signup" 
   │  │  └─ AuthPage
   │  │     ├─ Form with signup tab
   │  │     └─ Handles signup submit
   │  │
   │  ├─ route="verify:3" 
   │  │  └─ VerifyEmail (userId="3")
   │  │     ├─ Shows user email
   │  │     ├─ OTP input field
   │  │     ├─ Verify button
   │  │     └─ Resend button
   │  │
   │  └─ route="home"
   │     └─ Home
   │        └─ User dashboard
   │
   └─ Global State (useApp)
      ├─ user (current user)
      ├─ token (JWT)
      ├─ route (current page)
      └─ setRoute (navigation)
```

## That's It! 🎉

The **signup → OTP verification → home** flow is now complete and improved with better UI, error handling, and user feedback!
