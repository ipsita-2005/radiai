# 🚀 Deploy Ashwini on Vercel - Complete Visual Guide

## ⚠️ Why Deployment Failed

**The Problem:**
- Frontend tries to connect to `http://localhost:8000` (your computer)
- Vercel needs a **public backend URL**, not localhost
- Backend (FastAPI) cannot run on Vercel (Vercel only supports serverless functions, not Python servers)

---

## ✅ Solution Options

### Option 1: Frontend Only on Vercel (Recommended for Demo) ⭐
Deploy just the React frontend on Vercel, and host backend separately

**Best for:** Quick demo, testing, portfolio showcase

### Option 2: Full Stack on Different Platforms
- Frontend → Vercel
- Backend → Railway/Render/Heroku

**Best for:** Production-ready deployment

### Option 3: Backend as Serverless Functions
Convert FastAPI to Vercel serverless functions

**Best for:** Integrated deployment (requires code changes)

---

## 🎯 Option 1: Frontend Only (Easiest)

### Step-by-Step with GitHub Desktop

#### Prerequisites
- ✅ GitHub account
- ✅ Vercel account (free at https://vercel.com)
- ✅ Code pushed to GitHub (already done!)

#### Deployment Steps

**Step 1: Connect Vercel to GitHub**

```
1. Go to: https://vercel.com/new
2. Click "Continue with GitHub"
3. Authorize Vercel to access GitHub
4. Import your radiai repository
```

**Step 2: Configure Project**

```
Framework Preset: Vite
Root Directory: frontend (IMPORTANT!)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Step 3: Add Environment Variables**

In Vercel dashboard, add:
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```
(Leave empty for now - we'll use mock data)

**Step 4: Deploy**

```
Click "Deploy"
Wait 2-3 minutes
✅ Done!
```

---

## 🔧 Required Code Changes

### Update API Service for Production

Create environment-based API configuration:

**File: `frontend/src/services/api.ts`** (Update needed)

```typescript
// Add this at the top
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

This allows you to change the backend URL without code changes.

---

## 📋 Detailed GitHub Desktop Workflow

### Phase 1: Prepare Your Code

#### 1. Create Vercel Configuration File

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

#### 2. Update vite.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Remove the proxy section - not needed for production
})
```

#### 3. Update api.ts

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

#### 4. Commit Changes

```
Open GitHub Desktop
Write summary: "Configure for Vercel deployment"
Description: "- Add vercel.json\n- Update API configuration\n- Remove dev proxy"
Click "Commit to main"
Click "Push origin"
```

---

## 🎨 Using GitHub Desktop - Visual Checklist

### Before Deployment

```
☐ Create vercel.json in frontend/
☐ Update vite.config.ts (remove proxy)
☐ Update api.ts (add environment variable)
☐ Test locally: cd frontend; npm run dev
☐ Commit all changes
☐ Push to GitHub
```

### During Deployment

```
☐ Login to Vercel (vercel.com)
☐ Import radiai repository
☐ Set Root Directory to "frontend"
☐ Framework: Vite (auto-detected)
☐ Build Command: npm run build
☐ Output Directory: dist
☐ Click Deploy
```

### After Deployment

```
☐ Note the deployment URL (e.g., radiai.vercel.app)
☐ Test the deployed site
☐ Check browser console for errors
☐ Verify build logs in Vercel dashboard
```

---

## ⚡ Quick Deploy Commands (Alternative)

If you want to use CLI instead:

```powershell
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

But GitHub Desktop is easier! 🎯

---

## 🔍 Troubleshooting Common Issues

### Issue 1: "Build failed" error

**Solution:**
```
Check Vercel deployment logs
Common causes:
- TypeScript errors
- Missing dependencies in package.json
- Wrong root directory setting
```

**Fix:**
```
1. In Vercel dashboard, click deployment
2. View "Logs" tab
3. Find the error
4. Fix code locally
5. Commit and push
6. Vercel auto-redeploys!
```

---

### Issue 2: Blank page after deploy

**Possible Causes:**

**A. Wrong base path**
```
Fix: In vite.config.ts add:
base: '/',
```

**B. Router issues**
```
Fix: Use HashRouter instead of BrowserRouter
Or configure rewrites in vercel.json
```

**C. Missing environment variables**
```
Fix: Add in Vercel dashboard → Settings → Environment Variables
```

---

### Issue 3: API calls failing

**Problem:** Frontend can't reach backend

**Solutions:**

**Option A: Use Mock Data (for demo)**
```typescript
// In api.ts, add mock response
export const uploadAndAnalyse = async () => {
  // Return mock data for demo
  return {
    id: "demo-123",
    prediction: "Sample Result",
    confidence: 0.95,
    // ... other mock data
  };
};
```

**Option B: Deploy Backend Separately**
```
Deploy backend to:
- Railway.app (free tier)
- Render.com (free tier)
- Heroku (paid)

Then update VITE_API_BASE_URL to point to it
```

---

## 🌟 Best Practice: Deploy Backend Too

### Recommended Setup

```
Frontend (React/Vite) → Vercel (FREE)
Backend (FastAPI)     → Railway/Render (FREE tier)
Database (MongoDB)    → MongoDB Atlas (FREE cloud)
```

### Step-by-Step

#### 1. Deploy Backend to Railway

```
1. Go to railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select radiai repository
5. Root Directory: backend
6. Add environment variables:
   - MONGODB_URI
   - GEMINI_API_KEY
7. Deploy!
8. Get public URL (e.g., ashwini-production.up.railway.app)
```

#### 2. Update Frontend Configuration

```typescript
// frontend/.env.production
VITE_API_BASE_URL=https://ashwini-production.up.railway.app/api
```

#### 3. Redeploy Frontend on Vercel

```
1. Vercel dashboard → Project → Settings
2. Environment Variables
3. Add: VITE_API_BASE_URL = your-railway-url/api
4. Redeploy
```

---

## 📊 Deployment Architecture

### Current Setup (Doesn't Work)
```
Vercel (Frontend) → localhost:8000 ❌ FAILS
(Because localhost is YOUR computer, not accessible from internet)
```

### Correct Setup
```
Vercel (Frontend) → Railway (Backend) → MongoDB Atlas ✅ WORKS
(Internet accessible)   (Internet accessible)   (Cloud database)
```

---

## 🎯 Quick Win: Mock Data Mode

For immediate deployment without backend:

### Create Mock API Service

**File: `frontend/src/services/api.mock.ts`**
```typescript
import type { AnalysisResult, HistoryResponse } from '../types';

export const mockAnalysisResult: AnalysisResult = {
  id: 'demo-123',
  modality: 'chest_ct',
  prediction: 'Normal',
  confidence: 0.95,
  severity_score: 1.2,
  uncertainty_std: 0.05,
  is_uncertain: false,
  exact_point: { x: 112, y: 98 },
  processing_time_ms: 1234,
  pdf_url: '/demo-report.pdf',
  heatmap_url: null,
};

export const uploadAndAnalyse = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
  return mockAnalysisResult;
};

// ... other mock functions
```

**Update App.tsx to use mock:**
```typescript
import { uploadAndAnalyse } from './services/api.mock'; // Instead of api.ts
```

Now deploy will work immediately! 🎉

---

## ✅ Complete Deployment Checklist

### Pre-Deployment
```
☐ Create vercel.json in frontend/
☐ Update vite.config.ts (remove proxy or add base path)
☐ Update api.ts (environment-aware)
☐ Test build locally: npm run build
☐ Commit all changes
☐ Push to GitHub
```

### Vercel Setup
```
☐ Login to vercel.com
☐ Import radiai repository
☐ Set Root Directory: frontend
☐ Framework: Vite
☐ Build Command: npm run build
☐ Output Directory: dist
☐ Add environment variables (if any)
☐ Click Deploy
```

### Post-Deployment
```
☐ Note deployment URL
☐ Test live site
☐ Check browser console
☐ Review build logs
☐ Share URL! 🎉
```

---

## 🚀 One-Click Deploy Template

### For Easiest Deployment

1. **Fork this template** (if available)
2. **Click "Deploy" button** on Vercel
3. **Done!**

Since you already have the repo, just:

```
1. vercel.com → New Project
2. Import radiai
3. Root: frontend
4. Deploy
```

---

## 💡 Pro Tips

### Automatic Deployments
Every time you push to GitHub:
```
GitHub Push → Vercel detects change → Auto rebuilds → Updates site
✅ Always live with latest code!
```

### Preview Deployments
For pull requests:
```
Create branch → Make changes → PR → Vercel creates preview URL
✅ Test before merging to main!
```

### Custom Domain
```
Vercel Dashboard → Project → Settings → Domains
Add your domain: ashwini-radiology.com
Follow DNS instructions
```

---

## 📞 Need Help?

### Vercel Documentation
- Deployment guide: https://vercel.com/docs/deployments
- Vite setup: https://vercel.com/guides/deploying-vite-with-vercel
- Environment variables: https://vercel.com/docs/environment-variables

### Support Channels
- Vercel Community: https://github.com/vercel/vercel/discussions
- Vercel Twitter: @vercel

---

## 🎊 Success Indicators

You've successfully deployed when:

✅ Site loads at radiai-[username].vercel.app  
✅ No build errors in Vercel logs  
✅ Page renders correctly on mobile  
✅ All assets load (images, fonts)  
✅ Console has no critical errors  

---

## Next Steps After Successful Deploy

1. **Share your link**: https://radiai.vercel.app
2. **Add to resume/portfolio**
3. **Deploy backend too** (Railway/Render)
4. **Connect custom domain** (optional)
5. **Set up analytics** (Google Analytics, etc.)

---

**Ready to deploy? Start with the mock data approach for instant results!** 🚀

See detailed step-by-step in the next file: `VERCEL_DEPLOYMENT_STEPS.md`
