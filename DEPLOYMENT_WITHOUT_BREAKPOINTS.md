# 🚀 Safe Deployment Guide - Zero Breakpoints

This guide ensures your Aurie Candles website deploys smoothly without breaking anything.

---

## 📋 Pre-Deployment Checklist

### 1. **Test Everything Locally First** ✅
Before deploying, verify everything works on your local machine:

```bash
# Terminal 1: Backend
cd backend
node server.js
# Should output: ✅ Aurie Candles Backend at http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Should run on http://localhost:5173

# Terminal 3: Admin
cd admin
npm run dev
# Should run on http://localhost:5175
```

**What to test:**
- ✅ User signup with email OTP
- ✅ User login and authentication
- ✅ Product browsing and search
- ✅ Add to cart functionality
- ✅ Checkout and payment (Razorpay test mode)
- ✅ Order creation and tracking
- ✅ Admin login
- ✅ Admin dashboard statistics
- ✅ Admin product management (create, edit, delete)
- ✅ Admin customer management
- ✅ Admin order status updates

---

## 🔐 Critical Files to Review Before Deploy

### Backend Files
1. **`backend/.env`** - Check these MUST exist:
   - `FIREBASE_PROJECT_ID=aurie-e7794`
   - `ADMIN_EMAIL=admin@test.com`
   - `ADMIN_PASSWORD=Admin@123`
   - `JWT_SECRET` (set to a strong value)
   - `RAZORPAY_KEY_ID` (production key)
   - `RAZORPAY_KEY_SECRET` (production secret)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

2. **`backend/server.js`** - Verify:
   - CORS configured: `origins: ["http://localhost:5173", "http://localhost:5175", "PRODUCTION_URL"]`
   - All routes imported and registered
   - Database initialized (Firestore)

3. **`backend/config/firebase.js`** - Ensure:
   - Firebase Admin SDK initialized
   - Firestore database accessible

### Frontend Files
1. **`frontend/src/api/axios.js`** - Set correct backend URL:
   ```javascript
   // LOCAL: http://localhost:5000
   // PRODUCTION: https://your-backend-url.com
   ```

2. **`frontend/vite.config.js`** - Port settings correct

3. **`frontend/.env`** (if exists) - No hardcoded secrets

### Admin Files
1. **`admin/src/api/axios.js`** - Backend URL updated
2. **`admin/vite.config.js`** - Port settings: `port: 5175`
3. **`admin/.env`** - No secrets included

---

## 🚀 Safe Deployment Steps

### **Phase 1: Prepare for Deployment (Local)**

```bash
# 1. Clean up node_modules
cd backend && rm -r node_modules && npm install
cd ../frontend && rm -r node_modules && npm install
cd ../admin && rm -r node_modules && npm install
cd ..

# 2. Run final tests
npm test  # (if test scripts exist)

# 3. Build production versions
cd frontend && npm run build && cd ..
cd admin && npm run build && cd ..

# 4. Commit to Git
git add -A
git commit -m "Pre-deployment: All systems tested and verified"
git push origin main
```

---

### **Phase 2: Deploy Backend to Railway** 🚂

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

#### Step 2: Connect GitHub Repository
1. Click "New Project" → "Deploy from GitHub"
2. Select `aurie-candles` repository
3. Select `main` branch

#### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to Settings → Environment
2. Add all variables from `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=aurie-e7794
   FIREBASE_PRIVATE_KEY_ID=xxx
   FIREBASE_PRIVATE_KEY=xxx
   FIREBASE_CLIENT_EMAIL=xxx
   ADMIN_EMAIL=admin@test.com
   ADMIN_PASSWORD=Admin@123
   JWT_SECRET=your-secret-key-32-chars-min
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   TWILIO_ACCOUNT_SID=ACxxx
   TWILIO_AUTH_TOKEN=xxx
   TWILIO_PHONE_NUMBER=+1xxx
   NODE_ENV=production
   ```

#### Step 4: Set Start Command
In Railway:
1. Go to Deployments
2. Set "Start Command" to: `node server.js`

#### Step 5: Verify Deployment
- Check Railway logs for errors
- Test endpoint: `https://your-railway-url.up.railway.app/api/health`
- Should return: `{"status":"ok"}`

---

### **Phase 3: Deploy Frontend to Vercel** ⚡

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

#### Step 2: Import Project
1. Click "New Project"
2. Select `aurie-candles` repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Node Version: 18.x or higher

#### Step 3: Set Environment Variables
In Vercel:
1. Go to Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app
   ```

#### Step 4: Deploy
Click "Deploy"

#### Step 5: Verify
- Frontend accessible at Vercel URL
- Check console for CORS errors
- Test login, product browsing, checkout

---

### **Phase 4: Deploy Admin Dashboard to Vercel** 👑

#### Step 1: Create Second Vercel Project
1. Click "New Project" (same Vercel account)
2. Select `aurie-candles` repository
3. Configure:
   - Root Directory: `admin`
   - Framework: Vite
   - Node Version: 18.x

#### Step 2: Set Environment Variables
In Vercel:
```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

#### Step 3: Deploy
Click "Deploy"

#### Step 4: Verify
- Admin accessible at Vercel URL
- Test admin login
- Test dashboard statistics
- Test product management

---

## ⚠️ Common Breakpoints & How to Avoid Them

### **1. CORS Errors** 🔴
**Symptom:** `Access to XMLHttpRequest blocked by CORS`

