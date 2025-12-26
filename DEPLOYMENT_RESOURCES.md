# 📚 DEPLOYMENT RESOURCES - Complete Index

All files to help you deploy **Aurie Candles** safely and successfully.

---

## 🚀 START HERE

### **For First-Time Deployers**
👉 **Read:** [QUICK_START_DEPLOYMENT.md](QUICK_START_DEPLOYMENT.md) (5 min read)
- Quick 5-step deployment process
- Estimated time: 30 minutes
- Best for: Getting live quickly

### **For Careful Planners**
👉 **Read:** [DEPLOYMENT_WITHOUT_BREAKPOINTS.md](DEPLOYMENT_WITHOUT_BREAKPOINTS.md) (30 min read)
- Comprehensive guide with detailed explanations
- Covers all edge cases
- Best for: Understanding every step

---

## 📋 DURING DEPLOYMENT

### **Use This Checklist**
👉 **Document:** [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Check off items as you complete them
- Covers all 3 deployments (Backend, Frontend, Admin)
- Print it out or use digitally

### **Before You Start**
👉 **Script:** `verify-deployment.js`
```bash
node verify-deployment.js
```
- Checks all files exist
- Verifies environment variables
- Catches issues early

### **Auto-Setup Environment**
👉 **Script:** `setup-deployment-env.bat`
```bash
.\setup-deployment-env.bat
```
- Interactive environment variable setup
- Creates backup of current .env
- Runs verification automatically

---

## 🆘 WHEN THINGS BREAK

### **Troubleshooting Guide**
👉 **Document:** [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)
- Solutions organized by issue type
- CORS errors, Auth errors, Payment errors, etc.
- Quick fixes at bottom

### **Common Issues Quick Reference**

| Problem | Solution | Time |
|---------|----------|------|
| CORS Error | Add URL to backend CORS | 5 min |
| 404 on routes | Check routes imported in server.js | 5 min |
| Firebase not working | Verify Firebase credentials in Railway | 10 min |
| Payment fails | Check Razorpay key is production (rzp_live_) | 3 min |
| Blank page | Check Vercel build logs | 15 min |
| Database empty | Create Firestore collections | 10 min |
| Can't login | Verify JWT_SECRET in env vars | 3 min |
| Website down | Check Railway and Vercel dashboards | 2 min |

---

## 🔧 QUICK REFERENCE

### **Deployment URLs Pattern**

```
Frontend:  https://[project-name].vercel.app
Admin:     https://[project-name]-admin.vercel.app
Backend:   https://[project-name].up.railway.app
```

### **Admin Credentials (After Deploy)**
```
Email:    admin@test.com
Password: Admin@123
```

### **Key Environment Variables**
```
Backend needs: 15+ variables (see DEPLOYMENT_CHECKLIST.md)
Frontend needs: VITE_API_URL=https://your-backend-url
Admin needs: VITE_API_URL=https://your-backend-url
```

---

## 📂 FILE STRUCTURE

```
aurie-candles/
├── QUICK_START_DEPLOYMENT.md          ← START HERE (5 min)
├── DEPLOYMENT_WITHOUT_BREAKPOINTS.md  ← Detailed guide (30 min)
├── DEPLOYMENT_CHECKLIST.md            ← Use during deploy (printable)
├── DEPLOYMENT_TROUBLESHOOTING.md      ← When issues occur
├── verify-deployment.js               ← Run before deploy
├── setup-deployment-env.bat           ← Interactive setup
├── deploy.bat                         ← Original build script
│
├── backend/
│   ├── .env                          ← Local credentials
│   ├── server.js                     ← Express app
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── config/
│   │   └── firebase.js               ← Firestore config
│   └── utils/
│       ├── sendEmail.js
│       └── sendSMS.js
│
├── frontend/
│   ├── vite.config.js
│   ├── src/api/
│   │   └── axios.js                  ← API config
│   └── src/pages/
│       └── CheckoutAddress.jsx
│
└── admin/
    ├── vite.config.js
    ├── src/api/
    │   └── admin.js                  ← Admin API config
    └── src/pages/
        ├── DashboardPage.jsx
        ├── ProductsPage.jsx
        ├── CustomersPage.jsx
        └── OrdersPage.jsx
```

---

## 🎯 DEPLOYMENT WORKFLOW

```
┌─────────────────────────────┐
│  LOCAL: Test Everything     │
│  ✓ All 3 servers running    │
│  ✓ Test signup, login, buy  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  GITHUB: Push to Main       │
│  git add -A                 │
│  git commit -m "Deploy"     │
│  git push origin main       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  RAILWAY: Backend Deploy    │
│  - New Project              │
│  - Connect GitHub           │
│  - Add environment vars     │
│  - Deploy & verify          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  VERCEL: Frontend Deploy    │
│  - New Project              │
│  - Root: frontend           │
│  - Set VITE_API_URL         │
│  - Deploy & test            │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  VERCEL: Admin Deploy       │
│  - New Project              │
│  - Root: admin              │
│  - Set VITE_API_URL         │
│  - Deploy & verify          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  VERIFY: Complete Testing   │
│  ✓ Frontend fully working   │
│  ✓ Admin fully working      │
│  ✓ Database persistent      │
│  ✓ Payments working         │
└─────────────────────────────┘
```

---

## ⏱️ TIME ESTIMATES

| Task | Time | Difficulty |
|------|------|------------|
| Local testing | 10 min | ⭐ Easy |
| Push to GitHub | 2 min | ⭐ Easy |
| Deploy backend | 10 min | ⭐⭐ Medium |
| Deploy frontend | 10 min | ⭐⭐ Medium |
| Deploy admin | 10 min | ⭐⭐ Medium |
| Final verification | 5 min | ⭐ Easy |
| **Total** | **~45 min** | ⭐⭐ Medium |

---

## 🎓 LEARNING RESOURCES

If you want to understand deployment better:

### **Railway (Backend)**
- Official docs: https://docs.railway.app
- Node.js deployment: https://docs.railway.app/guides/nodejs

### **Vercel (Frontend/Admin)**
- Official docs: https://vercel.com/docs
- Vite deployment: https://vitejs.dev/guide/ssr.html

### **Firebase (Database)**
- Official docs: https://firebase.google.com/docs
- Firestore setup: https://firebase.google.com/docs/firestore

### **Razorpay (Payments)**
- Official docs: https://razorpay.com/docs/
- Test mode guide: https://razorpay.com/docs/payments/test-mode/

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before starting deployment, have these ready:

- [ ] All local tests passing
- [ ] GitHub account with repository
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Firebase project set up (`aurie-e7794`)
- [ ] Razorpay account (with live keys if using real payments)
- [ ] Twilio account (for SMS verification)
- [ ] Backend `.env` file with all variables
- [ ] Screenshots of all environment variables (for reference)

---

## 🚨 CRITICAL DO's AND DON'Ts

### ✅ DO
- ✅ Test locally before deploying
- ✅ Use production API keys (not test keys)
- ✅ Keep Firebase private key safe
- ✅ Check all environment variables twice
- ✅ Read error logs carefully
- ✅ Take screenshots before deployment
- ✅ Have rollback plan ready

### ❌ DON'T
- ❌ Push `.env` file to GitHub
- ❌ Use test Razorpay keys in production
- ❌ Change database while deployed
- ❌ Delete environment variables
- ❌ Commit large files (> 50MB)
- ❌ Skip local testing
- ❌ Ignore error messages

---

## 📞 SUPPORT

If you get stuck:

1. **Check DEPLOYMENT_TROUBLESHOOTING.md** - Most issues covered
2. **Check specific logs:**
   - Railway: `Deployments → View Logs`
   - Vercel: `Deployments → Logs`
   - Browser: `F12 → Console`
3. **Search error message** - Usually shows exact problem
4. **Rollback:** `git revert HEAD && git push`

---

## 🎉 SUCCESS!

Once deployed, you have:

✅ **Frontend** - Customer-facing website
✅ **Admin** - Admin dashboard for management  
✅ **Backend** - API server with Firestore
✅ **Payments** - Razorpay integration
✅ **Auth** - Email/Phone verification
✅ **Database** - Persistent data storage

---

## 📊 DEPLOYMENT STATUS TEMPLATE

Save this to track your deployment:

```
DEPLOYMENT LOG - [DATE]
======================

Backend (Railway)
  Deployed: ☐ Yes ☐ No
  URL: ___________________________
  Status: ☐ Green ☐ Yellow ☐ Red
  
Frontend (Vercel)
  Deployed: ☐ Yes ☐ No
  URL: ___________________________
  Status: ☐ Green ☐ Yellow ☐ Red

Admin (Vercel)
  Deployed: ☐ Yes ☐ No
  URL: ___________________________
  Status: ☐ Green ☐ Yellow ☐ Red

Tests
  ☐ Signup works
  ☐ Login works
  ☐ Products load
  ☐ Checkout works
  ☐ Admin dashboard loads
  ☐ Admin login works
  ☐ Can create product
  ☐ Can update order status

Notes:
_________________________________
_________________________________
```

---

**Happy Deploying! 🚀**

Questions? Check the specific guide document.
Stuck? Check DEPLOYMENT_TROUBLESHOOTING.md.
Ready? Start with QUICK_START_DEPLOYMENT.md!
