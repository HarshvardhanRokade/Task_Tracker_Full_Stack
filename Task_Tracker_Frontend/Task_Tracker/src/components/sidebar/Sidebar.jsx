import React from 'react';
import PlayerCard from './PlayerCard';

const Sidebar = () => {
  return (
    <div 
      className="w-72 h-screen border-r p-4 flex flex-col"
      style={{ 
        backgroundColor: 'var(--surface-base)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* App Logo / Title Area */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="text-2xl">🚀</span> Workspace
        </h1>
      </div>

      {/* The RPG Character Sheet */}
      <PlayerCard />

      {/* Navigation Placeholders (We will build these later) */}
      <nav className="flex-1 mt-4">
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <li className="p-3 rounded-lg hover:bg-white/5 cursor-pointer">☑ Tasks</li>
          <li className="p-3 rounded-lg hover:bg-white/5 cursor-pointer">⏱ Focus</li>
          <li className="p-3 rounded-lg hover:bg-white/5 cursor-pointer">📊 Dashboard</li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;