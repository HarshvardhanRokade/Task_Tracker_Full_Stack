import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import PlayerCard from './PlayerCard'; 
import { authApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';

const navItems = [
  { name: 'Active Quests', path: '/tasks', icon: '📋' },
  { name: 'Focus Timer', path: '/focus', icon: '⚡' },
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Leaderboard',   path: '/leaderboard', icon: '🏆' },
  { name: 'Tavern', path: '/store', icon: '💎' },
];

const SidebarContent = ({ onClose }) => {
  const navigate = useNavigate();
  const clearAuth = useGameStore(state => state.clearAuth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout regardless
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col h-full p-6"
         style={{ backgroundColor: 'var(--surface-base)' }}>
         
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-xl font-black"
                style={{ color: 'var(--text-primary)' }}>
            Workspace
          </span>
        </div>
        
        {/* ✨ Close button - always visible inside the drawer */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
      </div>

      <div className="mb-8">
        <PlayerCard />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
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
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                   font-bold text-sm transition-colors hover:bg-white/5 mt-4"
        style={{ color: 'var(--danger-red)' }}>
        <span>🚪</span>
        <span>Sign Out</span>
      </button>
    </div>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ✨ Hamburger Button - Now visible on ALL screens, with z-[999] */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-[999] p-2 rounded-xl shadow-lg transition-transform active:scale-95"
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
        }}>
        <Menu size={24} />
      </button>

      {/* ✨ Universal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* ✨ Backdrop with z-[998] to cover the dashboard but sit under the drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
            />

            {/* ✨ Drawer with z-[999] to float above absolutely everything */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-[999] shadow-2xl flex flex-col overflow-hidden"
              style={{
                borderRight: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-base)'
              }}>
              <SidebarContent onClose={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;