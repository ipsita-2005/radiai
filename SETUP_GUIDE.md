# Ashwini - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API key
notepad .env
```

Add this to `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/
GEMINI_API_KEY=your_api_key_here
```

**Get Gemini API Key:** https://makersuite.google.com/app/apikey

### Step 2: Frontend Setup

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install
```

### Step 3: Start MongoDB

**Option A: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: Local Installation**
Download from: https://www.mongodb.com/try/download/community

### Step 4: Run the Application

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```
✅ Backend running at http://localhost:8000

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
✅ Frontend running at http://localhost:5173

---

## 🎯 Test the Application

1. Open browser: http://localhost:5173
2. Upload a medical image (JPG, PNG, DICOM, or ECG CSV)
3. Click "Start Analysis"
4. View results with Grad-CAM heatmap
5. Download PDF report

---

## 🛠️ Using GitHub Desktop (No Git CLI needed)

### First Time Setup

1. **Install GitHub Desktop**: https://desktop.github.com/
2. **Clone Repository**:
   - Open GitHub Desktop
   - File → Clone Repository
   - Choose this repository
   - Click Clone

3. **Make Changes**:
   - Edit files in VS Code or your editor
   - Changes appear automatically in GitHub Desktop

4. **Commit Changes**:
   - Write a summary (e.g., "Updated README")
   - Click "Commit to main"

5. **Sync Changes**:
   - Click "Push origin" to upload to GitHub

### Visual Guide

```
GitHub Desktop Workflow:
1. Make changes → Appears in "Changes" tab
2. Write summary → Click "Commit to main"
3. Click "Push origin" → Done! ✅
```

---

## 📋 Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] MongoDB connection successful (check backend logs)
- [ ] Can upload an image
- [ ] Analysis completes and shows results
- [ ] PDF report downloads successfully
- [ ] History page shows past analyses

---

## ⚠️ Common Issues & Solutions

### Issue: `ModuleNotFoundError`
**Solution:** 
```bash
cd backend
pip install -r requirements.txt
```

### Issue: `npm ERR! missing script`
**Solution:**
```bash
cd frontend
npm install
```

### Issue: MongoDB connection failed
**Solution:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Try: `net start MongoDB` (Windows)

### Issue: CORS errors in browser
**Solution:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`

---

## 🎓 Next Steps

1. **Explore the codebase** - Check `README.md` for architecture details
2. **Test with sample images** - Try different modalities
3. **Customize** - Modify Tailwind config for theming
4. **Deploy** - Consider deploying to cloud (AWS, GCP, Azure)

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review error logs in browser console (F12)
- Check backend terminal for Python errors
- Verify all dependencies are installed

---

**Happy Coding! 🎉**
