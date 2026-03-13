import cv2
import numpy as np
import os
import argparse
from pathlib import Path

# Mapping from class IDs (0-9) to colors (RGB)
# These should match the standard colors used in the project
color_palette = np.array([
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

def colorize_mask(mask):
    """Convert a single-channel mask (0-9) to a 3-channel BGR image."""
    h, w = mask.shape
    color_mask = np.zeros((h, w, 3), dtype=np.uint8)
    for i in range(len(color_palette)):
        color_mask[mask == i] = color_palette[i]
    # Convert RGB (palette) to BGR (OpenCV)
    return cv2.cvtColor(color_mask, cv2.COLOR_RGB2BGR)

def main():
    parser = argparse.ArgumentParser(description="Colorize segmentation masks.")
    parser.add_argument("--input", type=str, required=True, help="Folder containing mask images")
    parser.add_argument("--output", type=str, default=None, help="Output folder for colorized images")
    args = parser.parse_args()

    input_folder = args.input
    output_folder = args.output if args.output else os.path.join(input_folder, "colorized")

    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)

    # Get all image files in the folder
    image_extensions = ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.bmp']
    image_files = [f for f in Path(input_folder).iterdir() 
                   if f.is_file() and f.suffix.lower() in image_extensions]

    print(f"Found {len(image_files)} image files in {input_folder}")

    # Process each file
    for image_file in sorted(image_files):
        # Read the image as-is (grayscale for masks)
        im = cv2.imread(str(image_file), cv2.IMREAD_UNCHANGED)
        
        if im is None:
            print(f"  Skipped: Could not read {image_file.name}")
            continue
        
        # Colorize
        colorized = colorize_mask(im)
        
        # Save the colorized image
        output_path = os.path.join(output_folder, f"{image_file.stem}_colorized.png")
        cv2.imwrite(output_path, colorized)
        print(f"  Saved: {output_path}")

    print(f"\nProcessing complete! Colorized images saved to: {output_folder}")

if __name__ == "__main__":
    main()