# Offroad Scene Semantic Segmentation

This repository contains scripts and a web-based user interface for training, testing, and running inference on an offroad scene semantic segmentation model. The primary model uses a DeepLabV3 architecture and is optimized for CPU inference on desert/offroad environments.

## Environment and Dependency Requirements

The codebase relies on Python 3.10 and a Conda environment for executing deep learning workflows with PyTorch. 

### Prerequisites
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html) or Anaconda installed.
- Node.js (for the Next.js web UI).

### Setup Instructions

1. **Automated Setup (Windows):**
   Navigate to the `ENV_SETUP` directory and run the initialization script:
   ```cmd
   cd ENV_SETUP
   setup_env.bat
   ```
   This will automatically create a Conda environment named `EDU` based on Python 3.10 and install all required core dependencies.
   
2. **Manual Setup:**
   ```bash
   conda create --name EDU python=3.10 -y
   conda activate EDU
   conda install -c pytorch -c nvidia -c conda-forge pytorch torchvision pytorch-cuda=11.8 ultralytics -y
   pip install opencv-contrib-python tqdm fastapi uvicorn
   ```

## Step-by-Step Instructions to Run and Test the Model

### 1. Training
To train the model from scratch, ensure your datasets are available and run:
```bash
python train_segmentation.py
```
This script will produce a trained weights file. By default, the best weights for CPU inference are saved as `deeplabv3_best_cpu.pth`.

### 2. Testing / Validation
To validate a trained segmentation head on validation data and compute metrics such as Mean IoU, Dice Score, and Pixel Accuracy, use the testing script:
```bash
python test_segmentation.py --model_path <path_to_model_weights.pth> --data_dir <path_to_validation_dataset> --output_dir <output_directory>
```
The script will generate side-by-side comparison images of the input, ground truth, and prediction.

### 3. Inference (Prediction on New Images)
To run predictions on a folder filled with new images, run:
```bash
python inference.py --weights deeplabv3_best_cpu.pth --input <path_to_input_images> --output <path_to_output_masks>
```
This generates predictions and saves integer mapping masks (class indices `0-10`) to the output path.

### 4. Colorizing Raw Masks
To convert the raw integer masks into colorized RGB visuals for human interpretation, use:
```bash
python visualize.py --input <path_to_raw_masks> --output <path_to_save_color_masks>
```

### 5. Running the API and Web UI
The project includes a FastAPI backend and a Next.js frontend to interactively upload images and view segmentation masks.

**Start the Backend API:**
```bash
conda activate EDU
python api.py
```
*The API will start at `http://0.0.0.0:8000`*

**Start the Web UI:**
In a new terminal space:
```bash
cd web-ui
npm install
npm run dev
```
*The web interface will be available at `http://localhost:3000`*

## How to Reproduce Final Results
1. Ensure the `deeplabv3_best_cpu.pth` weights file is in the root directory.
2. Run `inference.py` pointing to the `Test photos/` directory:
   ```bash
   python inference.py --weights deeplabv3_best_cpu.pth --input "Test photos" --output inference_masks
   ```
3. Colorize the results using `visualize.py`:
   ```bash
   python visualize.py --input inference_masks --output inference_masks_color
   ```
4. You can compare the obtained masks visually within `inference_masks_color`, or alternately, use the web UI to interactively view metrics like inference confidence and examine color mapping overlay projections. 

## Notes on Expected Outputs and How to Interpret Them

### Mask Classes
The segmentation model relies on an 11-class mapping schema to interpret desert environments. The inference outputs single channel pixel-wise numerical arrays mapping to these respective class IDs.
When processed by `visualize.py` or the `api.py` endpoint, these classes translate to the following color palette:

- `0`: Background (Black)
- `1`: Trees (Forest Green)
- `2`: Lush Bushes (Lime)
- `3`: Dry Grass (Tan)
- `4`: Dry Bushes (Brown)
- `5`: Ground Clutter (Olive)
- `6`: Flowers (Deep Pink)
- `7`: Logs (Saddle Brown)
- `8`: Rocks (Gray)
- `9`: Landscape (Sienna)
- `10`: Sky (Sky Blue)

### Evaluation Metrics
When running `test_segmentation.py`, expect the terminal output to provide a breakdown of the per-class IoU alongside the macro **Mean IoU** (Intersection over Union), showing how accurately the predicted masks align with ground truths. High IoU (e.g. >0.70) usually signifies robust segmentation generalizability.

Outputs for the CLI testing script are categorized into three directories:
- `masks/`: Raw prediction class matrices
- `masks_color/`: Colored prediction arrays mapped using the above standard palette
- `comparisons/`: Intuitive visual overlays comparing input, truth, and inference side-by-side