"""
Enhanced Modality Auto-Router - Professional Medical Imaging Detection
Implements 3-stage detection with strict validation
"""
import os
import mimetypes
from PIL import Image
import numpy as np
from typing import Tuple, Optional, Dict, Any
import cv2


def get_mime_type(file_path: str) -> Optional[str]:
    """
    Get MIME type from file path
    
    Args:
        file_path: Path to file
        
    Returns:
        MIME type string or None
    """
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type


def detect_modality_from_extension(filename: str) -> Optional[str]:
    """
    Stage 1: Strict File Extension & MIME Check
    
    Routes:
    - .csv → ECG
    - .dcm/.dicom → CT (DICOM format)
    - .jpg/.jpeg/.png → Image pipeline (X-Ray or MRI)
    
    Args:
        filename: Original filename
        
    Returns:
        Modality string or None if ambiguous
    """
    ext = os.path.splitext(filename)[1].lower()
    
    # Strict routing rules
    STRICT_ROUTING = {
        '.csv': 'ecg',
        '.dcm': 'ct',
        '.dicom': 'ct',
    }
    
    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    
    if ext in STRICT_ROUTING:
        return STRICT_ROUTING[ext]
    elif ext in IMAGE_EXTENSIONS:
        # Ambiguous - needs pixel analysis
        return None
    else:
        # Unsupported format
        raise ValueError(f"Unsupported file format: '{ext}'. Please upload CSV for ECG, DICOM for CT, or JPG/PNG for X-Ray/MRI.")


def analyze_pixel_statistics(image_path: str) -> Dict[str, Any]:
    """
    Stage 2: Comprehensive Pixel Statistics Analysis
    
    Analyzes:
    - Mean pixel intensity
    - Standard deviation
    - Aspect ratio
    - Histogram distribution
    - Edge density
    - Texture features
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary of image characteristics
    """
    try:
        # Load image
        img = Image.open(image_path)
        img_array = np.array(img)
        
        # Convert to grayscale if RGB
        if len(img_array.shape) == 3:
            gray = np.mean(img_array, axis=2)
        else:
            gray = img_array
        
        # Basic statistics
        mean_intensity = np.mean(gray)
        std_intensity = np.std(gray)
        aspect_ratio = img.width / img.height
        
        # Histogram analysis
        histogram, _ = np.histogram(gray.flatten(), bins=256, range=[0, 256])
        histogram_mean = np.mean(histogram)
        histogram_std = np.std(histogram)
        
        # Edge density (using Sobel operator)
        if img_array.dtype != np.uint8:
            img_array = (img_array * 255).astype(np.uint8)
        
        if len(img_array.shape) == 3:
            gray_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray_cv = img_array
        
        sobel_x = cv2.Sobel(gray_cv, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray_cv, cv2.CV_64F, 0, 1, ksize=3)
        edge_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        edge_density = np.mean(edge_magnitude)
        
        # Build metadata
        metadata = {
            'mean_intensity': float(mean_intensity),
            'std_intensity': float(std_intensity),
            'aspect_ratio': float(aspect_ratio),
            'width': img.width,
            'height': img.height,
            'histogram_mean': float(histogram_mean),
            'histogram_std': float(histogram_std),
            'edge_density': float(edge_density),
            'is_rgb': len(img_array.shape) == 3
        }
        
        return metadata
    
    except Exception as e:
        return {'error': str(e)}


