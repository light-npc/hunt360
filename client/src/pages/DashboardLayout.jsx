import React, { useEffect, useState, useRef } from 'react';
import { 
  LayoutDashboard, Search, Briefcase, UserCircle, 
  BarChart2, Users, LogOut, FileText, Mail, Settings, 
  Upload, PieChart, GraduationCap, Edit, Trash2, Send, History, 
  User, ChevronDown
} from 'lucide-react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

// Sidebar Components
import SidebarItem from '../components/Sidebar/SidebarItem';
import SidebarGroup from '../components/Sidebar/SidebarGroup';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ username: 'Guest' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

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

  // Helper to determine active state for groups
  const isActive = (path) => location.pathname.includes(path);

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

      {/* --- SIDEBAR --- */}
      <aside className="relative z-40 w-72 h-full flex flex-col justify-between border-r border-white/10 bg-slate-900/30 backdrop-blur-md transition-all duration-300">
        <div>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 border-b border-white/10 h-20">
                <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30">
                     <img src="/assets/logo.png" alt="Logo" className="h-6 w-auto brightness-200" />
                </div>
                <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Hunt360
                </span>
            </div>

            {/* Navigation Menus */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
                
                {/* Dashboard Main */}
                <SidebarItem icon={<LayoutDashboard size={18} />} text="Dashboard" to="/dashboard" end />

                {/* Job Search */}
                <SidebarGroup icon={<Search size={18} />} title="Job Search">
                    <SidebarItem text="Search Jobs" to="/dashboard/jobs/search" />
                    <SidebarItem text="Saved Jobs" to="/dashboard/jobs/saved" />
                </SidebarGroup>

                {/* HR Hunt */}
                <SidebarGroup icon={<Briefcase size={18} />} title="HR Hunt">
                    <SidebarItem text="Dashboard" to="/dashboard/hr/overview" />
                    <SidebarItem text="About Us" to="/about" />
                    <SidebarItem text="Admin Dashboard" to="/dashboard/hr/admin" />
                    <SidebarItem text="Profile Details" to="/dashboard/hr/profile-details" />
                    <SidebarItem text="Landing Page" to="/" />
                    <SidebarItem text="Profile Page" to="/dashboard/hr/profile-page" />
                    <SidebarItem text="Profile Settings" to="/dashboard/hr/settings" />
                    <SidebarItem text="Saved Professionals" to="/dashboard/hr/saved" />
                </SidebarGroup>

                {/* Corporate Hunt */}
                <SidebarGroup icon={<UserCircle size={18} />} title="Corporate Hunt">
                    <SidebarItem text="Dashboard" to="/dashboard/corporate/overview" />
                    <SidebarItem icon={<Trash2 size={16}/>} text="Bulk Data Cleaning" to="/dashboard/corporate/cleaning" />
                    <SidebarItem icon={<Edit size={16}/>} text="Single Data Edit" to="/dashboard/corporate/edit" />
                    <SidebarItem text="Marketing Data" to="/dashboard/corporate/marketing" />
                    <SidebarItem icon={<PieChart size={16}/>} text="Reports" to="/dashboard/corporate/reports" />
                </SidebarGroup>

                {/* Senior Management */}
                <SidebarGroup icon={<BarChart2 size={18} />} title="Senior Management">
                    <SidebarItem text="Dashboard" to="/dashboard/senior/overview" />
                    <SidebarItem text="Report" to="/dashboard/senior/report" />
                    <SidebarItem text="Single Data Edit" to="/dashboard/senior/edit" />
                    <SidebarItem text="Final Report" to="/dashboard/senior/final-report" />
                    <SidebarItem text="Bulk Data" to="/dashboard/senior/bulk" />
                </SidebarGroup>

                {/* Campus */}
                <SidebarGroup icon={<GraduationCap size={18} />} title="Campus">
                    <SidebarItem text="Dashboard" to="/dashboard/campus/overview" />
                    <SidebarItem text="Bulk Editing" to="/dashboard/campus/bulk" />
                    <SidebarItem text="Single Editing" to="/dashboard/campus/single" />
                    <SidebarItem text="Marketing Data" to="/dashboard/campus/marketing" />
                    <SidebarItem text="HR Data" to="/dashboard/campus/hr-data" />
                    <SidebarItem text="Reports" to="/dashboard/campus/reports" />
                </SidebarGroup>

                {/* Resume Hunt */}
                <SidebarGroup icon={<FileText size={18} />} title="Resume Hunt">
                    <SidebarItem icon={<Upload size={16}/>} text="Upload Resume" to="/dashboard/resume/upload" />
                    <SidebarItem icon={<Search size={16}/>} text="Search Resume" to="/dashboard/resume/search" />
                </SidebarGroup>

                {/* Email Service */}
                <SidebarGroup icon={<Mail size={18} />} title="Email Service">
                    <SidebarItem icon={<History size={16}/>} text="Email History" to="/dashboard/email/history" />
                    <SidebarItem icon={<Send size={16}/>} text="Send Emails" to="/dashboard/email/send" />
                    <SidebarItem text="Email Status" to="/dashboard/email/status" />
                    <SidebarItem icon={<Users size={16}/>} text="Users List" to="/dashboard/email/users" />
                </SidebarGroup>

                {/* Settings */}
                <SidebarItem icon={<Settings size={18} />} text="Settings" to="/dashboard/settings" />

            </nav>
        </div>
        
        {/* Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20">
             <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full rounded-lg transition-all duration-200">
                <LogOut size={18} />
                <span className="font-medium text-sm">Logout</span>
             </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="relative z-30 h-20 px-8 flex justify-between items-center border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome {user.username}</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 group-focus-within:text-blue-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-black/30 border border-white/10 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200 transition-all"
                    />
                </div>
                
                {/* UPDATED PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 focus:outline-none"
                    >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50 border border-white/20 hover:scale-105 transition-transform">
                            <User size={20} />
                        </div>
                        <ChevronDown size={16} className={`hidden md:block text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                                <p className="text-sm text-white font-bold truncate">{user.username}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Admin User</p>
                            </div>
                            
                            <div className="py-2">
                                <Link to="/dashboard/hr/profile-page" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                                    <UserCircle size={16} /> Profile
                                </Link>
                                <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Settings size={16} /> Settings
                                </Link>
                            </div>

                            <div className="border-t border-white/10 mt-1 pt-1">
                                <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Content Outlet (Where sub-pages render) */}
        <main className="relative z-10 flex-1 overflow-y-auto p-8 custom-scrollbar">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;