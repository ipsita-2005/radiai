"""
GradCAM visualization utilities
"""
import numpy as np
import cv2
from PIL import Image
import torch
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from typing import Tuple


def generate_gradcam_heatmap(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,
    target_layer: torch.nn.Module,
    input_image: np.ndarray = None,
    use_cuda: bool = False
) -> Tuple[np.ndarray, Tuple[int, int]]:
    """
    Generate GradCAM heatmap and extract exact point of maximum activation
    
    Args:
        model: PyTorch model
        input_tensor: Input tensor for the model
        target_layer: Target convolutional layer for GradCAM
        input_image: Original image (optional, for overlay)
        use_cuda: Whether to use CUDA
    
    Returns:
        Tuple of (heatmap_overlay, exact_point_coordinates)
        - heatmap_overlay: Heatmap overlaid on original image (224x224x3)
        - exact_point: (x, y) coordinates of maximum activation
    """
    # Initialize GradCAM
    cam = GradCAM(model=model, target_layers=[target_layer], use_cuda=use_cuda)
    
    # Generate CAM
    grayscale_cam = cam(input_tensor=input_tensor, eigen_smooth=True)
    
    # Get the first (and usually only) image's CAM
    grayscale_cam = grayscale_cam[0, :]
    
    # Find exact point of maximum activation
    max_idx = np.unravel_index(np.argmax(grayscale_cam), grayscale_cam.shape)
    exact_point = (int(max_idx[1]), int(max_idx[0]))  # (x, y)
    
    # Resize CAM to match input image size
    grayscale_cam_resized = cv2.resize(grayscale_cam, (224, 224))
    
    # Normalize to 0-1
    grayscale_cam_normalized = (grayscale_cam_resized - np.min(grayscale_cam_resized)) / \
                               (np.max(grayscale_cam_resized) - np.min(grayscale_cam_resized) + 1e-8)
    
    # Create RGB heatmap if no input image provided
    if input_image is None:
        # Create a blank RGB image
        rgb_img = np.ones((224, 224, 3), dtype=np.float32) * 0.5
    else:
        # Use input image if provided
        if len(input_image.shape) == 2:
            rgb_img = cv2.cvtColor(input_image, cv2.COLOR_GRAY2RGB)
        else:
            rgb_img = input_image
        
        # Resize to 224x224
        rgb_img = cv2.resize(rgb_img, (224, 224))
        rgb_img = rgb_img.astype(np.float32) / 255.0
    
    # Apply colormap (Jet)
    heatmap = show_cam_on_image(rgb_img, grayscale_cam_normalized, use_rgb=True)
    
    return heatmap, exact_point


def save_heatmap_as_png(heatmap: np.ndarray, output_path: str) -> str:
    """
    Save heatmap as PNG file
    
    Args:
        heatmap: Heatmap array (224x224x3) in uint8 format
        output_path: Path to save the heatmap
    
    Returns:
        Output path
    """
    # Ensure heatmap is in uint8 format
    if heatmap.dtype != np.uint8:
        heatmap = (heatmap * 255).astype(np.uint8)
    
    # Convert RGB to BGR for OpenCV
    heatmap_bgr = cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR)
    
    # Save
    cv2.imwrite(output_path, heatmap_bgr)
    return output_path
