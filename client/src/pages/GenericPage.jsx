import React from 'react';
import { useLocation } from 'react-router-dom';

const GenericPage = () => {
  const location = useLocation();
  
  // Convert URL path to readable title (e.g. /dashboard/jobs/search -> Job Search)
  const pathParts = location.pathname.split('/').filter(p => p !== 'dashboard');
  const title = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' - ').replace(/-/g, ' ');

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Title Section */}
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight capitalize">{title || 'Page'}</h2>
            <p className="text-gray-400 mt-2">Manage your {title} settings and data here.</p>
        </div>

        {/* Content Placeholder Card */}
        <div className="flex-1 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block p-4 rounded-full bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                    <span className="text-4xl">🚧</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Work in Progress</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    The <strong>{title}</strong> module is currently under development. 
                    This interface demonstrates the navigation structure and theme consistency.
                </p>
                <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                    Create New Entry
                </button>
            </div>
        </div>
    </div>
  );
};

export default GenericPage;