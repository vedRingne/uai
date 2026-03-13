import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

const cases = [
  {
    original: '/sample1.jpg',
    predicted: '/pred1.jpg',
    note: 'Model confused shadow with a log due to high contrast lighting.',
    severity: 'High'
  },
  {
    original: '/sample2.jpg',
    predicted: '/pred2.jpg',
    note: 'Dry bushes misclassified as dry grass in low resolution patches.',
    severity: 'Medium'
  }
];

const FailureCaseGallery = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
        <h2 className="text-3xl font-bold text-foreground">Edge Cases & Failures</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cases.map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.01 }}
            className="glass-card p-6 border-l-4 border-l-yellow-600"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted uppercase">Original</span>
                <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted uppercase">Prediction</span>
                <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden" />
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{item.note}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FailureCaseGallery;
