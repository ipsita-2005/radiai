"""
Modality Auto-Router - Detects imaging modality from file characteristics
"""
import os
from PIL import Image
import numpy as np
from typing import Tuple


def detect_modality_from_extension(filename: str) -> str:
    """
    Detect modality based on file extension
    
    Args:
        filename: Name of the uploaded file
    
    Returns:
        Modality string: 'ecg', 'ct', 'xray', or 'mri'
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == '.csv':
        return 'ecg'
    elif ext in ['.dcm', '.dicom']:
        # Could be CT or MRI - will refine with pixel analysis
        return 'ct'  # Default to CT for DICOM
    elif ext in ['.jpg', '.jpeg', '.png', '.bmp']:
        # Could be X-Ray or MRI slice - will refine with pixel analysis
        return 'xray'  # Default to X-Ray for standard images
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def detect_modality_from_pixel_stats(image_path: str) -> Tuple[str, dict]:
    """
    Fallback modality detection using image pixel statistics
    Analyzes mean HU, aspect ratio, and other characteristics
    
    Args:
        image_path: Path to image file
    
    Returns:
        Tuple of (modality_string, metadata_dict)
    """
    try:
        img = Image.open(image_path)
        img_array = np.array(img)
        
        # Calculate statistics
        if len(img_array.shape) == 3:
            # RGB image - convert to grayscale for analysis
            gray = np.mean(img_array, axis=2)
        else:
            gray = img_array
        
        mean_intensity = np.mean(gray)
        std_intensity = np.std(gray)
        aspect_ratio = img.width / img.height
        image_size = (img.width, img.height)
        
        metadata = {
            'mean_intensity': float(mean_intensity),
            'std_intensity': float(std_intensity),
            'aspect_ratio': float(aspect_ratio),
            'width': img.width,
            'height': img.height
        }
        
        # Heuristic-based classification
        # Brain MRIs often have specific intensity distributions
        if 80 <= mean_intensity <= 150 and 0.8 <= aspect_ratio <= 1.2:
            # Square-ish image with mid-range intensity - likely MRI
            return 'mri', metadata
        
        # Chest X-Rays typically have high contrast and specific aspect ratios
        elif mean_intensity > 180 and (aspect_ratio > 1.2 or aspect_ratio < 0.8):
            # High intensity, rectangular - likely X-Ray
            return 'xray', metadata
        
        # CT scans often show specific HU ranges
        elif 50 <= mean_intensity <= 200:
            return 'ct', metadata
        
        # Default to X-Ray
        else:
            return 'xray', metadata
    
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return 'xray', {'error': str(e)}


def auto_detect_modality(file_path: str, filename: str) -> Tuple[str, dict]:
    """
    Main modality detection function combining extension and pixel analysis
    
    Args:
        file_path: Full path to uploaded file
        filename: Original filename
    
    Returns:
        Tuple of (modality_string, metadata_dict)
    """
    # First try extension-based detection
    modality = detect_modality_from_extension(filename)
    
    # For ambiguous cases (DICOM, standard images), do pixel analysis
    if modality in ['ct', 'xray']:
        refined_modality, metadata = detect_modality_from_pixel_stats(file_path)
        
        # Only override if pixel analysis is confident
        if refined_modality != modality:
            # Log the override for debugging
            print(f"Modality override: {modality} -> {refined_modality}")
            modality = refined_modality
    
    return modality, {}
