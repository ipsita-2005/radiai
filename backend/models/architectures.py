"""
PyTorch Model Architectures for 5 Medical Imaging Modalities
"""
import torch
import torch.nn as nn
from torchvision import models
from typing import Tuple


class BrainMRIModel(nn.Module):
    """
    Brain MRI Classification - ResNet-18
    Classes: Glioma, Meningioma, Pituitary, No Tumour
    """
    def __init__(self, num_classes: int = 4, pretrained: bool = False):
        super(BrainMRIModel, self).__init__()
        
        # Load ResNet-18
        if pretrained:
            self.backbone = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        else:
            self.backbone = models.resnet18(weights=None)
        
        # Replace final fully connected layer
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


class ChestCTModel(nn.Module):
    """
    Chest CT Classification - EfficientNet-B3
    Classes: COVID-19, Lung Opacity, Normal, Viral Pneumonia
    """
    def __init__(self, num_classes: int = 4, pretrained: bool = False):
        super(ChestCTModel, self).__init__()
        
        # Load EfficientNet-B3
        if pretrained:
            self.backbone = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
        else:
            self.backbone = models.efficientnet_b3(weights=None)
        
        # Replace classifier
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.SiLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


class HeadCTModel(nn.Module):
    """
    Head CT Haemorrhage Detection - Custom 6-layer CNN
    Binary Classification: Haemorrhage, No Haemorrhage
    """
    def __init__(self, num_classes: int = 2):
        super(HeadCTModel, self).__init__()
        
        # 6 Convolutional Layers
        self.conv_layers = nn.Sequential(
            # Layer 1
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            # Layer 2
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            # Layer 3
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            # Layer 4
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            # Layer 5
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            # Layer 6
            nn.Conv2d(256, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        # Fully connected layers
        self.fc_layers = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x


class ECGModel(nn.Module):
    """
    ECG Signal Classification - 1D CNN
    6 temporal convolutional layers with 64, 128, 256, 256, 128, 64 filters
    5-class classification
    """
    def __init__(self, num_classes: int = 5, input_length: int = 5000):
        super(ECGModel, self).__init__()
        
        # 6 Temporal Convolutional Layers
        self.conv_layers = nn.Sequential(
            # Layer 1: 64 filters
            nn.Conv1d(1, 64, kernel_size=7, stride=2, padding=3),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            # Layer 2: 128 filters
            nn.Conv1d(64, 128, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            # Layer 3: 256 filters
            nn.Conv1d(128, 256, kernel_size=5, stride=2, padding=2),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            # Layer 4: 256 filters
            nn.Conv1d(256, 256, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            # Layer 5: 128 filters
            nn.Conv1d(256, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.MaxPool1d(2),
            
            # Layer 6: 64 filters
            nn.Conv1d(128, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        
        # Global pooling and classification
        self.fc_layers = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x


class BoneXRayModel(nn.Module):
    """
    Bone X-Ray Fracture Classification - EfficientNet-B4
    Classes: Comminuted, Displaced, Hairline, Normal
    """
    def __init__(self, num_classes: int = 4, pretrained: bool = False):
        super(BoneXRayModel, self).__init__()
        
        # Load EfficientNet-B4
        if pretrained:
            self.backbone = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.IMAGENET1K_V1)
        else:
            self.backbone = models.efficientnet_b4(weights=None)
        
        # Replace classifier
        num_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.SiLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)


# Model factory function
def get_model(modality: str, pretrained: bool = False) -> nn.Module:
    """
    Factory function to get the appropriate model for a modality
    
    Args:
        modality: One of 'mri', 'chest_ct', 'head_ct', 'ecg', 'xray'
        pretrained: Whether to use pretrained weights
    
    Returns:
        PyTorch model instance
    """
    models_dict = {
        'mri': lambda: BrainMRIModel(pretrained=pretrained),
        'chest_ct': lambda: ChestCTModel(pretrained=pretrained),
        'head_ct': lambda: HeadCTModel(),
        'ecg': lambda: ECGModel(),
        'xray': lambda: BoneXRayModel(pretrained=pretrained)
    }
    
    if modality not in models_dict:
        raise ValueError(f"Unknown modality: {modality}. Choose from {list(models_dict.keys())}")
    
    return models_dict[modality]()
