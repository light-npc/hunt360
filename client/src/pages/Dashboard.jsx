import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Search, Briefcase, UserCircle, 
  BarChart2, Users, FileText, Mail, Settings, LogOut 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const jobData = [
  { name: 'Tech', value: 50 },
  { name: 'Finance', value: 30 },
  { name: 'Marketing', value: 20 },
  { name: 'HR', value: 10 },
];
const hrData = [
    { name: 'Hiring', value: 30 },
    { name: 'Not Hiring', value: 15 },
];
const COLORS = ['#8884d8', '#e5e7eb'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'Guest' });
  const [initials, setInitials] = useState('G');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Get initials (First 2 chars of username, uppercase)
        if (parsed.username) {
            setInitials(parsed.username.substring(0, 2).toUpperCase());
        }
    }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col justify-between">
        <div>
            <div className="p-4 flex items-center gap-2 border-b h-16">
                <img src="/assets/logo.png" alt="Logo" className="h-8" />
                <span className="font-bold text-lg text-gray-800">Hunt360</span>
            </div>
            <nav className="p-4 space-y-1">
                <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
                <SidebarItem icon={<Search size={20} />} text="Job Search" />
                <SidebarItem icon={<Briefcase size={20} />} text="HR Hunt" />
                <SidebarItem icon={<UserCircle size={20} />} text="Corporate Hunt" />
                <SidebarItem icon={<BarChart2 size={20} />} text="Senior Management" />
                <SidebarItem icon={<Users size={20} />} text="Campus" />
            </nav>
        </div>
        <div className="p-4">
             <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded transition">
                <LogOut size={20} />
                <span className="font-medium text-sm">Logout</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.username}</h1>
            <div className="flex items-center gap-4">
                <input type="text" placeholder="Search..." className="border rounded-lg px-4 py-2 bg-white hidden sm:block" />
                
                {/* Dynamic Initials Circle */}
                <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:bg-purple-700 transition" title={user.username}>
                    {initials}
                </div>
            </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Briefcase />} title="Total Jobs" value="120" />
            <StatCard icon={<Users />} title="HR Profiles" value="45" />
            <StatCard icon={<UserCircle />} title="Corporate Leads" value="30" />
            <StatCard icon={<Users />} title="Campus Users" value="200" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Job Search Analytics</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{fill: '#f3f4f6'}} />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition text-sm">
                        + Post a New Job
                    </button>
                    <button className="w-full text-left p-3 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition text-sm">
                        + Add HR Contact
                    </button>
                    <button className="w-full text-left p-3 rounded bg-green-50 text-green-700 font-medium hover:bg-green-100 transition text-sm">
                        + Create Campaign
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, text, active }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded cursor-pointer transition ${active ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
        {icon}
        <span className="font-medium text-sm">{text}</span>
    </div>
);

const StatCard = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4 hover:shadow-md transition">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
        </div>
    </div>
);

export default Dashboard;