**Fix:**
```javascript
// backend/server.js
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5175",
    "https://your-frontend-vercel-url.vercel.app",
    "https://your-admin-vercel-url.vercel.app"
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

### **2. Environment Variables Missing** 🔴
**Symptom:** `undefined` values or "Firebase not initialized"

**Fix:**
```bash
# Before deploying, verify .env has all values
cd backend
cat .env | grep -E "FIREBASE|ADMIN|JWT|RAZORPAY|TWILIO"
# Should show all 10+ environment variables with values
```

### **3. Database Connection Failed** 🔴
**Symptom:** `Firestore not available` or `MockDB` in production

**Fix:**
1. Verify Firebase credentials are valid
2. Test locally: `node test-firestore.js`
3. Create Firestore database: https://console.firebase.google.com
4. Add all Firebase env vars (PRIVATE_KEY especially)

### **4. API URL Still Points to Localhost** 🔴
**Symptom:** Frontend makes requests to `http://localhost:5000`

**Fix:**
```javascript
// frontend/src/api/axios.js & admin/src/api/axios.js
const API = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:5000"
});
```

**In Vercel**, set `VITE_API_URL` to your Railway backend URL.

### **5. Authentication Token Issues** 🔴
**Symptom:** Logged out immediately after login, 401 errors

**Fix:**
```javascript
// Verify JWT_SECRET is same everywhere
// backend/.env: JWT_SECRET=your-secret
// admin/.env: REACT_APP_JWT_SECRET=your-secret (if needed)
```

### **6. Razorpay Payments Fail** 🔴
**Symptom:** Payment modal doesn't appear or shows "Invalid Key"

**Fix:**
- Use **production keys**, not test keys
- Verify `RAZORPAY_KEY_ID` starts with `rzp_live_`
- Test locally first with test keys
- Check Razorpay dashboard for active keys

### **7. Email/SMS Not Sending** 🔴
**Symptom:** OTP not received on email or phone

**Fix:**
- Gmail: Enable "Less Secure Apps" or use App Password
- Twilio: Add phone to "Verified Caller IDs"
- Check backend logs: `POST /api/auth/send-otp`

---

## 🔍 Deployment Verification Checklist

After all deployments complete, verify:

### Backend (Railway)
- [ ] Health check: `GET /api/health` returns `{status: "ok"}`
- [ ] Can create user: `POST /api/auth/signup`
- [ ] Can login: `POST /api/auth/login`
- [ ] Can get products: `GET /api/products`
- [ ] Can create order: `POST /api/orders`
- [ ] Admin login works: `POST /api/admin/login`

### Frontend (Vercel)
- [ ] Page loads without console errors
- [ ] Can signup with email
- [ ] Can login with credentials
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can checkout (test Razorpay)
- [ ] Can view orders

### Admin (Vercel)
- [ ] Admin page loads
- [ ] Can login with `admin@test.com / Admin@123`
- [ ] Dashboard shows statistics
- [ ] Can view products list
- [ ] Can create new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Can view customers
- [ ] Can view and update order status

---

## 🆘 If Something Breaks After Deploy

### Step 1: Check Logs
```bash
# Railway backend logs
# Go to Railway dashboard → Project → Deployments → View Logs

# Vercel frontend logs
# Go to Vercel dashboard → Project → Deployments → Logs

# Browser console errors
# Open deployed URL → F12 → Console tab
```

### Step 2: Rollback
```bash
# If critical issue, revert to previous version
git revert HEAD
git push origin main

# Railway and Vercel will auto-redeploy
```

### Step 3: Common Fixes
```bash
# Clear Railway environment and re-add variables
# Clear Vercel cache: Settings → Deployments → Redeploy

# Check all URLs are production URLs, not localhost
grep -r "localhost" . --exclude-dir=node_modules

# Verify all environment variables
# Railway: Settings → Environment
# Vercel: Settings → Environment Variables
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
└────────┬──────────────────────────────┬─────────────────┘
         │                              │
         ▼                              ▼
┌────────────────────┐        ┌──────────────────────┐
│ Frontend (Vercel)  │        │  Admin (Vercel)      │
│ vercel-url.app     │        │  vercel-admin-url    │
└────────┬───────────┘        └──────────┬───────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
            ┌─────────────────────────┐
            │ Backend (Railway)       │
            │ railway-url.up.railway  │
            │      .app               │
            └────────────┬────────────┘
                         │
                    ┌────▼────────┐
                    │  Firestore  │
                    │  Database   │
                    └─────────────┘
```

---

## 🎯 Summary: Safe Deployment Workflow

1. **Test Everything Locally** (30 min)
   - Run all 3 servers
   - Test all critical flows
   - Check console for errors

2. **Prepare Code** (15 min)
   - Review and update `.env` files
   - Update API URLs for production
   - Commit to Git

3. **Deploy Backend** (10 min)
   - Railway: New Project → GitHub → Set Env Vars → Deploy
   - Verify with health check

4. **Deploy Frontend** (10 min)
   - Vercel: New Project → Set Root: frontend → Set Env Vars → Deploy
   - Test basic functionality

5. **Deploy Admin** (10 min)
   - Vercel: New Project → Set Root: admin → Set Env Vars → Deploy
   - Test admin features

6. **Final Verification** (15 min)
   - Test all endpoints with production URLs
   - Check browser console for errors
   - Verify database persistence

**Total Time: ~90 minutes for complete safe deployment**

---

## 🆘 Emergency Contact Points

If deployment breaks:

1. **Check Railway logs** - Most backend issues visible here
2. **Check Vercel logs** - Frontend/Admin issues
3. **Check browser DevTools** - CORS, API, JavaScript errors
4. **Verify environment variables** - 80% of issues come from missing/wrong vars
5. **Rollback if critical** - `git revert HEAD && git push`

---

## ✅ You're Ready to Deploy! 🎉

Follow this guide step-by-step and your website will deploy without breaking anything.

Good luck! 🚀
