import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SidebarGroup = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-medium
          ${isOpen ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
        `}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Dropdown Content with left border line */}
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="ml-6 pl-4 border-l border-white/10 mt-1 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarGroup;