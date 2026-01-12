import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-gray-900">
      
      {/* --- BACKGROUND LAYER (The Motion Image) --- */}
      <div className="absolute inset-0 z-0">
        <div 
            className="absolute inset-0 animate-bg-motion"
            style={{
                // Ensure this file exists in client/public/assets/
                backgroundImage: 'url("/assets/tech-map.jpg")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        ></div>
        {/* Dark Overlay: Makes text readable */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col h-screen">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-6 border-b border-white/5">
            <div className="flex items-center gap-3">
               <div className="bg-white/90 p-1 rounded-md">
                 <img src="/assets/logo.png" alt="Hunt360" className="h-8" />
               </div>
               <span className="text-2xl font-bold text-white tracking-wide">Hunt360</span>
            </div>
            
            {/* UPDATED: Link to the About Us Page */}
            <div className="flex items-center">
              <Link 
                to="/about" 
                className="bg-blue-600/20 border border-blue-500 text-blue-400 px-6 py-2 rounded-full font-bold hover:bg-blue-600 hover:text-white transition uppercase tracking-wider text-sm"
              >
                About
              </Link>
            </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-4xl flex flex-col items-center">
                
                {/* Badge */}
                <span className="inline-block py-1 px-4 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                    Next Gen Recruitment
                </span>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
                    Global Talent. <br/> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                        Local Insights.
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                    Hunt360 aggregates real-time data from online communities worldwide to empower your hiring decisions.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    {/* Signup Button */}
                    <Link to="/auth" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-500 transition transform hover:scale-105 shadow-lg shadow-blue-900/50 border border-blue-500 text-center min-w-[160px]">
                        Signup
                    </Link>
                    
                    {/* Login Button */}
                    <Link to="/auth" className="backdrop-blur-sm bg-white/5 border border-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition transform hover:scale-105 text-center min-w-[160px]">
                        Login
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;