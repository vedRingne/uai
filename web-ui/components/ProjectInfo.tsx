import React from 'react';
import { BookOpen, Database, Cpu } from 'lucide-react';

const ProjectInfo = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">What is Semantic Segmentation?</h3>
          <p className="text-muted leading-relaxed">
            Semantic segmentation is a deep learning task that assigns a class label to every pixel in an image. 
            Unlike object detection, it provide a complete and granular understanding of the entire scene.
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">The Offroad Dataset</h3>
          <p className="text-muted leading-relaxed">
            Our specialized dataset contains over 2,800 high-resolution images of various desert and offroad terrains, 
            carefully annotated with 10 distinct environmental classes for robust navigation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Model Architecture</h3>
          <p className="text-muted leading-relaxed">
            We utilize a DeepLabV3+ architecture with a MobileNetV3 backbone, optimized for real-time performance 
            on edge devices and CPUs without compromising on segmentation accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