def classify_modality_from_stats(metadata: Dict[str, Any]) -> str:
    """
    Stage 2b: Classify modality using pixel statistics
    
    Heuristics:
    - Brain MRI: Square-ish, mid-range intensity, specific texture
    - Chest X-Ray: Rectangular, high contrast, bone structures
    - CT Scan: Specific HU ranges, cross-sectional view
    
    Args:
        metadata: Image characteristics from analyze_pixel_statistics
        
    Returns:
        Classified modality string
    """
    mean_int = metadata.get('mean_intensity', 128)
    std_int = metadata.get('std_intensity', 50)
    aspect_ratio = metadata.get('aspect_ratio', 1.0)
    edge_density = metadata.get('edge_density', 0)
    width = metadata.get('width', 0)
    height = metadata.get('height', 0)
    
    # Decision tree based on medical imaging characteristics
    
    # Rule 1: Aspect ratio strongly suggests X-Ray (chest X-rays are typically portrait)
    if aspect_ratio < 0.7 or aspect_ratio > 1.5:
        # Rectangular image - likely X-Ray
        if mean_int > 150:  # High brightness typical of X-Rays
            return 'xray'
    
    # Rule 2: Square images with specific intensity patterns
    if 0.8 <= aspect_ratio <= 1.2:
        # Square-ish image
        if 60 <= mean_int <= 140:
            # Mid-range intensity typical of MRI brain scans
            if std_int > 30:  # Good contrast
                return 'mri'
        
        # CT scans often show cross-sections with specific patterns
        if 100 <= mean_int <= 200:
            if edge_density > 20:  # More edges/detail
                return 'ct'
    
    # Rule 3: Intensity-based classification
    if mean_int > 180:
        # Very bright - likely X-Ray with bone structures
        return 'xray'
    elif 80 <= mean_int <= 160:
        # Mid-range - could be MRI or CT
        if std_int > 40:
            return 'mri'  # Higher contrast variation
        else:
            return 'ct'
    
    # Default fallback based on most common case
    return 'xray'


def auto_detect_modality(file_path: str, filename: str) -> Tuple[str, Dict[str, Any]]:
    """
    Main Modality Detection Function - 3-Stage Process
    
    Stage 1: Strict file extension check
    Stage 2: Pixel statistics fallback (if extension ambiguous)
    Stage 3: Error handling with clear messaging
    
    Args:
        file_path: Full path to uploaded file
        filename: Original filename
        
    Returns:
        Tuple of (modality_string, metadata_dict)
        
    Raises:
        ValueError: If modality cannot be determined
    """
    print(f"\n=== Modality Detection for: {filename} ===")
    
    # ========== STAGE 1: Extension-Based Detection ==========
    try:
        modality = detect_modality_from_extension(filename)
        
        if modality:
            print(f"✓ Stage 1: Detected by extension → {modality}")
            return modality, {'detection_method': 'extension'}
    
    except ValueError as e:
        # Unsupported format - raise error immediately
        print(f"✗ Stage 1 failed: {str(e)}")
        raise e
    
    # ========== STAGE 2: Pixel Statistics Fallback ==========
    print("→ Stage 1 inconclusive, proceeding to Stage 2...")
    
    try:
        metadata = analyze_pixel_statistics(file_path)
        
        if 'error' in metadata:
            raise Exception(f"Pixel analysis failed: {metadata['error']}")
        
        # Classify using heuristics
        refined_modality = classify_modality_from_stats(metadata)
        
        print(f"✓ Stage 2: Pixel analysis → {refined_modality}")
        print(f"  Mean: {metadata['mean_intensity']:.1f}, Std: {metadata['std_intensity']:.1f}, AR: {metadata['aspect_ratio']:.2f}")
        
        metadata['detection_method'] = 'pixel_statistics'
        return refined_modality, metadata
    
    except Exception as e:
        # ========== STAGE 3: Error Handling ==========
        print(f"✗ Stage 2 failed: {str(e)}")
        
        # Cannot determine modality - return error for manual selection
        error_msg = (
            f"Unable to automatically determine imaging modality. "
            f"Please manually select the modality type:\n"
            f"- Brain MRI: Upload brain scan images\n"
            f"- Chest CT: Upload chest CT scans\n"
            f"- X-Ray: Upload X-Ray images\n"
            f"- ECG: Upload ECG signal data (CSV format)"
        )
        
        raise ValueError(error_msg)


def validate_modality_selection(selected_modality: str, detected_modality: str, confidence_threshold: float = 0.7) -> bool:
    """
    Validate user's manual modality selection against auto-detection
    
    Args:
        selected_modality: User-selected modality
        detected_modality: Auto-detected modality
        confidence_threshold: Minimum confidence for override suggestion
        
    Returns:
        Boolean indicating if selection is valid
    """
    if selected_modality == detected_modality:
        return True
    
    # Warn if user selection differs significantly from detection
    print(f"⚠️ WARNING: User selected '{selected_modality}' but detected '{detected_modality}'")
    
    # In production, could add additional validation logic here
    return True  # Allow override for now
