import React from 'react';
import { CheckSquare, ShieldCheck, BarChart3, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AboutUs = () => {
  const location = useLocation();
  
  // Check if we passed a 'transition' state from the Contact page
  // If 'slide-back' is present, use left animation. Otherwise, default to right.
  const animationClass = location.state?.transition === 'slide-back' 
    ? 'page-slide-back' 
    : 'page-slide-forward';

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden bg-gray-900 text-gray-200 ${animationClass}`}>
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animate-bg-motion" style={{ backgroundImage: 'url("/assets/tech-map.jpg")', backgroundSize: 'cover' }}></div>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10 bg-slate-900/30 backdrop-blur-md">
            <div className="flex items-center gap-3">
               <div className="bg-white/10 p-1 rounded-md border border-white/10">
                 <img src="/assets/logo.png" alt="Hunt360" className="h-8 brightness-150" />
               </div>
               <Link to="/" className="text-2xl font-bold text-white tracking-wide hover:text-blue-400 transition">
                  Hunt360
               </Link>
            </div>
            <div className="flex items-center">
              <Link to="/" className="text-sm font-semibold text-gray-300 hover:text-white transition uppercase tracking-wider">
                Back to Home
              </Link>
            </div>
        </nav>

        {/* Header */}
        <div className="px-6 py-16 md:py-20 relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <p className="text-blue-400 text-sm md:text-base mb-2 font-medium tracking-wider uppercase">
                Building smarter solutions for a connected world
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
                ABOUT US
              </h1>
            </div>
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/20 animate-pulse-slow p-6">
                <img src="/assets/logo.png" alt="Logo" className="w-full h-auto object-contain drop-shadow-xl" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 max-w-6xl mx-auto px-6 pb-16 space-y-12">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-xl">
             <section className="mb-10">
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                Hunt360 is an intelligent recruitment workforce optimization platform designed to simplify hiring, 
                enhance decision-making, and streamline HR operations. We consolidate talent data, automate repetitive tasks, 
                and provide insights that help organizations hire smarter and grow faster.
              </p>
            </section>
            <section>
              <h2 className="text-blue-400 font-bold text-xl mb-4 uppercase tracking-wide flex items-center gap-2">
                <span className="w-8 h-[2px] bg-blue-500 inline-block"></span> Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                Our mission is to empower HR teams with modern tools that combine automation, security, and 
                data-driven intelligence—giving organizations a competitive edge in talent management.
              </p>
            </section>
          </div>

          <section>
            <h2 className="text-white font-bold text-2xl md:text-3xl mb-10 text-center uppercase tracking-wide">
              Why Choose Hunt360
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassFeatureCard icon={<CheckSquare size={32} />} title="Efficiency" desc="Automate and streamline HR workflows, saving time and reducing manual effort." color="text-yellow-400" bgColor="bg-yellow-500/20" />
              <GlassFeatureCard icon={<ShieldCheck size={32} />} title="Security" desc="Protect sensitive HR data with enterprise-grade protocols and secure infrastructure." color="text-blue-400" bgColor="bg-blue-500/20" />
              <GlassFeatureCard icon={<BarChart3 size={32} />} title="Insights" desc="Gain actionable analytics for smarter hiring and organizational decisions." color="text-purple-400" bgColor="bg-purple-500/20" />
              <GlassFeatureCard icon={<TrendingUp size={32} />} title="Scalability" desc="Designed to grow with your organization—whether you're a startup or enterprise." color="text-emerald-400" bgColor="bg-emerald-500/20" />
            </div>
          </section>

          <section className="text-center py-12">
            <h2 className="text-white font-bold text-2xl md:text-3xl mb-8 uppercase tracking-wide">
              Join Our Journey
            </h2>
            {/* LINK TO CONTACT: Slide Forward */}
            <Link 
              to="/contact" 
              state={{ transition: 'slide-forward' }}
              className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition transform hover:scale-105 border border-white/10"
            >
              Contact Us
            </Link>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
            <div className="flex gap-8 text-sm md:text-base text-gray-400">
               {/* Pricing Button REMOVED */}
               <Link to="/about" className="text-white font-medium border-b border-blue-500 pb-1">About Us</Link>
               <Link to="/contact" state={{ transition: 'slide-forward' }} className="hover:text-blue-400 transition-colors">Contact</Link>
            </div>
            <div className="text-gray-500 text-sm">
              © 2025 HR Hunt Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const GlassFeatureCard = ({ icon, title, desc, color, bgColor }) => (
  <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 group">
    <div className={`p-3 rounded-xl w-fit mb-4 ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { strokeWidth: 2 })}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default AboutUs;