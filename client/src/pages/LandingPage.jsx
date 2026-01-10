import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
            {/* Make sure logo.png is in public/assets */}
           <img src="/assets/logo.png" alt="Hunt360" className="h-10" />
           <span className="text-2xl font-bold text-gray-800">Hunt360</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
          <a href="#" className="hover:text-huntPurple">HOME</a>
          <a href="#" className="hover:text-huntPurple">FEATURES</a>
          <a href="#" className="hover:text-huntPurple">ABOUT</a>
          <Link to="/auth" className="hover:text-huntPurple">LOGIN</Link>
          <Link to="/auth" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">SIGN UP</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="flex-1 flex flex-col items-center justify-center text-center relative"
        style={{
            backgroundImage: 'url("/assets/world-map.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay to ensure text readability if map is too dark/light */}
        <div className="absolute inset-0 bg-white/70"></div>

        <div className="relative z-10 max-w-4xl px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Empower Your Insights with <br/> <span className="text-gray-900">Hunt360</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                The leading platform for real-time data aggregation, advanced analytics, and actionable insights from online communities.
            </p>
            <div className="flex gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 transition">
                    Explore Features
                </button>
                <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded font-medium hover:bg-blue-50 transition">
                    Get in Touch
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;