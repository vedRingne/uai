import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Clock, TrendingUp } from 'lucide-react';

interface MetricsCardProps {
  stats?: {
    iou?: string;
    accuracy?: string;
    inference_time?: string;
    dataset_size?: string;
  };
}

const MetricsCard = ({ stats }: MetricsCardProps) => {
  const metrics = [
    { label: 'IoU Score', value: stats?.iou || '84.2%', icon: <Target className="w-6 h-6" />, color: 'text-primary' },
    { label: 'Pixel Accuracy', value: stats?.accuracy || '96.8%', icon: <TrendingUp className="w-6 h-6" />, color: 'text-secondary' },
    { label: 'Inference Time', value: stats?.inference_time || '18ms', icon: <Zap className="w-6 h-6" />, color: 'text-yellow-400' },
    { label: 'Dataset Size', value: stats?.dataset_size || '2.8k+', icon: <Clock className="w-6 h-6" />, color: 'text-blue-400' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 flex items-center gap-5 group cursor-default"
          >
            <div className={`p-4 rounded-2xl bg-slate-800/50 group-hover:scale-110 transition-transform ${metric.color}`}>
              {metric.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default MetricsCard;
