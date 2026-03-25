import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import { SkeletonBox } from '../components/ui/Skeleton';
// ✨ NEW: Import the store to read current flow streak and session status
import useGameStore from '../store/useGameStore';

const FocusPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  // Pull variables from the Zustand store
  const { pomodoroFlowStreak, sessionActive } = useGameStore();

  // Artificial delay to match the loading feel of the rest of the app 
  // and prevent harsh layout shifts while the PomodoroTimer mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center mb-10">
          <SkeletonBox width="20rem" height="3rem" className="mb-4 rounded-xl" />
          <SkeletonBox width="28rem" height="1.5rem" className="mb-2 rounded-md" />
          <SkeletonBox width="24rem" height="1.5rem" className="rounded-md" />
        </div>
        
        {/* Timer Engine Skeleton (Matches the circular timer) */}
        <div className="flex justify-center mb-12">
          <SkeletonBox width="300px" height="300px" className="rounded-full" />
        </div>

        {/* Rules Legend Skeleton */}
        <div className="max-w-md mx-auto">
          <SkeletonBox width="100%" height="14rem" className="rounded-xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12"
    >
      {/* Page Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Deep Work Protocol
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Complete consecutive 25-minute sessions to build your Flow Streak. <br/>
          <span style={{ color: 'var(--flow-green)' }}>Every completed session increases your global XP multiplier.</span>
        </p>
      </div>

      {/* The Gamified Timer Engine */}
      <PomodoroTimer />

      {/* ✨ NEW: Empty State / Motivational nudge if they haven't started a session yet */}
      {pomodoroFlowStreak === 0 && !sessionActive && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 rounded-xl text-center text-sm max-w-md mx-auto"
              style={{
                  backgroundColor: 'var(--surface-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
              }}>
              🎯 Complete your first session to start building
              your Flow Streak and earn bonus XP multipliers
          </motion.div>
      )}

      {/* Rules Legend (Perfectly synced with Spring Boot PomodoroServiceImpl) */}
      <div 
        className="mt-12 max-w-md mx-auto text-sm p-5 rounded-xl border" 
        style={{ 
          backgroundColor: 'var(--surface-raised)', 
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)' 
        }}
      >
        <h4 className="font-bold mb-3 text-white">How it works:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Complete a 25m session to earn Base XP + Gems.</li>
          <li>Each consecutive session adds +0.2x to your XP multiplier.</li>
          <li>
            <span style={{ color: 'var(--flow-green)' }}>Pause &lt; 15 mins:</span> Full grace — streak continues.
          </li>
          <li>
            <span style={{ color: 'var(--streak-orange)' }}>Pause 15–30 mins:</span> Streak frozen — no progress, no reset.
          </li>
          <li>
            <span style={{ color: 'var(--danger-red)' }}>Pause &gt; 30 mins:</span> Streak resets to zero.
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default FocusPage;