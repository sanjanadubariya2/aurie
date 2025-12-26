# ✅ DEPLOYMENT CHECKLIST - Aurie Candles

Use this checklist to ensure zero-breakpoint deployment. Check off each item before proceeding.

---

## 📋 PRE-DEPLOYMENT (LOCAL TESTING)

### Code Preparation
- [ ] All branches merged to `main`
- [ ] Latest code pulled: `git pull origin main`
- [ ] No uncommitted changes: `git status` shows clean
- [ ] Node.js version 18+ installed: `node --version`
- [ ] npm packages updated: `npm install` in each directory

### Local Testing - Backend
- [ ] Backend starts without errors: `node backend/server.js`
- [ ] Health check works: `http://localhost:5000/api/health`
- [ ] Firebase connectivity verified
- [ ] All routes registered in server.js console output
- [ ] CORS configured for localhost:5173 and localhost:5175
- [ ] Environment variables loaded (console shows Firebase initialized)

### Local Testing - Frontend
- [ ] Frontend dev server runs: `npm run dev` (port 5173)
- [ ] Page loads without console errors
- [ ] Can sign up with email
- [ ] Can log in
- [ ] Can browse products
- [ ] Can add items to cart
- [ ] Can proceed to checkout
- [ ] Razorpay test mode works
- [ ] Order confirmation displays correctly

### Local Testing - Admin Dashboard
- [ ] Admin dev server runs: `npm run dev` (port 5175)
- [ ] Page loads without console errors
- [ ] Can log in with `admin@test.com / Admin@123`
- [ ] Dashboard displays statistics
- [ ] Products page shows all products
- [ ] Can create a test product
- [ ] Can edit the test product
- [ ] Can delete the test product
- [ ] Customers page shows users
- [ ] Orders page shows and updates statuses
- [ ] Real-time updates work (orders refresh)

### Local Testing - Database
- [ ] Firestore database created in Google Cloud
- [ ] Collections visible in Firestore console
- [ ] Test user data created
- [ ] Test products created
- [ ] Test orders created
- [ ] Data persists after server restart

### Security Check
- [ ] No sensitive data in GitHub (keys/tokens)
- [ ] `.gitignore` includes `.env`
- [ ] No hardcoded API URLs (using env vars)
- [ ] No test credentials in production config
- [ ] No API keys visible in frontend code

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env file exists and contains):
- [ ] `FIREBASE_PROJECT_ID=aurie-e7794`
- [ ] `FIREBASE_PRIVATE_KEY_ID=xxx`
- [ ] `FIREBASE_PRIVATE_KEY=xxx` (with newlines: -----BEGIN-----\n...\n-----END-----)
- [ ] `FIREBASE_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com`
- [ ] `FIREBASE_CLIENT_ID=xxx`
- [ ] `FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth`
- [ ] `FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token`
- [ ] `ADMIN_EMAIL=admin@test.com`
- [ ] `ADMIN_PASSWORD=Admin@123` (or your chosen password)
- [ ] `JWT_SECRET=your-secret-min-32-chars-long`
- [ ] `RAZORPAY_KEY_ID=rzp_live_xxxxx` (production key, not test)
- [ ] `RAZORPAY_KEY_SECRET=xxxxx` (production secret, not test)
- [ ] `TWILIO_ACCOUNT_SID=ACxxx`
- [ ] `TWILIO_AUTH_TOKEN=xxx`
- [ ] `TWILIO_PHONE_NUMBER=+1234567890`
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`

### Frontend (.env or vite.config.js):
- [ ] `VITE_API_URL` points to Railway backend (NOT localhost)

### Admin (.env or vite.config.js):
- [ ] `VITE_API_URL` points to Railway backend (NOT localhost)

---

## 🚀 DEPLOYMENT - BACKEND (Railway)

### Railway Setup
- [ ] Registered account at https://railway.app
- [ ] Connected GitHub account
- [ ] Repository linked and accessible

### Create Backend Project
- [ ] New Project → Deploy from GitHub
- [ ] Repository: `aurie-candles` selected
- [ ] Branch: `main` selected
- [ ] Detected as Node.js project

### Environment Variables
- [ ] All 15+ environment variables added to Railway
- [ ] Firebase private key formatted correctly (with newlines)
- [ ] Razorpay using PRODUCTION keys (not test)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] `NODE_ENV=production`

### Deployment
- [ ] Start command set to: `node server.js`
- [ ] Build command correct (if custom)
- [ ] Project deploying without errors (check logs)
- [ ] Deployment complete (shown in Railway dashboard)
- [ ] Green checkmark next to deployment

### Verification - Backend
- [ ] Get Railway deployment URL (something like: `xxx.up.railway.app`)
- [ ] Test health: `curl https://xxx.up.railway.app/api/health`
- [ ] Response: `{"status":"ok","database":"firestore"}`
- [ ] Can create user: Test signup endpoint
- [ ] Can log in: Test login endpoint
- [ ] Firebase working: Collections visible in console
- [ ] No errors in Railway logs

