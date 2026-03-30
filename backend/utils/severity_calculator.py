"""
Severity Score Calculator based on clinical weights
"""
from typing import Dict


# Clinical severity weights for different conditions
# Scale: 0.0 (normal) to 1.0 (most severe)
CLINICAL_SEVERITY_WEIGHTS = {
    # Brain MRI
    'Glioma': 0.85,
    'Meningioma': 0.75,
    'Pituitary': 0.70,
    'No Tumour': 0.00,
    
    # Chest CT
    'COVID-19': 0.90,
    'Viral Pneumonia': 0.80,
    'Lung Opacity': 0.65,
    'Normal': 0.00,
    
    # Head CT
    'Haemorrhage': 0.95,
    'No Haemorrhage': 0.00,
    
    # Bone X-Ray
    'Comminuted': 0.90,
    'Displaced': 0.80,
    'Hairline': 0.40,
    'Normal': 0.00,
    
    # ECG
    'Myocardial Infarction': 0.95,
    'Abnormal heartbeat': 0.70,
    'History of myocardial infarction': 0.75,
    'Normal': 0.00,
}


def calculate_severity_score(
    prediction: str,
    confidence: float,
    modality: str
) -> float:
    """
    Calculate severity score based on clinical weights
    
    Formula: (clinical_weight * confidence * 10), clamped to [1.0, 10.0]
    
    Args:
        prediction: Predicted class
        confidence: Model confidence (0-1)
        modality: Imaging modality
    
    Returns:
        Severity score (1.0 - 10.0)
    """
    # Get clinical weight for the predicted condition
    clinical_weight = CLINICAL_SEVERITY_WEIGHTS.get(prediction, 0.5)
    
    # Calculate raw severity score
    raw_severity = clinical_weight * confidence * 10.0
    
    # Clamp to [1.0, 10.0] range
    severity_score = max(1.0, min(10.0, raw_severity))
    
    return severity_score


def get_severity_category(severity_score: float) -> str:
    """
    Get categorical severity description
    
    Args:
        severity_score: Numeric severity score (1-10)
    
    Returns:
        Category string
    """
    if severity_score >= 8.0:
        return "CRITICAL"
    elif severity_score >= 6.0:
        return "SEVERE"
    elif severity_score >= 4.0:
        return "MODERATE"
    elif severity_score >= 2.0:
        return "MILD"
    else:
        return "MINIMAL"
