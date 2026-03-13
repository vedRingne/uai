import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large
from PIL import Image
import numpy as np
import os
import argparse
from tqdm import tqdm

def main():
    parser = argparse.ArgumentParser(description="Run inference with CPU-optimized DeepLabV3 model.")
    parser.add_argument("--weights", type=str, default="deeplabv3_best_cpu.pth", help="Path to model weights (.pth)")
    parser.add_argument("--input", type=str, required=True, help="Directory containing images to segment")
    parser.add_argument("--output", type=str, default="inference_masks", help="Output directory for raw masks")
    parser.add_argument("--img_size", type=int, default=384, help="Resize image to this size")
    args = parser.parse_args()

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Initialize model (matched to CPU-optimized train_segmentation.py)
    n_classes = 11
    model = deeplabv3_mobilenet_v3_large(weights=None)
    model.classifier[4] = nn.Conv2d(256, n_classes, kernel_size=(1, 1))
    model.aux_classifier = None


    # Load weights
    if not os.path.exists(args.weights):
        print(f"Error: Weights file not found at {args.weights}")
        return

    print(f"Loading weights from {args.weights}...")
    model.load_state_dict(torch.load(args.weights, map_location=device))
    model = model.to(device)
    model.eval()

    # Transforms
    transform = transforms.Compose([
        transforms.Resize((args.img_size, args.img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # Check input dir
    if not os.path.exists(args.input):
        print(f"Error: Input directory {args.input} does not exist.")
        return

    os.makedirs(args.output, exist_ok=True)

    image_files = [f for f in os.listdir(args.input) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    print(f"Found {len(image_files)} images to process.")

    with torch.no_grad():
        for filename in tqdm(image_files, desc="Running Inference"):
            img_path = os.path.join(args.input, filename)
            image = Image.open(img_path).convert("RGB")
            orig_size = image.size 
            
            input_tensor = transform(image).unsqueeze(0).to(device)
            output = model(input_tensor)['out']
            prediction = torch.argmax(output, dim=1).squeeze(0).cpu().numpy().astype(np.uint8)
            
            # Resize back to original size
            pred_img = Image.fromarray(prediction)
            pred_img = pred_img.resize(orig_size, resample=Image.NEAREST)
            
            output_path = os.path.join(args.output, f"{os.path.splitext(filename)[0]}_mask.png")
            pred_img.save(output_path)

    print(f"\nInference complete! Raw masks saved to: {args.output}")

if __name__ == "__main__":
    main()
