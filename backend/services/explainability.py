"""
Grad-CAM Explainability Service
Generates activation heatmaps for medical image analysis
"""
import numpy as np
import cv2
from PIL import Image
import torch
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from typing import Tuple, Optional, List, Any
import base64
from io import BytesIO


# Target layer mappings for different architectures
TARGET_LAYERS = {
    # ResNet variants (Brain MRI)
    'resnet18': ['layer4', 'layer4.1'],  # Final residual block
    'resnet34': ['layer4', 'layer4.1'],
    'resnet50': ['layer4', 'layer4.2'],
    
    # DenseNet variants (Chest X-Ray)
    'densenet121': ['features', 'denseblock4'],
    'densenet169': ['features', 'denseblock4'],
    'densenet201': ['features', 'denseblock4'],
    
    # EfficientNet variants (Bone X-Ray, Chest CT)
    'efficientnet-b0': ['features', '_blocks.15'],
    'efficientnet-b3': ['features', '_blocks.15'],
    'efficientnet-b4': ['features', '_blocks.21'],
    
    # Custom CNNs
    'custom_cnn': ['conv_layers', 'conv_layers.10'],  # Adjust based on architecture
}


def get_target_layer(model: torch.nn.Module, modality: str, model_name: str = None) -> List[torch.nn.Module]:
    """
    Get target layer(s) for GradCAM based on model architecture
    
    Args:
        model: PyTorch model
        modality: Medical modality ('mri', 'ct', 'xray', etc.)
        model_name: Specific model architecture name (optional)
    
    Returns:
        List of target layer modules
    """
    # Try to infer model type from architecture
    model_str = str(type(model).__name__).lower()
    
    # Map modality + model to target layers
    if 'resnet' in model_str:
        # ResNet: Use layer4 (final conv block)
        if hasattr(model, 'layer4'):
            return [model.layer4[-1]]
        else:
            # Fallback: find last convolutional layer
            for name, module in model.named_modules():
                if isinstance(module, torch.nn.Conv2d):
                    last_conv = module
            return [last_conv]
    
    elif 'densenet' in model_str:
        # DenseNet: Use final dense block
        if hasattr(model, 'features'):
            if hasattr(model.features, 'norm5'):
                return [model.features.norm5]
            # Fallback to last conv block
            dense_blocks = [m for n, m in model.features.named_children() 
                          if 'denseblock' in n]
            if dense_blocks:
                return [dense_blocks[-1]]
    
    elif 'efficientnet' in model_str:
        # EfficientNet: Use final MBConv block
        if hasattr(model, 'features'):
            # Find the last block
            blocks = [m for n, m in model.features.named_children() 
                     if hasattr(m, '__iter__')]
            if blocks:
                last_block = blocks[-1]
                # Try to get the last MBConv within the block
                if hasattr(last_block, '-1'):
                    return [getattr(last_block, str(len(last_block) - 1))]
                return [last_block]
    
    # Default fallback: find the last Conv2d layer
    print(f"⚠️ Warning: Could not auto-detect target layer for {model_str}")
    print("   Using last Conv2d layer as fallback")
    
    last_conv = None
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Conv2d):
            last_conv = module
    
    if last_conv is None:
        raise ValueError("No Conv2d layers found in model!")
    
    return [last_conv]


def preprocess_image_for_cam(image: np.ndarray) -> np.ndarray:
    """
    Preprocess image for GradCAM visualization
    
    Args:
        image: Input image (numpy array)
    
    Returns:
        Preprocessed RGB image normalized to [0, 1]
    """
    # Handle grayscale images
    if len(image.shape) == 2:
        rgb_img = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 3:
        rgb_img = image.copy()
    else:
        # Handle RGBA or other formats
        rgb_img = image[:, :, :3]
    
    # Normalize to [0, 1] range
    if rgb_img.dtype == np.uint8:
        rgb_img = rgb_img.astype(np.float32) / 255.0
    else:
        # Already normalized, just ensure float32
        rgb_img = rgb_img.astype(np.float32)
    
    # Resize to standard size (224x224)
    rgb_img = cv2.resize(rgb_img, (224, 224))
    
    return rgb_img


