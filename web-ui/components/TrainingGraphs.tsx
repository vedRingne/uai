import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

interface TrainingGraphsProps {
  data?: Array<{ epoch: number; loss: number; iou: number }>;
}

const TrainingGraphs = ({ data }: TrainingGraphsProps) => {
  // Use provided data or fallback to default mock data
  const chartData = data || [
    { epoch: 1, loss: 0.8, iou: 0.45 },
    { epoch: 2, loss: 0.6, iou: 0.58 },
    { epoch: 3, loss: 0.45, iou: 0.68 },
    { epoch: 4, loss: 0.35, iou: 0.74 },
    { epoch: 5, loss: 0.28, iou: 0.79 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loss Graph */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-xl font-bold mb-8 text-foreground">Training Loss</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="loss" stroke="#6366f1" fillOpacity={1} fill="url(#colorLoss)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* IoU Graph */}
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-xl font-bold mb-8 text-foreground">Validation IoU</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIoU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="iou" stroke="#22c55e" fillOpacity={1} fill="url(#colorIoU)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TrainingGraphs;
