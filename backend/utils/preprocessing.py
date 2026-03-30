"""
Preprocessing utilities for medical images
"""
import numpy as np
import cv2
from PIL import Image
import torch
from torchvision import transforms
import pydicom
from typing import Tuple, Union


def preprocess_xray(image: Union[np.ndarray, Image.Image]) -> torch.Tensor:
    """
    Preprocess X-Ray/MRI images
    - Resize to 224x224
    - Normalize
    
    Args:
        image: PIL Image or numpy array
    
    Returns:
        Preprocessed tensor of shape (1, 3, 224, 224)
    """
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)
    
    # Convert to RGB if grayscale
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    tensor = transform(image).unsqueeze(0)
    return tensor


def preprocess_ct(image: Union[np.ndarray, str], window: Tuple[int, int] = (-1000, 400)) -> torch.Tensor:
    """
    Preprocess CT images with HU windowing
    - Apply HU windowing [-1000, 400]
    - Resize to 224x224
    - Normalize
    
    Args:
        image: DICOM file path or numpy array
        window: HU window (min, max)
    
    Returns:
        Preprocessed tensor of shape (1, 3, 224, 224)
    """
    # Load DICOM if path provided
    if isinstance(image, str):
        dicom_data = pydicom.dcmread(image)
        image = dicom_data.pixel_array.astype(np.float32)
    
    # Apply HU windowing
    min_hu, max_hu = window
    image = np.clip(image, min_hu, max_hu)
    
    # Normalize to 0-1 range
    image = (image - min_hu) / (max_hu - min_hu)
    
    # Convert to RGB (3 channels)
    image = (image * 255).astype(np.uint8)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    
    # Apply standard transforms
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    pil_image = Image.fromarray(image_rgb)
    tensor = transform(pil_image).unsqueeze(0)
    return tensor


def preprocess_ecg(signal: np.ndarray, target_hz: int = 100) -> torch.Tensor:
    """
    Preprocess ECG signals
    - Resample to 100Hz
    - Normalize
    
    Args:
        signal: Raw ECG signal array
        target_hz: Target sampling rate
    
    Returns:
        Preprocessed tensor of shape (1, 1, signal_length)
    """
    from scipy import signal as scipy_signal
    
    # Assume original sampling rate is ~250-500 Hz
    # Resample to 100 Hz
    current_length = len(signal)
    target_length = int(current_length * (target_hz / 250))  # Assuming 250Hz original
    
    # Resample
    resampled = scipy_signal.resample(signal, target_length)
    
    # Normalize
    resampled = (resampled - np.mean(resampled)) / np.std(resampled)
    
    # Convert to tensor
    tensor = torch.FloatTensor(resampled).unsqueeze(0).unsqueeze(0)
    return tensor


def load_image_from_file(file_path: str) -> Union[np.ndarray, Image.Image]:
    """
    Load image from file path
    
    Args:
        file_path: Path to image file
    
    Returns:
        Loaded image as numpy array or PIL Image
    """
    return Image.open(file_path)
