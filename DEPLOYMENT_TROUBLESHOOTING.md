# 🔧 Deployment Troubleshooting Guide

Quick solutions for common deployment issues.

---

## 🚨 CRITICAL ISSUES (Website Down)

### **Issue: Cannot access website at all**

**Check these in order:**

1. **Is Railway backend running?**
   ```bash
   # Go to Railway dashboard
   # Click on project → check if green indicator
   # Look for deployment errors in logs
   ```

2. **Is Vercel frontend deployed?**
   ```bash
   # Go to Vercel dashboard
   # Check deployment status (should show green checkmark)
   # Check Deployments tab for errors
   ```

3. **Environment variables missing?**
   ```bash
   # Railway: Settings → Environment Variables
   # Should have 15+ variables
   # Check especially: FIREBASE_PROJECT_ID, JWT_SECRET, RAZORPAY_KEY_ID
   ```

---

## 🔴 CORS ERRORS

### **Error: `Access to XMLHttpRequest at 'https://backend-url' from origin 'https://frontend-url' has been blocked by CORS policy`**

**Root Cause:** Backend CORS not configured for production URLs

**Fix:**

1. Update `backend/server.js`:
   ```javascript
   const corsOptions = {
     origin: [
       "http://localhost:5173",
       "http://localhost:5175",
       "https://your-frontend-url.vercel.app",  // ← Add real URL
       "https://your-admin-url.vercel.app"      // ← Add real URL
     ],
     credentials: true
   };
   ```

2. Redeploy backend to Railway
3. Test again - should work

---

## 🔴 FIREBASE / DATABASE ERRORS

### **Error: `Error: Service account key not found` or `FIREBASE_PRIVATE_KEY undefined`**

**Root Cause:** Firebase credentials not properly set in Railway

**Fix:**

1. Copy Firebase private key from Google Cloud Console:
   ```
   Services → Service Accounts → Create Key → JSON
   ```

2. In Railway → Settings → Environment Variables, add:
   ```
   FIREBASE_PROJECT_ID=aurie-e7794
   FIREBASE_PRIVATE_KEY_ID=xxx
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@aurie-e7794.iam.gserviceaccount.com
   ```
   
   **Important:** Private key MUST have literal `\n` for newlines (not actual newlines)

3. Redeploy: Railway auto-redeploys when vars change

4. Test: `GET /api/health` should return Firestore status

---

### **Error: `Firestore database not found` or `PERMISSION_DENIED`**

**Root Cause:** Firestore database not created or permissions wrong

**Fix:**

1. Go to Google Cloud Console → Firestore
2. Create database (if not exists)
3. Set to production mode
4. Run diagnostic: `node backend/test-firestore.js`
5. Should see: `✅ Firestore write test passed`

---

## 🔴 AUTHENTICATION ERRORS

### **Error: `401 Unauthorized` or `Invalid token`**

**Root Cause:** JWT_SECRET mismatch between local and production

**Fix:**

1. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Update in `backend/.env`:
   ```
   JWT_SECRET=your-new-32-char-secret
   ```

3. Add to Railway:
   ```
   Settings → Environment Variables → JWT_SECRET=your-secret
   ```

4. Redeploy backend

5. Clear browser localStorage and try logging in again

---

### **Error: Admin login returns 404 `POST /api/admin/login not found`**

**Root Cause:** Admin routes not properly imported in server.js

**Fix:**

1. Check `backend/server.js` has these lines:
   ```javascript
   import adminRoutes from "./routes/adminRoutes.js";
   
   // Later in the file:
   app.use("/api/admin", adminRoutes);
   ```

2. Verify `backend/routes/adminRoutes.js` exists

3. Test locally first:
   ```bash
   cd backend
   node server.js
   # Check console for: ✅ Admin routes registered at /api/admin
   ```

4. Push to GitHub and redeploy to Railway

---

## 🔴 PAYMENT ERRORS

### **Error: `Invalid Razorpay Key ID` or payment modal doesn't appear**

**Root Cause:** Using test keys instead of production keys

**Fix:**

1. Go to Razorpay Dashboard → Settings → API Keys
2. Copy LIVE keys (not test keys)
3. In Railway environment:
   ```
   RAZORPAY_KEY_ID=rzp_live_xxxxx  (should start with rzp_live_)
   RAZORPAY_KEY_SECRET=xxxxx
   ```
4. Frontend uses key automatically from backend
5. Restart backend

---

### **Error: `Payment failed` or `Order creation failed`**

**Root Cause:** Backend can't create Razorpay orders

**Check:**

1. Razorpay credentials are correct:
   ```bash
   curl -u YOUR_KEY_ID:YOUR_KEY_SECRET https://api.razorpay.com/v1/orders
   # Should return order list (not 401)
   ```

2. Backend endpoint works:
   ```bash
   curl -X POST https://your-backend.up.railway.app/api/payment/create \
     -H "Content-Type: application/json" \
     -d '{"amount":10000}'
   # Should return order_id
   ```

3. If fails, check Railway logs for error details

---

## 🔴 API ERRORS (404, 500)

### **Error: `404 Not Found` on API endpoint**

**Check these in order:**

1. **Is the route exported?**
   ```javascript
   // In backend/routes/file.js
   export default router;  // ← Must have this
   ```

2. **Is the route registered in server.js?**
   ```javascript
   app.use("/api/route", routeImport);  // ← Must have this
   ```

3. **Correct URL being called?**
   ```javascript
   // Check frontend/src/api/axios.js
   baseURL: process.env.VITE_API_URL  // ← Should be production URL
   ```

