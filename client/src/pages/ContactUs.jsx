import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Globe, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ContactUs = () => {
  const location = useLocation();
  
  // Contact page always slides in "Forward" (from right) unless specifically told otherwise, 
  // but usually it's the destination.
  // If we came from About, we entered from right.
  const animationClass = location.state?.transition === 'slide-back' 
    ? 'page-slide-back' // Theoretically if we went "back" to contact, but mostly we come forward to here
    : 'page-slide-forward'; 

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden bg-gray-900 text-gray-200 ${animationClass}`}>
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animate-bg-motion" style={{ backgroundImage: 'url("/assets/tech-map.jpg")', backgroundSize: 'cover' }}></div>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      </div>

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
              {/* BACK LINK: Sends 'slide-back' state to About Us page */}
              <Link 
                to="/about" 
                state={{ transition: 'slide-back' }}
                className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition uppercase tracking-wider"
              >
                <ArrowLeft size={16} /> Back to About
              </Link>
            </div>
        </nav>

        {/* ... (Rest of content remains exactly the same as previous ContactUs code) ... */}
        {/* Just ensure Footer link also has the state */}

        <div className="px-6 py-10 text-center relative">
          <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-2">We'd love to hear from you</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg mb-4">GET IN TOUCH</h1>
          <p className="text-gray-300 text-lg italic font-light">"Connecting people with opportunities they love."</p>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-6 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Contact Information</h3>
                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-900/50"><MapPin size={24} /></div>
                        <div><h4 className="text-white font-bold text-lg">Head Office</h4><p className="text-gray-400 leading-relaxed mt-1">708 & 709, Bhaveshwar Arcade Annex, LBS Marg,<br/>Opp Shreyas Cinema, Ghatkopar West,<br/>Mumbai – 400086</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-900/50"><Phone size={24} /></div>
                            <div><h4 className="text-white font-bold">Phone</h4><a href="tel:+912242975100" className="text-gray-400 hover:text-blue-400 transition">+91 22 4297 5100</a></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-900/50"><Mail size={24} /></div>
                            <div><h4 className="text-white font-bold">Email</h4><a href="mailto:contact@talentcorner.in" className="text-gray-400 hover:text-blue-400 transition">contact@talentcorner.in</a></div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-yellow-600 rounded-lg text-white shadow-lg shadow-yellow-900/50"><Clock size={24} /></div>
                        <div><h4 className="text-white font-bold">Working Hours</h4><p className="text-gray-400 mt-1">Mon – Fri: 9.30 a.m. to 7 p.m.</p></div>
                    </div>
                </div>
            </div>
            {/* Right Column */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col">
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4"><Globe size={24} className="text-cyan-400" /><h3 className="text-2xl font-bold text-white">Our Presence</h3></div>
                <p className="text-gray-400 mb-8">We have established our footprint across major cities to serve you better.</p>
                <div className="grid grid-cols-3 gap-3">
                    {["Mumbai", "Pune", "Bengaluru", "Coimbatore", "Rajkot", "Delhi", "Ahmedabad", "Jammu", "Vizag", "Jharkhand", "Aurangabad", "Kanpur"].map((city) => (
                        <div key={city} className="py-3 px-2 bg-white/5 border border-white/10 rounded-lg text-center text-gray-300 text-sm hover:bg-white/10 hover:border-blue-500/50 transition cursor-default">{city}</div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
            <div className="flex gap-8 text-sm md:text-base text-gray-400">
               {/* Footer Link to About also sends 'slide-back' state */}
               <Link to="/about" state={{ transition: 'slide-back' }} className="hover:text-blue-400 transition-colors">About Us</Link>
               <Link to="/contact" className="text-white font-medium border-b border-blue-500 pb-1">Contact</Link>
            </div>
            <div className="text-gray-500 text-sm">© 2025 HR Hunt Inc. All rights reserved.</div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default ContactUs;