def generate_gradcam_heatmap(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,
    target_layer: torch.nn.Module,
    input_image: np.ndarray = None,
    use_cuda: bool = False,
    modality: str = None
) -> Tuple[np.ndarray, Tuple[int, int]]:
    """
    Generate GradCAM heatmap and extract exact point of maximum activation
    
    Args:
        model: PyTorch model
        input_tensor: Input tensor for the model (already preprocessed)
        target_layer: Target convolutional layer for GradCAM
        input_image: Original image numpy array (optional, for overlay)
        use_cuda: Whether to use CUDA
        modality: Medical modality (for logging)
    
    Returns:
        Tuple of (heatmap_overlay, exact_point_coordinates)
        - heatmap_overlay: Heatmap overlaid on original image (224x224x3) uint8
        - exact_point: (x, y) coordinates of maximum activation
    """
    print(f"\n🔥 Generating GradCAM heatmap...")
    if modality:
        print(f"   Modality: {modality}")
    print(f"   Target layer: {type(target_layer).__name__}")
    print(f"   Device: {'CUDA' if use_cuda else 'CPU'}")
    
    try:
        # Initialize GradCAM
        cam = GradCAM(model=model, target_layers=[target_layer], use_cuda=use_cuda)
        
        # Generate CAM - IMPORTANT: Don't pass targets for classification
        grayscale_cam = cam(input_tensor=input_tensor, eigen_smooth=True)
        
        # Get the first (and usually only) image's CAM
        grayscale_cam = grayscale_cam[0, :]
        
        # Find exact point of maximum activation
        max_idx = np.unravel_index(np.argmax(grayscale_cam), grayscale_cam.shape)
        exact_point = (int(max_idx[1]), int(max_idx[0]))  # (x, y)
        
        print(f"   ✓ Peak activation at: {exact_point}")
        
        # Resize CAM to match input image size
        grayscale_cam_resized = cv2.resize(grayscale_cam, (224, 224))
        
        # Normalize to 0-1
        grayscale_cam_normalized = (grayscale_cam_resized - np.min(grayscale_cam_resized)) / \
                                   (np.max(grayscale_cam_resized) - np.min(grayscale_cam_resized) + 1e-8)
        
        # Prepare input image for overlay
        if input_image is None:
            # Create a blank RGB image
            rgb_img = np.ones((224, 224, 3), dtype=np.float32) * 0.5
        else:
            rgb_img = preprocess_image_for_cam(input_image)
        
        # Apply Jet colormap and overlay
        heatmap = show_cam_on_image(rgb_img, grayscale_cam_normalized, use_rgb=True)
        
        print(f"   ✓ Heatmap generated successfully")
        
        return heatmap, exact_point
        
    except Exception as e:
        print(f"   ✗ Error generating GradCAM: {str(e)}")
        raise


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
    print(f"✓ Heatmap saved to: {output_path}")
    return output_path


def heatmap_to_base64(heatmap: np.ndarray) -> str:
    """
    Convert heatmap to base64 encoded PNG string
    
    Args:
        heatmap: Heatmap array (224x224x3)
    
    Returns:
        Base64 encoded PNG string
    """
    # Ensure heatmap is in uint8 format
    if heatmap.dtype != np.uint8:
        heatmap = (heatmap * 255).astype(np.uint8)
    
    # Convert RGB to BGR for OpenCV
    heatmap_bgr = cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR)
    
    # Encode to PNG
    _, buffer = cv2.imencode('.png', heatmap_bgr)
    
    # Convert to base64
    base64_string = base64.b64encode(buffer).decode('utf-8')
    
    return base64_string


def generate_explainability_report(
    model: torch.nn.Module,
    input_tensor: torch.Tensor,
    input_image: np.ndarray,
    modality: str,
    prediction_label: str,
    confidence: float,
    use_cuda: bool = False
) -> dict:
    """
    Complete explainability report with GradCAM heatmap
    
    Args:
        model: PyTorch model
        input_tensor: Input tensor
        input_image: Original image numpy array
        modality: Medical modality
        prediction_label: Model prediction
        confidence: Confidence score
        use_cuda: Whether to use CUDA
    
    Returns:
        Dictionary containing:
        - heatmap_base64: Base64 encoded heatmap PNG
        - exact_point: (x, y) coordinates
        - target_layer_name: Name of target layer used
    """
    print(f"\n{'='*60}")
    print(f"GENERATING EXPLAINABILITY REPORT")
    print(f"{'='*60}")
    print(f"Modality: {modality}")
    print(f"Prediction: {prediction_label} ({confidence:.2%})")
    
    # Get appropriate target layer
    try:
        target_layers = get_target_layer(model, modality)
        target_layer = target_layers[0]
        target_layer_name = f"{type(target_layer).__name__}"
        print(f"Target Layer: {target_layer_name}")
    except Exception as e:
        print(f"Error finding target layer: {e}")
        raise
    
    # Generate GradCAM heatmap
    heatmap, exact_point = generate_gradcam_heatmap(
        model=model,
        input_tensor=input_tensor,
        target_layer=target_layer,
        input_image=input_image,
        use_cuda=use_cuda,
        modality=modality
    )
    
    # Convert to base64
    heatmap_base64 = heatmap_to_base64(heatmap)
    
    print(f"\n{'='*60}")
    print(f"EXPLAINABILITY REPORT COMPLETE")
    print(f"{'='*60}")
    print(f"Heatmap Size: {heatmap.shape}")
    print(f"Peak Activation: {exact_point}")
    print(f"Base64 Length: {len(heatmap_base64)} chars")
    
    return {
        'heatmap_base64': heatmap_base64,
        'exact_point': exact_point,
        'target_layer_name': target_layer_name,
        'heatmap_array': heatmap  # Include array for saving
    }