4. **Method correct?** (GET vs POST vs PUT vs DELETE)
   ```javascript
   // Router should have matching method
   router.post("/endpoint", handler);  // ← Matches API.post()
   ```

### **Error: `500 Internal Server Error`**

**Root Cause:** Unhandled error in backend code

**Fix:**

1. Check Railway logs for error message
2. Most common causes:
   - Database connection failed
   - Missing environment variable
   - Syntax error in route handler
   - Unhandled promise rejection

3. Look for exact error in logs and fix

---

## 🔴 FRONTEND ISSUES

### **Error: Blank page or `Cannot find module`**

**Root Cause:** Build failed or wrong API URL

**Fix:**

1. Check Vercel deployment logs for build errors
2. Verify environment variables:
   ```
   VITE_API_URL=https://your-backend-url  (no trailing slash)
   ```
3. Clear cache and redeploy:
   ```
   Vercel → Project → Redeploy
   ```

### **Error: Axios/API calls returning CORS error**

**Root Cause:** Frontend URL not in backend CORS list

**Fix:**

1. Get your Vercel frontend URL
2. Add to `backend/server.js` CORS origins
3. Redeploy backend
4. Refresh frontend page

---

### **Error: `Cannot GET /` or blank page**

**Root Cause:** Vite build failed or not configured correctly

**Fix:**

1. Check Vercel build logs
2. Verify `vite.config.js` has correct settings
3. Test locally:
   ```bash
   cd frontend
   npm run build
   npm run preview
   # Should show at http://localhost:4173
   ```
4. If preview works but Vercel doesn't, check:
   - Root directory is `frontend` (not repo root)
   - Build command: `npm run build`
   - Output: `dist`

---

## 🟡 PERFORMANCE ISSUES

### **Problem: Website loads slowly**

**Causes & Fixes:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| First load > 5s | Large bundle | Check Network tab, lazy load images |
| API calls slow | Database slow | Check Firestore indexes |
| Admin UI sluggish | Real-time updates | Reduce socket.io frequency |
| Checkout slow | Razorpay loading | Pre-load Razorpay script |

**Debug:**

1. Open DevTools → Network tab
2. Check which requests are slow
3. Check Firestore performance in Google Cloud Console

---

## 🟡 DATABASE ISSUES

### **Problem: Data not persisting**

**Root Cause:** Using MockDB instead of Firestore

**Fix:**

1. Check backend startup logs
2. Should show: `✅ Firestore initialized`
3. If shows: `⚠️ MockDB (Firestore not available)` then:
   - Firestore API not enabled in Google Cloud
   - Firebase credentials wrong
   - Private key not formatted correctly

4. Fix Firebase, restart backend

---

### **Problem: Firestore collections empty**

**Check:**

1. Firestore console shows collections?
   ```
   https://console.firebase.google.com → Firestore → Collections
   ```

2. If empty, data might be in MockDB
   - Kill backend: `Get-Process node | Stop-Process -Force`
   - Data will reset since MockDB is in-memory
   - Add test data through admin or API

3. If using production database, test with real transactions

---

## 🟢 QUICK FIXES (Try These First)

### **Generic "Something's broken" checklist:**

1. **Restart everything**
   ```bash
   # Kill all Node processes
   Get-Process node | Stop-Process -Force
   
   # Hard refresh browser
   Ctrl+Shift+R  (or Cmd+Shift+R on Mac)
   ```

2. **Clear caches**
   ```bash
   # Browser cache
   DevTools → Application → Clear Storage
   
   # Vercel cache
   Vercel Dashboard → Project → Deployments → Redeploy
   ```

3. **Check environment variables**
   - Railway: Settings → Environment → verify all 15+ vars
   - Vercel: Settings → Environment Variables → verify vars

4. **Check logs**
   - Railway: Deployments → View Logs
   - Vercel: Deployments → Logs
   - Browser: F12 → Console

5. **Verify URLs**
   - No localhost in production code
   - All URLs using https://
   - No trailing slashes on API URL

---

## 📞 GETTING MORE HELP

If issues persist:

1. **Check specific log messages** - Most errors have clear messages
2. **Search error message** - Usually shows exact problem
3. **Test endpoint with curl** - Isolate backend vs frontend issue
4. **Roll back and redeploy** - Sometimes cache is the issue
5. **Start fresh with limited scope** - Deploy just backend first, then frontend

---

## 🚑 EMERGENCY: IMMEDIATE ROLLBACK

If website completely broken:

```bash
# Step 1: Go to repository
cd c:\aurie\aurie-candles

# Step 2: Revert last commit
git revert HEAD

# Step 3: Push
git push origin main

# Step 4: Check deployments
# Railway and Vercel auto-redeploy
# Wait 5 minutes for deployment to complete

# Step 5: Verify rolled back version works
# Open website - should be back to previous state
```

After rollback, investigate what broke in the last deployment before pushing again.

---

## 📊 Common Issues by Frequency

| Rank | Issue | Fix Time |
|------|-------|----------|
| 1️⃣ | Missing env vars | 2 min |
| 2️⃣ | CORS error | 5 min |
| 3️⃣ | Firebase not initialized | 10 min |
| 4️⃣ | Routes not found | 5 min |
| 5️⃣ | Build failed | 15 min |
| 6️⃣ | Payment keys wrong | 3 min |
| 7️⃣ | Database permission | 10 min |
| 8️⃣ | Socket.io 404 | 5 min |

---

**Most issues are fixed by:**
1. Checking environment variables
2. Restarting services
3. Clearing cache
4. Checking logs

**Remember:** Read the error message carefully - it usually tells you exactly what's wrong!

Good luck! 🚀
