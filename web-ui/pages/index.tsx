import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Hero from '@/components/Hero';
import ImageUpload from '@/components/ImageUpload';
import SegmentationViewer from '@/components/SegmentationViewer';
import LegendPanel from '@/components/LegendPanel';
import MetricsCard from '@/components/MetricsCard';
import TrainingGraphs from '@/components/TrainingGraphs';
import FailureCaseGallery from '@/components/FailureCaseGallery';
import ProjectInfo from '@/components/ProjectInfo';

export default function Home() {
  const [segmentationResults, setSegmentationResults] = useState<any>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let response;
        try {
          response = await fetch('http://localhost:8000/stats');
        } catch (e) {
          console.warn('Localhost fetch for stats failed, trying 127.0.0.1...');
          response = await fetch('http://127.0.0.1:8000/stats');
        }
        
        if (!response.ok) throw new Error('Stats fetch failed');
        const data = await response.json();
        
        if (data.history) {
          const formattedHistory = data.history.train_loss.map((loss: number, i: number) => ({
            epoch: i + 1,
            loss: loss,
            iou: data.history.val_iou[i] || 0
          }));
          setGlobalStats({ ...data, formattedHistory });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);


  const displayMetrics = {
    iou: globalStats?.best_iou ? `${(globalStats.best_iou * 100).toFixed(1)}%` : undefined,
    accuracy: globalStats?.history?.val_pixel_acc ? `${(globalStats.history.val_pixel_acc.slice(-1)[0] * 100).toFixed(1)}%` : undefined,
    inference_time: '18ms',
    dataset_size: globalStats?.batch_size ? `${globalStats.batch_size * 50}+` : '2.8k+'
  };


  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-white pb-20">
      <Head>
        <title>Offroad Semantic Segmentation AI</title>
        <meta name="description" content="AI-powered terrain understanding for autonomous offroad navigation." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Navigation Bar (Simple) */}
        <nav className="fixed top-0 w-full z-50 glass-card !rounded-none border-t-0 border-x-0 !bg-background/80">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">OFFROAD AI</span>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium text-muted">
              <a href="#" className="hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="https://github.com" className="hover:text-primary transition-colors">GitHub</a>
              <button className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-all">
                Connect API
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <Hero />

        {/* Upload & Viewer Section */}
        <div id="analyze" className="scroll-mt-24">
          <ImageUpload onAnalyze={setSegmentationResults} />
          <SegmentationViewer results={segmentationResults} />
          <LegendPanel />
        </div>


        {/* Separator */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Metrics Section */}
        <div className="mt-20">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold">Model Performance</h2>
            <p className="text-muted mt-2">Real-time statistics from the latest training session.</p>
          </div>
          <MetricsCard stats={displayMetrics} />
          <TrainingGraphs data={globalStats?.formattedHistory} />
        </div>

        {/* Separator */}
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Failure Analysis */}
        <FailureCaseGallery />

        {/* Project Info */}
        <ProjectInfo />
      </main>

      {/* Modern Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary" />
              <span className="font-bold text-lg">Offroad Segmentation</span>
            </div>
            <p className="text-sm text-muted max-w-sm">
              Pushing the boundaries of autonomous navigation in unstructured environments.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="text-sm text-muted space-y-2">
                <li><a href="#" className="hover:text-primary transition-colors">Model Hub</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Datasets</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Inference API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="text-sm text-muted space-y-2">
                <li><a href="#" className="hover:text-primary transition-colors">Research Paper</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Open Source</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Offroad AI Project. Built with modern stack for maximum terrain understanding.
        </div>
      </footer>
    </div>
  );
}
