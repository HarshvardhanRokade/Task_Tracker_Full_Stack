import React, { useEffect } from 'react';
import useGameStore from './store/useGameStore';
import { userApi } from './api/gameApi';
import Sidebar from './components/sidebar/Sidebar';
import RewardOverlay from './components/rewards/RewardOverlay';
import ErrorToast from './components/rewards/ErrorToast';
import TasksPage from './pages/TaskPage';
import FocusPage from './pages/FocusPage';

function App() {
  const initializePlayer = useGameStore((state) => state.initializePlayer);
  const userId = useGameStore((state) => state.userId);

  useEffect(() => {
    // Fetch the real data from Spring Boot on mount
    userApi.getProfile(userId)
      .then((res) => {
        initializePlayer(res.data);
      })
      .catch((err) => console.error('Failed to load player data.', err));
  }, [userId, initializePlayer]);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* 1. The Sidebar */}
      <Sidebar />
      
      {/* 2. Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* RENDER THE REAL TASKS PAGE */}
        <FocusPage />
      </main>

      {/* 3. Global Overlays */}
      <RewardOverlay /> 
      <ErrorToast />
    </div>
  );
}

export default App;