import React from 'react';
import { 
  LayoutDashboard, Search, Briefcase, UserCircle, 
  BarChart2, Users, FileText, Mail, Settings 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock Data for Charts
const jobData = [
  { name: 'Tech', value: 50, fill: '#8884d8' },
  { name: 'Finance', value: 30, fill: '#ffc658' },
  { name: 'Marketing', value: 20, fill: '#00C49F' },
  { name: 'HR', value: 10, fill: '#FF8042' },
];

const hrData = [
    { name: 'Hiring', value: 30 },
    { name: 'Not Hiring', value: 15 },
];
const COLORS = ['#8884d8', '#e5e7eb'];

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-4 flex items-center gap-2 border-b">
           <img src="/assets/logo.png" alt="Logo" className="h-8" />
           <span className="font-bold text-lg">Hunt360</span>
        </div>
        <nav className="p-4 space-y-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active />
            <SidebarItem icon={<Search size={20} />} text="Job Search" />
            <SidebarItem icon={<Briefcase size={20} />} text="HR Hunt" />
            <SidebarItem icon={<UserCircle size={20} />} text="Corporate Hunt" />
            <SidebarItem icon={<BarChart2 size={20} />} text="Senior Management" />
            <SidebarItem icon={<Users size={20} />} text="Campus" />
            <SidebarItem icon={<FileText size={20} />} text="Resume Hunt" />
            <SidebarItem icon={<Mail size={20} />} text="Email Service" />
            <SidebarItem icon={<Settings size={20} />} text="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Hunt360 Dashboard</h1>
            <div className="flex items-center gap-4">
                <input type="text" placeholder="Search..." className="border rounded-lg px-4 py-2" />
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">BD</div>
            </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Briefcase />} title="Total Jobs" value="120" />
            <StatCard icon={<Users />} title="HR Profiles" value="45" />
            <StatCard icon={<UserCircle />} title="Corporate Leads" value="30" />
            <StatCard icon={<Users />} title="Campus Users" value="200" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Job Search Analytics</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity (Acting as right sidebar in content) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    <ActivityItem title="Job Application" desc="Applied to Software Engineer" time="2 hrs ago" />
                    <ActivityItem title="HR Profile" desc="New profile: Jessica Williams" time="4 hrs ago" />
                    <ActivityItem title="Corporate Lead" desc="Added lead: Meta Inc." time="Yesterday" />
                </div>
            </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2 flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-semibold">HR Hunt Profiles</h3>
                    <div className="h-48 w-48 mt-4">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={hrData} dataKey="value" outerRadius={60} fill="#8884d8">
                                    {hrData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="block text-sm text-purple-600 font-bold">Hiring Now (66%)</span>
                    <span className="block text-sm text-gray-400">Not Hiring (34%)</span>
                 </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Quick Settings</h3>
                <p className="text-gray-500 text-sm mb-4">Manage your Hunt360 settings</p>
                <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Go to Settings</button>
            </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const SidebarItem = ({ icon, text, active }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded cursor-pointer ${active ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
        {icon}
        <span className="font-medium text-sm">{text}</span>
    </div>
);

const StatCard = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
        </div>
    </div>
);

const ActivityItem = ({ title, desc, time }) => (
    <div className="border-l-2 border-purple-200 pl-4 py-1">
        <h5 className="font-semibold text-sm">{title}</h5>
        <p className="text-xs text-gray-500">{desc}</p>
        <span className="text-[10px] text-gray-400">{time}</span>
    </div>
);

export default Dashboard;