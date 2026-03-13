import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Layers, Maximize2 } from 'lucide-react';

interface SegmentationViewerProps {
  results: {
    original: string;
    mask: string;
    overlay: string;
    stats?: {
      inference_time: string;
      confidence: string;
    };
  } | null;
}

const SegmentationViewer = ({ results }: SegmentationViewerProps) => {
  const samples = [
    { 
      title: 'Original Image', 
      icon: <ImageIcon className="w-4 h-4" />, 
      src: results?.original || null 
    },
    { 
      title: 'Segmented Mask', 
      icon: <Layers className="w-4 h-4" />, 
      src: results?.mask || null 
    },
    { 
      title: 'Overlay Result', 
      icon: <Maximize2 className="w-4 h-4" />, 
      src: results?.overlay || null 
    },
  ];

  return (
    <div id="segmentation-viewer" className="w-full max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {samples.map((sample, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card overflow-hidden flex flex-col h-full"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
                {sample.icon}
                {sample.title}
              </span>
            </div>
            <div className="flex-1 bg-background flex items-center justify-center min-h-[300px] relative group">
              {sample.src ? (
                <img 
                  src={sample.src} 
                  alt={sample.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center">
                  <span className="text-slate-600 font-medium">No results yet. Run to see AI output.</span>
                </div>
              )}
              {sample.src && (
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => window.open(sample.src!, '_blank')}>
                  <Maximize2 className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {results?.stats && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-8 glass-card py-4"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-muted mb-1">Inference Time</p>
            <p className="text-xl font-bold text-yellow-400">{results.stats.inference_time}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted mb-1">Model Confidence</p>
            <p className="text-xl font-bold text-primary">{results.stats.confidence}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};


export default SegmentationViewer;
