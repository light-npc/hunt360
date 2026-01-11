import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ icon, text, to }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 text-sm font-medium
        ${isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/40' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {icon && <span className="opacity-90">{icon}</span>}
      <span>{text}</span>
    </NavLink>
  );
};

export default SidebarItem;