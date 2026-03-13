# Offroad Semantic Segmentation Web UI

This is a modern, aesthetic dashboard for visualizing offroad semantic segmentation AI results.

## Tech Stack
- **Framework**: Next.js (Pages Router)
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Graphs**: Recharts

## Features
- **Hero Section**: Modern introduction with glassmorphism.
- **Image Upload**: Drag & drop image analysis interface.
- **Segmentation Viewer**: Comparison of original, mask, and overlay outputs.
- **Performance Dashboard**: Real-time metrics and training history charts.
- **Failure Analysis**: Gallery of model edge cases.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.

## Getting Started

1.  Navigate to the `web-ui` directory:
    ```bash
    cd web-ui
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization
- **Theme**: Modify `styles/globals.css` to adjust the color palette or glassmorphism effects.
- **Components**: All functional blocks are located in the `components/` directory.
- **Data**: Update `TrainingGraphs.tsx` and `MetricsCard.tsx` with real-world data from your training logs.
