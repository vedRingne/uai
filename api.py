from fastapi import FastAPI, UploadFile, File
import os

from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large
from PIL import Image
import numpy as np
import io
import base64
import cv2

app = FastAPI()

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
WEIGHTS_PATH = "deeplabv3_best_cpu.pth"
IMG_SIZE = 384
N_CLASSES = 11

# Color palette for visualization
COLOR_PALETTE = np.array([
    [0, 0, 0],        # 0: Background - black
    [34, 139, 34],    # 1: Trees - forest green
    [0, 255, 0],      # 2: Lush Bushes - lime
    [210, 180, 140],  # 3: Dry Grass - tan
    [139, 90, 43],    # 4: Dry Bushes - brown
    [128, 128, 0],    # 5: Ground Clutter - olive
    [255, 20, 147],   # 6: Flowers - deep pink
    [139, 69, 19],    # 7: Logs - saddle brown
    [128, 128, 128],  # 8: Rocks - gray
    [160, 82, 45],    # 9: Landscape - sienna
    [135, 206, 235],  # 10: Sky - sky blue
], dtype=np.uint8)


# Global model variable
model = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_model():
    global model
    print(f"Loading model on {device}...")
    model = deeplabv3_mobilenet_v3_large(weights=None)
    # MobileNetV3 Large DeepLabV3 uses 256 channels in the classifier head
    model.classifier[4] = nn.Conv2d(256, N_CLASSES, kernel_size=(1, 1))
    # Match training: Disable aux head
    model.aux_classifier = None


    
    try:
        model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=device))
        print("Weights loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not load weights from {WEIGHTS_PATH}. Using uninitialized model. Error: {e}")
    
    model.to(device)
    model.eval()

@app.on_event("startup")
async def startup_event():
    load_model()

def colorize_mask(mask):
    h, w = mask.shape
    color_mask = np.zeros((h, w, 3), dtype=np.uint8)
    for i in range(len(COLOR_PALETTE)):
        color_mask[mask == i] = COLOR_PALETTE[i]
    return color_mask

import time
import json

@app.get("/stats")
async def get_stats():
    history_path = "train_stats/history.json"
    if os.path.exists(history_path):
        with open(history_path, 'r') as f:
            return json.load(f)
    return {
        "history": {
            "train_loss": [0.8, 0.6, 0.4, 0.3, 0.2],
            "val_iou": [0.4, 0.55, 0.68, 0.75, 0.82]
        },
        "best_iou": 0.82,
        "is_placeholder": True
    }

@app.post("/segment")
async def segment_image(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    orig_size = image.size
    
    # Preprocess
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    input_tensor = transform(image).unsqueeze(0).to(device)
    
    # Inference
    with torch.no_grad():
        output = model(input_tensor)['out']
        # Calculate confidence
        probs = torch.softmax(output, dim=1)
        max_probs, _ = torch.max(probs, dim=1)
        confidence = max_probs.mean().item()
        
        prediction = torch.argmax(output, dim=1).squeeze(0).cpu().numpy().astype(np.uint8)
    
    # Postprocess mask
    mask_img = Image.fromarray(prediction)
    mask_img = mask_img.resize(orig_size, resample=Image.NEAREST)
    mask_array = np.array(mask_img)
    
    # Colorize mask
    color_mask = colorize_mask(mask_array)
    
    # Create overlay
    orig_np = np.array(image)
    overlay = cv2.addWeighted(orig_np, 0.6, color_mask, 0.4, 0)
    
    # Convert to base64
    def to_base64(img_np):
        pil_img = Image.fromarray(img_np)
        buffered = io.BytesIO()
        pil_img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    inference_time = (time.time() - start_time) * 1000 # ms

    return {
        "mask": f"data:image/png;base64,{to_base64(color_mask)}",
        "overlay": f"data:image/png;base64,{to_base64(overlay)}",
        "original": f"data:image/png;base64,{base64.b64encode(contents).decode()}",
        "stats": {
            "inference_time": f"{inference_time:.1f}ms",
            "confidence": f"{confidence * 100:.1f}%"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
