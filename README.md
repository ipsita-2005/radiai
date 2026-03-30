# Ashwini - Radiology Intelligence System

A unified multi-modal medical image analysis platform powered by AI.

## Architecture

**3-Tier Architecture:**
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Python FastAPI, PyTorch
- **Database**: MongoDB Atlas

## Features

✅ **5 Imaging Modalities Supported:**
- Brain MRI (4 classes: Glioma, Meningioma, Pituitary, No Tumour)
- Chest CT (4 classes: COVID-19, Lung Opacity, Normal, Viral Pneumonia)
- Head CT (Binary: Haemorrhage, No Haemorrhage)
- Bone X-Ray (4 classes: Comminuted, Displaced, Hairline, Normal)
- ECG Signal (5-class classification)

✅ **8-Step Processing Pipeline:**
1. File Validation (50 MB limit)
2. Modality Auto-Router (extension + pixel statistics)
3. Preprocessing (normalization, HU windowing, resampling)
4. Model Inference (mixed precision with CUDA)
5. MC Dropout Uncertainty (N=30 forward passes)
6. Grad-CAM + Exact Point localization
7. Severity Score calculation (clinical weights)
8. PDF Report with Gemini AI narrative

✅ **Key Capabilities:**
- Multi-modal medical image classification
- Explainability with Grad-CAM heatmaps
- Uncertainty quantification (MC Dropout)
- Severity scoring based on clinical weights
- Automated PDF report generation
- AI-powered clinical narratives (Google Gemini)
- Analysis history tracking
- Interactive ECG waveform visualization (WaveSurfer.js)

## Project Structure

```
ashwini/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── database/
│   │   ├── connection.py       # MongoDB connection
│   │   └── __init__.py
│   ├── models/
│   │   ├── architectures.py    # PyTorch model definitions
│   │   ├── schema.py           # MongoDB schema
│   │   └── __init__.py
│   ├── routers/
│   │   ├── analysis.py         # Main analysis endpoint
│   │   └── __init__.py
│   ├── services/
│   │   ├── gemini_service.py   # Google Gemini integration
│   │   └── __init__.py
│   ├── utils/
│   │   ├── preprocessing.py    # Image preprocessing
│   │   ├── gradcam_utils.py    # Grad-CAM utilities
│   │   ├── pdf_generator.py    # PDF report generation
│   │   ├── modality_router.py  # Auto-detection logic
│   │   ├── severity_calculator.py
│   │   └── __init__.py
│   ├── uploads/                # Temporary upload storage
│   ├── reports/                # Generated PDF reports
│   └── heatmaps/               # Grad-CAM heatmaps
└── frontend/
    ├── src/
    │   ├── App.tsx             # Main React component
    │   ├── main.tsx            # React entry point
    │   ├── types/
    │   │   └── index.ts        # TypeScript types
    │   ├── services/
    │   │   └── api.ts          # API service layer
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── UploadZone.tsx
    │   │   ├── ResultCard.tsx
    │   │   └── ExplainabilityPanel.tsx
    │   └── pages/
    │       ├── UploadPage.tsx
    │       └── HistoryPage.tsx
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Setup Instructions

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **MongoDB Atlas** account or local MongoDB instance
- **CUDA-capable GPU** (optional, for faster inference)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Get Gemini API Key:** https://makersuite.google.com/app/apikey

5. **Run the backend server:**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod --dbpath /path/to/data
```

**Option 2: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ashwini_radiology
   ```

## API Endpoints

### POST `/api/analyse`
Upload and analyse a medical image.

**Request:**
- `file` (multipart/form-data): Medical image file
- `override_modality` (optional): Force specific modality

**Response:**
```json
{
  "id": "analysis_id",
  "modality": "chest_ct",
  "prediction": "COVID-19",
  "confidence": 0.9234,
  "severity_score": 8.5,
  "uncertainty_std": 0.0421,
  "is_uncertain": false,
  "exact_point": {"x": 112, "y": 98},
  "processing_time_ms": 1234,
  "pdf_url": "/api/report/analysis_id",
  "heatmap_url": "/heatmaps/analysis_id_heatmap.png"
}
```

### GET `/api/history`
Get paginated analysis history.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

### GET `/api/report/{log_id}`
Download PDF report for a specific analysis.

## Usage Guide

### Using GitHub Desktop (Recommended for Git beginners)

1. **Clone the repository:**
   - Open GitHub Desktop
   - File → Clone Repository
   - Select this repository

2. **Make changes:**
   - Edit files in your code editor
   - Changes will appear in GitHub Desktop

3. **Commit changes:**
   - Write a summary of your changes
   - Click "Commit to main"

4. **Push to GitHub:**
   - Click "Push origin" to sync changes

### Testing the Application

1. **Start both servers:**
   - Backend: `python main.py` (port 8000)
   - Frontend: `npm run dev` (port 5173)

2. **Upload a test image:**
   - Navigate to `http://localhost:5173`
   - Drag and drop a medical image
   - Click "Start Analysis"

3. **View results:**
   - See prediction, confidence, severity score
   - View Grad-CAM heatmap
   - Download PDF report

4. **Check history:**
   - Click "History" in navbar
   - View past analyses
   - Download previous reports

## Troubleshooting

### Backend Issues

**ModuleNotFoundError:**
```bash
pip install -r requirements.txt
```

**MongoDB connection error:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`

**CUDA not available:**
- The app will automatically use CPU if CUDA is unavailable
- Install CUDA toolkit for GPU acceleration

### Frontend Issues

**Dependencies not found:**
```bash
npm install
```

**API connection errors:**
- Ensure backend is running on port 8000
- Check browser console for CORS errors

## Development

### Adding New Modalities

1. Add model architecture in `backend/models/architectures.py`
2. Update preprocessing in `backend/utils/preprocessing.py`
3. Add class names in `backend/routers/analysis.py`
4. Update severity weights in `backend/utils/severity_calculator.py`

### Customizing the UI

- Modify Tailwind config in `frontend/tailwind.config.js`
- Update components in `frontend/src/components/`
- Change color scheme in `frontend/src/index.css`

## License

This project is for educational and research purposes. Not intended for clinical use without proper validation and regulatory approval.

## Credits

- Built with FastAPI, React, PyTorch
- Uses Grad-CAM for explainability
- Powered by Google Gemini for clinical narratives
- MongoDB for data persistence

---

**Ashwini - Radiology Intelligence System**  
*AI-Powered Medical Image Analysis*
