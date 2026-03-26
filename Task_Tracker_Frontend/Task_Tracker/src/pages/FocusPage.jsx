import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import { SkeletonBox } from '../components/ui/Skeleton';
import useGameStore from '../store/useGameStore';

const FocusPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { pomodoroFlowStreak, sessionActive } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12">
        <div className="flex flex-col items-center mb-10">
          <SkeletonBox width="20rem" height="3rem" className="mb-4 rounded-xl" />
          <SkeletonBox width="28rem" height="1.5rem" className="mb-2 rounded-md" />
          <SkeletonBox width="24rem" height="1.5rem" className="rounded-md" />
        </div>
        
        <div className="flex justify-center mb-12">
          <SkeletonBox width="300px" height="300px" className="rounded-full" />
        </div>

        <div className="max-w-md mx-auto">
          <SkeletonBox width="100%" height="14rem" className="rounded-2xl" />
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
      <div className="text-center mb-10">
        {/* ✨ STANDARDIZED: text-3xl font-black */}
        <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          Deep Work Protocol
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Complete consecutive 25-minute sessions to build your Flow Streak. <br/>
          <span style={{ color: 'var(--flow-green)' }}>Every completed session increases your global XP multiplier.</span>
        </p>
      </div>

      <PomodoroTimer />

      {pomodoroFlowStreak === 0 && !sessionActive && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-5 rounded-2xl text-center text-sm max-w-md mx-auto"
              style={{
                  backgroundColor: 'var(--surface-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
              }}>
              🎯 Complete your first session to start building
              your Flow Streak and earn bonus XP multipliers
          </motion.div>
      )}

      {/* ✨ STANDARDIZED: rounded-2xl and p-5 */}
      <div 
        className="mt-12 max-w-md mx-auto text-sm p-5 rounded-2xl border" 
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