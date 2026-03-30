"""
Database Schema Definitions for Analysis Logs
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ExactPoint(BaseModel):
    """Coordinates for the exact point of maximum activation"""
    x: float
    y: float

class AnalysisLogSchema(BaseModel):
    """
    Schema for analysis log documents in MongoDB
    
    This schema defines the structure for storing medical image analysis results
    """
    _id: Optional[str] = Field(None, alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    modality: str  # auto-detected: MRI, CT, X-Ray, ECG
    prediction: str  # predicted class
    confidence: float = Field(..., ge=0.0, le=1.0)  # 0.0 - 1.0
    severity_score: float = Field(..., ge=1.0, le=10.0)  # 1.0 - 10.0
    uncertainty_std: float  # standard deviation from MC Dropout
    is_uncertain: bool = False  # True if uncertainty_std > 0.15
    heatmap_path: str  # path to GradCAM heatmap image
    exact_point: ExactPoint  # {x, y} coordinates
    pdf_report_path: str  # path to generated PDF report
    processing_time_ms: int  # total processing time in milliseconds
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AnalysisLogUpdateSchema(BaseModel):
    """Schema for updating analysis logs"""
    pass

def create_analysis_log(
    modality: str,
    prediction: str,
    confidence: float,
    severity_score: float,
    uncertainty_std: float,
    heatmap_path: str,
    exact_point: Dict[str, float],
    pdf_report_path: str,
    processing_time_ms: int
) -> Dict[str, Any]:
    """
    Helper function to create an analysis log document
    
    Args:
        modality: Imaging modality (MRI, CT, X-Ray, ECG)
        prediction: Predicted class
        confidence: Confidence score (0-1)
        severity_score: Severity score (1-10)
        uncertainty_std: Uncertainty standard deviation
        heatmap_path: Path to saved heatmap
        exact_point: Dictionary with x, y coordinates
        pdf_report_path: Path to saved PDF report
        processing_time_ms: Processing time in milliseconds
    
    Returns:
        Dictionary ready to be inserted into MongoDB
    """
    is_uncertain = uncertainty_std > 0.15
    
    return {
        "timestamp": datetime.utcnow(),
        "modality": modality,
        "prediction": prediction,
        "confidence": confidence,
        "severity_score": severity_score,
        "uncertainty_std": uncertainty_std,
        "is_uncertain": is_uncertain,
        "heatmap_path": heatmap_path,
        "exact_point": exact_point,
        "pdf_report_path": pdf_report_path,
        "processing_time_ms": processing_time_ms
    }
