# 🏥 Ashwini Platform Overhaul - Implementation Plan

## 🎯 Phase 1: Fix Backend Modality Auto-Router

### Current Issues:
- Basic extension detection only
- Weak pixel statistics fallback
- No proper error handling for ambiguous cases

### Solution:

#### 1. **Strict File Extension & MIME Check**
```python
# Route .csv → ECG
# Route .dcm → CT  
# Route .jpg/.jpeg/.png → Image pipeline
```

#### 2. **Enhanced Pixel Statistics Fallback**
- Mean pixel intensity
- Standard deviation
- Aspect ratio analysis
- Histogram analysis for better differentiation

#### 3. **Error Handling**
- HTTP 400 if modality cannot be determined
- Clear error message for manual selection

---

## 🎨 Phase 2: Professional Medical UI Overhaul

### Color Palette Update:
```
Backgrounds: slate-900 (#0f172a)
Cards: white (#ffffff)
Primary Actions: blue-600 (#2563eb)
Accents: teal-500 (#14b8a6)
Text: slate-gray scale
```

### Typography:
- Clean sans-serif (Inter/system-ui)
- High contrast tables
- Structured grid layouts

### Remove Gemini Branding:
- Replace "Gemini" with "Clinical AI Narrative"
- Remove Google references
- Rename to "Automated Summary" or "Diagnostic Context"

---

## 🔥 Phase 3: Grad-CAM Implementation

### Backend Requirements:
1. Use `pytorch-grad-cam` library
2. Target final convolutional layer
3. Generate Jet colormap heatmap
4. Overlay on original image
5. Return as Base64 PNG string

### Frontend Component:
- Side-by-side view (original vs heatmap)
- Toggle switch or opacity slider
- Verify region of interest

---

## 🧠 Phase 4: Pre-trained Models Integration

### Directory Structure:
```
backend/weights/
├── mri_resnet18.pt
├── chest_ct_efficientnet.pt
├── head_ct_custom.pt
├── xray_efficientnet.pt
└── ecg_1d_cnn.pt
```

### Configuration File:
```python
# model_loader.py
WEIGHTS_PATH = {
    'mri': 'weights/mri_resnet18.pt',
    'chest_ct': 'weights/chest_ct_efficientnet.pt',
    # ... etc
}
```

### README Instructions:
Manual download from Drive → Place in `backend/weights/`

---

## 📋 Implementation Checklist

### Phase 1:
- [ ] Update `modality_router.py` with strict checks
- [ ] Add MIME type validation
- [ ] Implement pixel statistics fallback
- [ ] Add HTTP 400 error handling

### Phase 2:
- [ ] Update `index.css` with medical color palette
- [ ] Redesign `UploadPage.tsx` with professional look
- [ ] Update all components (ResultCard, Navbar, etc.)
- [ ] Remove all Gemini references

### Phase 3:
- [ ] Install `pytorch-grad-cam`
- [ ] Update `gradcam_utils.py`
- [ ] Create Base64 encoding function
- [ ] Build frontend ExplainabilityPanel with overlay

### Phase 4:
- [ ] Create `backend/weights/` directory
- [ ] Create `model_loader.py`
- [ ] Update architecture loading
- [ ] Add README instructions

---

## 🚀 Expected Outcome

A professional, enterprise-grade clinical tool with:
- ✅ Robust modality auto-detection
- ✅ Serious medical aesthetic
- ✅ Grad-CAM explainability
- ✅ Pre-trained model integration
- ✅ No third-party branding
