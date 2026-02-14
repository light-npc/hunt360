import React, { useState } from 'react';
import { Database, Activity, CheckCircle, AlertTriangle, RefreshCw, ServerOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. DATA STATES ---

// State A: No Data (Initial)
const ZERO_DATA = {
    stats: {
        queries: 0,
        scrapes: 0,
        success: '0%',
        issues: 0
    },
    chartData: [], // Empty array = No chart data
    summary: {
        fetchek: 0,
        parsed: 0,
        collected: 0
    }
};

// State B: Populated Data (Simulated Scraper Output)
const SCRAPER_DATA = {
    stats: {
        queries: 245,
        scrapes: 36,
        success: '95%',
        issues: 3
    },
    chartData: [
        { name: 'Tech', value: 50 },
        { name: 'Finance', value: 30 },
        { name: 'Marketing', value: 20 },
        { name: 'HR', value: 10 },
    ],
    summary: {
        fetchek: 70, // Percentages
        parsed: 45,
        collected: 85
    }
};

const COLORS = ['#3B82F6', '#06B6D4', '#6366F1', '#8B5CF6'];

const DashboardOverview = () => {
  // Initialize with ZERO_DATA to show empty state by default
  const [data, setData] = useState(ZERO_DATA);
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to simulate fetching data from scraper
  const handleSyncData = () => {
    setIsSyncing(true);
    
    // Simulate API delay
    setTimeout(() => {
        setData(SCRAPER_DATA); // Update to populated data
        setIsSyncing(false);
    }, 1500);
  };

  const hasData = data.chartData.length > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-white">Real-time Overview</h2>
                <p className="text-sm text-gray-400">
                    {hasData ? "Live metrics from scraper." : "Waiting for scraper input..."}
                </p>
            </div>

            {/* Sync Button to Simulate Data Arrival */}
            <button 
                onClick={handleSyncData}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Syncing..." : "Sync Scraper"}
            </button>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard 
                icon={<Database />} 
                title="Total Queries" 
                value={data.stats.queries} 
                trend={hasData ? "+12%" : "--"} 
                color="blue" 
            />
            <GlassCard 
                icon={<Activity />} 
                title="New Scrapes" 
                value={data.stats.scrapes} 
                trend={hasData ? "+5%" : "--"} 
                color="cyan" 
            />
            <GlassCard 
                icon={<CheckCircle />} 
                title="Success Rate" 
                value={data.stats.success} 
                trend={hasData ? "+2%" : "--"} 
                color="green" 
            />
            <GlassCard 
                icon={<AlertTriangle />} 
                title="Issues" 
                value={data.stats.issues} 
                trend={hasData ? "-1%" : "--"} 
                color="red" 
            />
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* MAIN CHART */}
            <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative min-h-[350px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-100">Data Collection Activity</h3>
                </div>
                
                <div className="h-64 w-full relative">
                    {!hasData ? (
                        // ZERO STATE UI
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700/50 rounded-xl">
                            <ServerOff size={48} className="mb-3 opacity-50" />
                            <p className="font-medium">No Data Collected Yet</p>
                            <p className="text-xs opacity-70">Run the scraper to generate analytics</p>
                        </div>
                    ) : (
                        // POPULATED CHART
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chartData}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                    {data.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* WEB SUMMARY */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl min-h-[350px] flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-gray-100 mb-6 border-b border-white/5 pb-2">Web Summary</h3>
                <div className="space-y-8">
                    <ProgressBar 
                        label="Fetchek" 
                        value={hasData ? "28.2K" : "0"} 
                        percent={data.summary.fetchek} 
                        color="bg-blue-500" 
                    />
                    <ProgressBar 
                        label="Pages Parsed" 
                        value={hasData ? "22MB" : "0 MB"} 
                        percent={data.summary.parsed} 
                        color="bg-cyan-500" 
                    />
                    <ProgressBar 
                        label="Data Collected" 
                        value={hasData ? "120MB" : "0 MB"} 
                        percent={data.summary.collected} 
                        color="bg-indigo-500" 
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const GlassCard = ({ icon, title, value, trend, color }) => {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
        green: 'text-emerald-400 bg-emerald-500/10',
        red: 'text-rose-400 bg-rose-500/10',
    };
    return (
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 hover:bg-slate-800/60">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>{React.cloneElement(icon, { size: 20 })}</div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === '--' ? 'bg-white/5 text-gray-500' : 'bg-white/5 text-gray-300'}`}>
                    {trend}
                </span>
            </div>
            <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
            <div className="mt-1 text-2xl font-bold text-white transition-all duration-500">
                {value}
            </div>
        </div>
    );
};

const ProgressBar = ({ label, value, percent, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">{label}</span>
            <span className="text-gray-400 font-mono transition-all duration-500">{value}</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

export default DashboardOverview;