import React, { useEffect, useState, useRef } from 'react';
import { 
  LayoutDashboard, Search, Briefcase, UserCircle, 
  BarChart2, Users, LogOut, Activity, Database, CheckCircle, AlertTriangle,
  User, ChevronDown, Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';

// Sidebar Components
import SidebarItem from '../components/Sidebar/SidebarItem';
import SidebarGroup from '../components/Sidebar/SidebarGroup';

// Mock Data
const jobData = [
  { name: 'Tech', value: 50 },
  { name: 'Finance', value: 30 },
  { name: 'Marketing', value: 20 },
  { name: 'HR', value: 10 },
];
const COLORS = ['#3B82F6', '#06B6D4', '#6366F1', '#8B5CF6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'Guest' });
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative bg-gray-900 text-white">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <div 
            className="absolute inset-0 animate-bg-motion"
            style={{
                backgroundImage: 'url("/assets/tech-map.jpg")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        ></div>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      </div>

      {/* --- SIDEBAR (High Z-Index to stay on left) --- */}
      <aside className="relative z-40 w-64 h-full flex flex-col justify-between border-r border-white/10 bg-slate-900/30 backdrop-blur-md transition-all duration-300">
        <div>
            <div className="p-6 flex items-center gap-3 border-b border-white/10 h-20">
                <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30">
                     <img src="/assets/logo.png" alt="Logo" className="h-6 w-auto brightness-200" />
                </div>
                <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Hunt360
                </span>
            </div>

            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4 mt-2">Main</div>
                <SidebarItem icon={<LayoutDashboard size={18} />} text="Dashboard" to="/dashboard" active />
                <SidebarItem icon={<Search size={18} />} text="Job Search" to="/dashboard/jobs" />
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4 mt-6">Analytics</div>
                <SidebarGroup icon={<Briefcase size={18} />} title="HR Hunt">
                    <SidebarItem text="Dashboard" to="/dashboard/hr" />
                    <SidebarItem text="Reports" to="/dashboard/hr/reports" />
                </SidebarGroup>
                <SidebarGroup icon={<UserCircle size={18} />} title="Corporate Hunt">
                     <SidebarItem text="Leads" to="/dashboard/corporate" />
                </SidebarGroup>
            </nav>
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/20">
             <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full rounded-lg transition-all duration-200">
                <LogOut size={18} />
                <span className="font-medium text-sm">Logout</span>
             </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* 
            HEADER FIX: 
            Added 'relative z-30' to ensure Header sits on top of the main content area. 
        */}
        <header className="relative z-30 h-20 px-8 flex justify-between items-center border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-gray-400">Welcome {user.username}</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 group-focus-within:text-blue-400" />
                    <input 
                        type="text" 
                        placeholder="Search queries..." 
                        className="bg-black/30 border border-white/10 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 transition-all"
                    />
                </div>
                
                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 h-10 w-10 md:w-auto md:h-auto rounded-full md:rounded-lg focus:outline-none"
                    >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50 border border-white/20 hover:scale-105 transition-transform">
                            <User size={20} />
                        </div>
                        <ChevronDown size={16} className={`hidden md:block text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* 
                        DROPDOWN FIX: 
                        Added 'z-50' to ensure it floats above everything else.
                    */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-2 border-b border-white/5 mb-2">
                                <p className="text-sm text-white font-semibold truncate">{user.username}</p>
                                <p className="text-xs text-gray-400">User Profile</p>
                            </div>
                            
                            <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-blue-400 transition-colors">
                                <UserCircle size={16} /> Profile
                            </Link>
                            <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-blue-400 transition-colors">
                                <Settings size={16} /> Settings
                            </Link>
                            
                            <div className="border-t border-white/5 mt-2 pt-2">
                                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* 
            CONTENT FIX: 
            Added 'relative z-10' (Lower than header) so it stays behind the dropdown.
        */}
        <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
            
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
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                />
                                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]}>
                                    {jobData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-6">Web Summary</h3>
                        <div className="space-y-6">
                            <ProgressBar label="Fetchek" value="28.2K" percent={70} color="bg-blue-500" />
                            <ProgressBar label="Pages Parsed" value="22MB" percent={45} color="bg-cyan-500" />
                            <ProgressBar label="Data Collected" value="120MB" percent={85} color="bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components remain the same...
const GlassCard = ({ icon, title, value, trend, color }) => {
    const colorMap = {
        blue: 'text-blue-400 bg-blue-500/10',
        cyan: 'text-cyan-400 bg-cyan-500/10',
        green: 'text-emerald-400 bg-emerald-500/10',
        red: 'text-rose-400 bg-rose-500/10',
    };
    return (
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg hover:bg-slate-800/60 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
            <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
        </div>
    );
};

const ProgressBar = ({ label, value, percent, color }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">{label}</span>
            <span className="text-gray-400">{value}</span>
        </div>
        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default Dashboard;