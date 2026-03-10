import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiCheckSquare, FiClock, FiPieChart } from 'react-icons/fi';

export default function Sidebar() {
  // NavLink automatically knows which page you are on and applies the active styles!
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      isActive 
      ? 'bg-[#505081] text-white shadow-md' 
      : 'text-[#8686AC] hover:bg-[#272757] hover:text-white'
    }`;

  return (
    <div className="w-64 h-screen bg-[#0F0E47] border-r border-[#272757] flex flex-col fixed left-0 top-0 z-40">
      
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="bg-[#505081] p-1.5 rounded-lg text-xl">🚀</span> Workspace
        </h1>
      </div>

      {/* Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink to="/tasks" className={navLinkClass}>
          <FiCheckSquare size={18} /> Tasks
        </NavLink>
        <NavLink to="/focus" className={navLinkClass}>
          <FiClock size={18} /> Focus
        </NavLink>
        <NavLink to="/dashboard" className={navLinkClass}>
          <FiPieChart size={18} /> Dashboard
        </NavLink>
      </nav>

      {/* Gamification Preview (We will build the logic for this next!) */}
      <div className="p-4 m-4 bg-[#272757] rounded-xl border border-[#505081]">
        <p className="text-[10px] text-[#8686AC] font-bold uppercase tracking-widest mb-1">Level 1</p>
        <p className="text-sm font-medium text-white tracking-tight">Novice Planner</p>
      </div>
    </div>
  );
}