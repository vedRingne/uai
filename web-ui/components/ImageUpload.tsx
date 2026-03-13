import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  onAnalyze: (results: any) => void;
}

const ImageUpload = ({ onAnalyze }: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      onAnalyze(null);
    }
  }, [onAnalyze]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
      onAnalyze(null);
    }
    e.target.value = '';
  };

  const handleRunSegmentation = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      let response;
      try {
        const formData1 = new FormData();
        formData1.append('file', selectedFile);
        response = await fetch('http://localhost:8000/segment', {
          method: 'POST',
          body: formData1,
        });
      } catch (e) {
        console.warn('Localhost fetch failed, trying 127.0.0.1...');
        const formData2 = new FormData();
        formData2.append('file', selectedFile);
        response = await fetch('http://127.0.0.1:8000/segment', {
          method: 'POST',
          body: formData2,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Segmentation failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      onAnalyze(data);
      
      // Scroll to viewer
      document.getElementById('segmentation-viewer')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Failed to run segmentation. ${error.message || 'Make sure the API is running at http://localhost:8000'}`);
    } finally {

      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <div className="glass-card p-8 bg-card/40">
        <h2 className="text-2xl font-bold font-primary mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Analyze Environment
        </h2>
        
        {!selectedImage ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'}
            `}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">Click or drag image to upload</p>
                <p className="text-sm text-muted">Supports PNG, JPG, JPEG (Max 10MB)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-video bg-background border border-border"
            >
              <img 
                src={selectedImage} 
                alt="Upload preview" 
                className="w-full h-full object-contain"
              />
              <button 
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                  onAnalyze(null);
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleRunSegmentation}
                disabled={isLoading}
                className={`flex items-center gap-2 px-8 py-3 bg-secondary text-white rounded-full font-semibold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                {isLoading ? 'Processing...' : 'Run Segmentation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ImageUpload;
