import React from 'react';
import { NavLink } from 'react-router-dom';
import PlayerCard from './PlayerCard'; // ✨ Use the real component
import { authApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
  const navItems = [
    { name: 'Active Quests', path: '/tasks', icon: '📋' },
    { name: 'Focus Timer', path: '/focus', icon: '⚡' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Tavern', path: '/store', icon: '💎' },
  ];

  const navigate = useNavigate()
  const clearAuth = useGameStore(state => state.clearAuth)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Logout anyway even if server call fails
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <aside
      className="w-80 h-screen p-6 flex flex-col border-r"
      style={{
        backgroundColor: 'var(--surface-base)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* 1. Dynamic Player Info */}
      <div className="mb-8">
        <PlayerCard />
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-[var(--surface-raised)] text-[var(--flow-green)] border border-[var(--border-subtle)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-bold">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
               text-sm font-bold transition-colors hover:bg-white/5"
        style={{ color: 'var(--danger-red)' }}>
        <span>🚪</span>
        <span>Sign Out</span>
      </button>
    </aside>
  );
};

export default Sidebar;