import React from 'react';

const classes = [
  { name: 'Trees', color: '#228B22' },
  { name: 'Lush Bushes', color: '#00FF00' },
  { name: 'Dry Grass', color: '#D2B48C' },
  { name: 'Dry Bushes', color: '#8B5A2B' },
  { name: 'Ground Clutter', color: '#808000' },
  { name: 'Flowers', color: '#FF1493' },
  { name: 'Logs', color: '#8B4513' },
  { name: 'Rocks', color: '#808080' },
  { name: 'Landscape', color: '#A0522D' },
  { name: 'Sky', color: '#87CEEB' },
  { name: 'Background', color: '#000000' },
];


const LegendPanel = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="glass-card p-6 bg-card/30">
        <h3 className="text-lg font-bold mb-6 text-foreground uppercase tracking-widest">Environment Classes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {classes.map((cls, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div 
                className="w-4 h-4 rounded-full shadow-inner" 
                style={{ backgroundColor: cls.color }}
              />
              <span className="text-sm font-medium text-slate-300">{cls.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegendPanel;
