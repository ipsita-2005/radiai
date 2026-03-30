"""
Analysis Router - Main API endpoint for medical image analysis
Implements the 8-step processing pipeline
"""
import os
import uuid
import time
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse, FileResponse
import torch
import numpy as np
from PIL import Image

from database import get_collection
from models.schema import create_analysis_log
from models.architectures import get_model
from utils import (
    preprocess_xray,
    preprocess_ct,
    preprocess_ecg,
    load_image_from_file,
    generate_gradcam_heatmap,
    save_heatmap_as_png,
    generate_pdf_report,
    auto_detect_modality,
    calculate_severity_score
)
from services.gemini_service import get_gemini_service

router = APIRouter()

# Maximum file size: 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024

# Get target layers for GradCAM for each model type
TARGET_LAYERS = {
    'mri': 'layer4',  # ResNet-18
    'chest_ct': 'features.9',  # EfficientNet-B3
    'head_ct': 'conv_layers.10',  # Custom CNN layer 6
    'ecg': None,  # No GradCAM for ECG
    'xray': 'features.9'  # EfficientNet-B4
}


@router.post("/analyse")
async def analyse_medical_image(
    file: UploadFile = File(...),
    override_modality: Optional[str] = Form(None)
):
    """
    Analyse uploaded medical image
    
    Implements 8-step processing pipeline:
    1. File Validation
    2. Modality Auto-Router
    3. Preprocessing
    4. Model Inference
    5. MC Dropout Uncertainty
    6. GradCAM + Exact Point
    7. Severity Score
    8. PDF & Gemini Report
    """
    start_time = time.time()
    
    # ========== STEP 1: File Validation ==========
    try:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 50 MB limit")
        
        # Save file temporarily
        file_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file.filename)[1]
        temp_path = f"uploads/{file_id}{file_ext}"
        
        with open(temp_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")
    
    try:
        # ========== STEP 2: Modality Auto-Router ==========
        if override_modality:
            modality = override_modality.lower()
            metadata = {}
        else:
            modality, metadata = auto_detect_modality(temp_path, file.filename)
        
        print(f"Detected modality: {modality}")
        
        # ========== STEP 3: Preprocessing ==========
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        
        try:
            if modality == 'ecg':
                # Load ECG CSV
                ecg_signal = np.loadtxt(temp_path, delimiter=',')
                input_tensor = preprocess_ecg(ecg_signal).to(device)
                original_image = None
            elif modality == 'ct':
                input_tensor = preprocess_ct(temp_path).to(device)
                original_image = np.array(load_image_from_file(temp_path))
            else:  # xray or mri
                img = load_image_from_file(temp_path)
                original_image = np.array(img)
                input_tensor = preprocess_xray(img).to(device)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Preprocessing error: {str(e)}")
        
        # ========== STEP 4: Model Inference ==========
        # Load model
        model = get_model(modality, pretrained=False)
        model.to(device)
        model.eval()
        
        # Mixed precision inference
        with torch.cuda.amp.autocast(enabled=(device.type == 'cuda')):
            with torch.no_grad():
                outputs = model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted_class = torch.max(probabilities, 1)
        
        # Get class names based on modality
        class_names = get_class_names(modality)
        prediction_label = class_names[predicted_class.item()]
        confidence_value = confidence.item()
        
        print(f"Prediction: {prediction_label}, Confidence: {confidence_value:.4f}")
        
        # ========== STEP 5: MC Dropout Uncertainty ==========
        model.train()  # Enable dropout
        mc_samples = 30
        mc_predictions = []
        
        with torch.cuda.amp.autocast(enabled=(device.type == 'cuda')):
            with torch.no_grad():
                for _ in range(mc_samples):
                    mc_outputs = model(input_tensor)
                    mc_probs = torch.softmax(mc_outputs, dim=1)
                    mc_predictions.append(mc_probs.cpu().numpy())
        
        model.eval()
        
        # Calculate uncertainty
        mc_predictions_array = np.vstack(mc_predictions)
        uncertainty_std = np.std(mc_predictions_array[:, predicted_class.item()])
        is_uncertain = uncertainty_std > 0.15
        
        print(f"Uncertainty Std: {uncertainty_std:.4f}, Is Uncertain: {is_uncertain}")
        
        # ========== STEP 6: GradCAM + Exact Point ==========
        heatmap_path = None
        exact_point = {"x": 0, "y": 0}
        
        if modality in ['xray', 'mri', 'ct']:
            try:
                target_layer_name = TARGET_LAYERS.get(modality)
                if target_layer_name:
                    # Get target layer by name
                    target_layer = dict(model.named_modules()).get(target_layer_name)
                    
                    if target_layer:
                        heatmap, point = generate_gradcam_heatmap(
                            model=model,
                            input_tensor=input_tensor,
                            target_layer=target_layer,
                            input_image=original_image,
                            use_cuda=(device.type == 'cuda')
                        )
                        
                        # Save heatmap
                        heatmap_filename = f"{file_id}_heatmap.png"
                        heatmap_path = f"heatmaps/{heatmap_filename}"
                        save_heatmap_as_png(heatmap, heatmap_path)
                        
                        exact_point = {"x": float(point[0]), "y": float(point[1])}
                        print(f"Exact Point: {exact_point}")
            except Exception as e:
                print(f"GradCAM error: {e}")
                # Continue without heatmap
        
        # ========== STEP 7: Severity Score ==========
        severity_score = calculate_severity_score(prediction_label, confidence_value, modality)
        print(f"Severity Score: {severity_score:.2f}")
        
        # ========== STEP 8: PDF & Gemini Report ==========
        gemini_service = get_gemini_service()
        gemini_summary = await gemini_service.generate_clinical_summary(
            modality=modality,
            prediction=prediction_label,
            confidence=confidence_value,
            severity_score=severity_score,
            is_uncertain=is_uncertain
        )
        
        # Generate PDF
        pdf_filename = f"{file_id}_report.pdf"
        pdf_path = f"reports/{pdf_filename}"
        
        generate_pdf_report(
            prediction=prediction_label,
            confidence=confidence_value,
            severity_score=severity_score,
            modality=modality,
            uncertainty_std=uncertainty_std,
            is_uncertain=is_uncertain,
            exact_point=exact_point,
            gemini_summary=gemini_summary,
            heatmap_path=heatmap_path if heatmap_path else "",
            output_path=pdf_path
        )
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Save to MongoDB
        collection = get_collection("analysis_logs")
        log_doc = create_analysis_log(
            modality=modality,
            prediction=prediction_label,
            confidence=confidence_value,
            severity_score=severity_score,
            uncertainty_std=uncertainty_std,
            heatmap_path=heatmap_path if heatmap_path else "",
            exact_point=exact_point,
            pdf_report_path=pdf_path,
            processing_time_ms=processing_time_ms
        )
        
        result = await collection.insert_one(log_doc)
        log_id = str(result.inserted_id)
        
        # Prepare response
        response_data = {
            "id": log_id,
            "modality": modality,
            "prediction": prediction_label,
            "confidence": round(confidence_value, 4),
            "severity_score": round(severity_score, 2),
            "uncertainty_std": round(uncertainty_std, 4),
            "is_uncertain": is_uncertain,
            "exact_point": exact_point,
            "processing_time_ms": processing_time_ms,
            "pdf_url": f"/api/report/{log_id}",
            "heatmap_url": f"/{heatmap_path}" if heatmap_path else None
        }
        
        return JSONResponse(content=response_data)
    
    finally:
        # Cleanup temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/history")
async def get_history(page: int = 1, limit: int = 20):
    """Get paginated analysis history"""
    collection = get_collection("analysis_logs")
    
    # Calculate skip for pagination
    skip = (page - 1) * limit
    
    # Get total count
    total = await collection.count_documents({})
    
    # Get paginated results
    cursor = collection.find({}).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string and format
    formatted_logs = []
    for log in logs:
        log["id"] = str(log["_id"])
        del log["_id"]
        formatted_logs.append(log)
    
    return {
        "data": formatted_logs,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/report/{log_id}")
async def get_report(log_id: str):
    """Download PDF report"""
    collection = get_collection("analysis_logs")
    
    log = await collection.find_one({"_id": log_id})
    if not log:
        raise HTTPException(status_code=404, detail="Report not found")
    
    pdf_path = log.get("pdf_report_path")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path)
    )


def get_class_names(modality: str) -> list:
    """Get class names for each modality"""
    class_maps = {
        'mri': ['Glioma', 'Meningioma', 'Pituitary', 'No Tumour'],
        'chest_ct': ['COVID-19', 'Lung Opacity', 'Normal', 'Viral Pneumonia'],
        'head_ct': ['Haemorrhage', 'No Haemorrhage'],
        'ecg': ['Myocardial Infarction', 'Abnormal heartbeat', 'History of myocardial infarction', 'Normal', 'Other'],
        'xray': ['Comminuted', 'Displaced', 'Hairline', 'Normal']
    }
    return class_maps.get(modality, ['Unknown'])
