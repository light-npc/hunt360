import React from 'react';
import { Database, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const jobData = [
  { name: 'Tech', value: 50 },
  { name: 'Finance', value: 30 },
  { name: 'Marketing', value: 20 },
  { name: 'HR', value: 10 },
];
const COLORS = ['#3B82F6', '#06B6D4', '#6366F1', '#8B5CF6'];

const DashboardOverview = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <GlassCard icon={<Database />} title="Total Queries" value="245" trend="+12%" color="blue" />
            <GlassCard icon={<Activity />} title="New Scrapes" value="36" trend="+5%" color="cyan" />
            <GlassCard icon={<CheckCircle />} title="Success Rate" value="95%" trend="+2%" color="green" />
            <GlassCard icon={<AlertTriangle />} title="Issues" value="3" trend="-1%" color="red" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-100">Data Collection Activity</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]}>
                                {jobData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-100 mb-6">Web Summary</h3>
                <div className="space-y-6">
                    <ProgressBar label="Fetchek" value="28.2K" percent={70} color="bg-blue-500" />
                    <ProgressBar label="Pages Parsed" value="22MB" percent={45} color="bg-cyan-500" />
                    <ProgressBar label="Data Collected" value="120MB" percent={85} color="bg-indigo-500" />
                </div>
            </div>
        </div>
    </div>
  );
};

// Sub-components
const GlassCard = ({ icon, title, value, trend, color }) => {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
        green: 'text-emerald-400 bg-emerald-500/10',
        red: 'text-rose-400 bg-rose-500/10',
    };
    return (
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>{React.cloneElement(icon, { size: 20 })}</div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-300">{trend}</span>
            </div>
            <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold text-white mt-1">{value}</div>
        </div>
    );
};
const ProgressBar = ({ label, value, percent, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">{label}</span>
            <span className="text-gray-400">{value}</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full"><div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div></div>
    </div>
);

export default DashboardOverview;