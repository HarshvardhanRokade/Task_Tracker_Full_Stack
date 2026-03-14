import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useGameStore from './store/useGameStore';
import { userApi } from './api/gameApi';

import Sidebar from './components/sidebar/Sidebar';
import RewardOverlay from './components/rewards/RewardOverlay';
import ErrorToast from './components/rewards/ErrorToast';
import TasksPage from './pages/TaskPage'; // Make sure this matches your exact filename!
import FocusPage from './pages/FocusPage';

// A temporary placeholder so the Dashboard link doesn't crash
const DashboardPlaceholder = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex items-center justify-center h-full text-xl font-bold"
    style={{ color: 'var(--text-secondary)' }}
  >
    Dashboard Stats Coming Soon...
  </motion.div>
);

function App() {
  const initializePlayer = useGameStore((state) => state.initializePlayer);
  const userId = useGameStore((state) => state.userId);
  const location = useLocation(); // Tracks current route for animations

  useEffect(() => {
    // Fetch the real data from Spring Boot on mount
    userApi.getProfile(userId)
      .then((res) => {
        initializePlayer(res.data);
      })
      .catch((err) => console.error('Failed to load player data.', err));
  }, [userId, initializePlayer]);

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* 1. The Static Sidebar */}
      <Sidebar />
      
      {/* 2. Dynamic Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* AnimatePresence handles the exit animations of pages */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Redirect root to tasks */}
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* 3. Global Overlays */}
      <RewardOverlay /> 
      <ErrorToast />
    </div>
  );
}

export default App;