---

## ⚡ DEPLOYMENT - FRONTEND (Vercel)

### Vercel Setup
- [ ] Registered account at https://vercel.com
- [ ] Connected GitHub account

### Create Frontend Project
- [ ] New Project → Select `aurie-candles`
- [ ] Root directory: `frontend`
- [ ] Framework: Vite
- [ ] Node version: 18.x or latest

### Environment Variables
- [ ] `VITE_API_URL=https://your-railway-url.up.railway.app` (without trailing slash)
- [ ] No hardcoded localhost URLs
- [ ] No API keys exposed

### Build Settings
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Deployment
- [ ] Click "Deploy"
- [ ] Build completes successfully (no errors)
- [ ] Deployment shows as ready

### Verification - Frontend
- [ ] Get Vercel URL (something like: `xxx.vercel.app`)
- [ ] Open in browser (check console for errors)
- [ ] Page loads without CORS errors
- [ ] Can sign up (test endpoint works)
- [ ] Can log in
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Razorpay payment works
- [ ] Order created successfully

---

## 👑 DEPLOYMENT - ADMIN (Vercel)

### Vercel Setup
- [ ] Same Vercel account as frontend

### Create Admin Project
- [ ] New Project → Select `aurie-candles`
- [ ] Root directory: `admin`
- [ ] Framework: Vite
- [ ] Node version: 18.x

### Environment Variables
- [ ] `VITE_API_URL=https://your-railway-url.up.railway.app` (same as frontend)

### Deployment
- [ ] Click "Deploy"
- [ ] Build completes without errors
- [ ] Deployment ready

### Verification - Admin
- [ ] Get Vercel URL
- [ ] Open in browser
- [ ] No console errors
- [ ] Can log in with `admin@test.com / Admin@123`
- [ ] Dashboard loads with statistics
- [ ] Products list shows products
- [ ] Can create product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Customers page loads
- [ ] Orders page loads and updates
- [ ] WebSocket connection established (check Network tab)

---

## 🔍 FINAL VERIFICATION (POST-DEPLOYMENT)

### Frontend Workflow
- [ ] User can sign up with email
- [ ] OTP sent and received
- [ ] User can log in
- [ ] Products load correctly
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Payment processed by Razorpay
- [ ] Order confirmation received
- [ ] Order visible in "My Orders"

### Admin Workflow
- [ ] Admin can log in
- [ ] Dashboard statistics accurate
- [ ] New orders appear in real-time
- [ ] Can update order status (Confirm → Ship → Deliver)
- [ ] Customer order status updates reflect on frontend
- [ ] Can manage products (CRUD)
- [ ] Can view customer details

### Backend Health
- [ ] All endpoints responding
- [ ] Database queries fast (< 1 second)
- [ ] No errors in logs
- [ ] Firestore data persisting
- [ ] Authentication working
- [ ] Payments processing
- [ ] Emails/SMS sending (if configured)

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] Admin dashboard loads in < 3 seconds
- [ ] Product search responsive
- [ ] Checkout fast
- [ ] No 404 errors

---

## 🆘 ROLLBACK (If Issues Occur)

If critical issues found:
- [ ] Rollback command: `git revert HEAD && git push`
- [ ] Railway auto-redeploys previous version
- [ ] Vercel auto-redeploys previous version
- [ ] Verify rolled back version works
- [ ] Investigate issue in development
- [ ] Re-deploy when fixed

---

## 📝 TROUBLESHOOTING QUICK REFERENCE

| Issue | Solution |
|-------|----------|
| CORS Error | Add frontend/admin URLs to backend CORS config |
| 404 Routes | Verify routes exported in server.js |
| Database Error | Check Firebase credentials and private key format |
| Auth Failed | Verify JWT_SECRET is same in .env |
| Payment Error | Check Razorpay key is production (rzp_live_) |
| Build Failed | Check package.json, run `npm install` |
| Env Var Missing | Copy all from .env to Railway/Vercel dashboard |
| API Timeout | Increase timeout in axios config |
| HTTPS Issues | Ensure all URLs use https:// in production |

---

## 🎉 DEPLOYMENT COMPLETE!

Once all items are checked off:

1. ✅ Website is live
2. ✅ Users can sign up and purchase
3. ✅ Admin can manage orders and products
4. ✅ All integrations working
5. ✅ Data persisting to Firestore
6. ✅ Zero downtime

### Share with Team
- Frontend URL: `https://xxx.vercel.app`
- Admin URL: `https://xxx-admin.vercel.app`
- Admin Credentials: `admin@test.com / Admin@123`

---

**Total Deployment Time: ~2-3 hours**
**Risk Level: ✅ SAFE (if checklist followed)**

Good luck with your launch! 🚀
