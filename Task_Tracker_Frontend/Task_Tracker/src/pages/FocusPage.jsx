import React from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';

const FocusPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col justify-center py-10"
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