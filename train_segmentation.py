"""
Segmentation Training Script - CPU OPTIMIZED
Uses DeepLabV3 with MobileNetV3-Large backbone for speed.
"""

import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
from torch import nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
import torch.optim as optim
import torchvision.transforms as transforms
from torchvision.transforms import InterpolationMode
from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large, DeepLabV3_MobileNet_V3_Large_Weights
from PIL import Image
import cv2
import os
from tqdm import tqdm

# Set matplotlib to non-interactive backend
plt.switch_backend('Agg')

# ============================================================================
# Mask Conversion & Mapping
# ============================================================================

value_map = {
    0: 0, 100: 1, 200: 2, 300: 3, 500: 4, 
    550: 5, 600: 6, 700: 7, 800: 8, 7100: 9, 10000: 10
}
# Total 11 classes (0 to 10)
n_classes = len(value_map)


mask_lut = np.zeros(10001, dtype=np.uint8)
for raw_value, mapped_id in value_map.items():
    mask_lut[raw_value] = mapped_id

def convert_mask(mask):
    arr = np.array(mask)
    arr = np.clip(arr, 0, 10000)
    return mask_lut[arr]

# ============================================================================
# Dataset
# ============================================================================

class MaskDataset(Dataset):
    def __init__(self, data_dir, transform=None, mask_transform=None):
        self.image_dir = os.path.join(data_dir, 'Color_Images')
        self.masks_dir = os.path.join(data_dir, 'Segmentation')
        self.transform = transform
        self.mask_transform = mask_transform
        
        if not os.path.exists(self.image_dir):
            raise FileNotFoundError(f"Image directory not found: {self.image_dir}")
            
        self.data_ids = sorted([f for f in os.listdir(self.image_dir) if f.lower().endswith('.png')])

    def __len__(self):
        return len(self.data_ids)

    def __getitem__(self, idx):
        data_id = self.data_ids[idx]
        img_path = os.path.join(self.image_dir, data_id)
        mask_path = os.path.join(self.masks_dir, data_id)

        image = Image.open(img_path).convert("RGB")
        mask = Image.fromarray(convert_mask(Image.open(mask_path)))

        if self.transform: image = self.transform(image)
        if self.mask_transform:
            mask = self.mask_transform(mask)
            if isinstance(mask, torch.Tensor):
                if mask.ndimension() == 3: mask = mask.squeeze(0)
                mask = mask.long()
        return image, mask

# ============================================================================
# Metrics
# ============================================================================

def compute_metrics(pred, target, num_classes=10):
    pred_classes = torch.argmax(pred, dim=1)
    pixel_acc = (pred_classes == target).float().mean().item()
    pred_flat, target_flat = pred_classes.view(-1), target.view(-1)
    
    iou_per_class = []
    for class_id in range(num_classes):
        p, t = pred_flat == class_id, target_flat == class_id
        intersection = (p & t).sum().float().item()
        union = (p | t).sum().float().item()
        iou_per_class.append(intersection / union if union > 0 else float('nan'))
    return np.nanmean(iou_per_class), pixel_acc

def evaluate_model(model, data_loader, device):
    model.eval()
    iou_scores, pixel_accs = [], []
    with torch.no_grad():
        for imgs, labels in tqdm(data_loader, desc="Evaluating", leave=False):
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)['out']
            iou, acc = compute_metrics(outputs, labels, num_classes=n_classes)
            iou_scores.append(iou); pixel_accs.append(acc)
    return np.nanmean(iou_scores), np.mean(pixel_accs)

# ============================================================================
# Main Training Function
# ============================================================================

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device} (Optimized for CPU)")

    # FAST CPU CONFIG
    batch_size = 4
    h, w = 384, 384 # Increased for Sky/Distance detail
    lr = 2e-4
    n_epochs = 20


    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, 'train_stats')
    os.makedirs(output_dir, exist_ok=True)

    img_transform = transforms.Compose([
        transforms.Resize((h, w)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomApply([
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1)
        ], p=0.8),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])


    mask_transform = transforms.Compose([
        transforms.Resize((h, w), interpolation=InterpolationMode.NEAREST),
        transforms.Lambda(lambda x: torch.from_numpy(np.array(x)).long())
    ])

    base_data_path = os.path.join(script_dir, 'Offroad_Segmentation_Training_Dataset')
    trainset = MaskDataset(os.path.join(base_data_path, 'train'), transform=img_transform, mask_transform=mask_transform)
    valset = MaskDataset(os.path.join(base_data_path, 'val'), transform=img_transform, mask_transform=mask_transform)

    train_loader = DataLoader(trainset, batch_size=batch_size, shuffle=True, drop_last=True)
    val_loader = DataLoader(valset, batch_size=batch_size, shuffle=False)

    print(f"Dataset: {len(trainset)} train images. Target: {h}x{w} res.")

    # Load MobileNetV3 DeepLab
    print("Initializing DeepLabV3 with MobileNetV3-Large backbone...")
    model = deeplabv3_mobilenet_v3_large(weights=DeepLabV3_MobileNet_V3_Large_Weights.DEFAULT)
    
    # Custom head - MobileNetV3-Large uses 256 internal channels here
    model.classifier[4] = nn.Conv2d(256, n_classes, kernel_size=(1, 1))
    
    # Explicitly disable aux head to avoid issues on CPU
    model.aux_classifier = None
    
    model = model.to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # Use class weights to handle imbalance (Sky and Landscape are huge, Flowers and Rocks are small)
    # Background, Trees, LushB, DryG, DryB, Ground, Flowers, Logs, Rocks, Land, Sky
    weights = torch.tensor([1.0, 1.2, 1.2, 1.0, 1.5, 1.2, 2.0, 1.5, 1.5, 0.8, 1.0]).to(device)
    criterion = nn.CrossEntropyLoss(weight=weights)


    history = {'train_loss': [], 'val_loss': [], 'val_iou': [], 'val_pixel_acc': []}
    best_iou = 0.0

    print("\nStarting Fast Training...")
    for epoch in range(n_epochs):
        model.train()
        train_losses = []
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{n_epochs}")
        for imgs, labels in pbar:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            # Predict
            outputs = model(imgs)
            logits = outputs['out']
            
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            
            train_losses.append(loss.item())
            pbar.set_postfix(loss=f"{loss.item():.4f}")

        # Eval
        val_iou, val_acc = evaluate_model(model, val_loader, device)
        avg_train_loss = np.mean(train_losses)
        history['train_loss'].append(avg_train_loss)
        history['val_iou'].append(val_iou)
        history['val_pixel_acc'].append(val_acc)

        print(f" -> Epoch {epoch+1}: Loss {avg_train_loss:.4f} | Val IoU {val_iou:.4f} | Acc {val_acc:.4f}")

        if val_iou > best_iou:
            best_iou = val_iou
            torch.save(model.state_dict(), os.path.join(script_dir, "deeplabv3_best_cpu.pth"))

    torch.save(model.state_dict(), os.path.join(script_dir, "deeplabv3_final_cpu.pth"))
    
    # Save training history
    import json
    history_path = os.path.join(output_dir, 'history.json')
    with open(history_path, 'w') as f:
        json.dump({
            'history': history,
            'best_iou': best_iou,
            'epochs': n_epochs,
            'batch_size': batch_size
        }, f, indent=4)

    print(f"\nTraining Complete. Best IoU: {best_iou:.4f}")
    print(f"Stats saved to {history_path}")


if __name__ == "__main__":
    main()
