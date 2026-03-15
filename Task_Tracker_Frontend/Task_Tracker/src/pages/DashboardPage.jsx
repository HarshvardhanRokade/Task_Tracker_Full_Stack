import React from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';

const DashboardPage = () => {
  // Pulling all our live gamified data from the global store
  const { 
    level, 
    currentXp, 
    xpToNextLevel, 
    totalXp, 
    gemBalance, 
    currentDailyStreak, 
    longestDailyStreak ,
    getLevelName
  } = useGameStore();

  // Calculate the progress bar width safely
  const progressPercent = xpToNextLevel > 0 
    ? Math.min(100, Math.max(0, (currentXp / (currentXp + xpToNextLevel)) * 100))
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto py-6"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Player Profile</h2>
        <p className="text-[var(--text-secondary)]">Track your progression and mastery.</p>
      </div>

      {/* --- TOP ROW: LEVEL & XP BAR --- */}
      <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-6 shadow-lg relative overflow-hidden">
        {/* Subtle background glow based on level */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--xp-blue)] opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="flex items-center gap-6 mb-6">
          {/* Level Badge */}
          <div className="w-20 h-20 rounded-full border-4 border-[var(--xp-blue)] flex items-center justify-center bg-[var(--surface-raised)] shadow-[0_0_15px_var(--xp-blue)]">
            <div className="text-center">
              <div className="text-xs font-bold text-[var(--xp-blue)] uppercase tracking-wider">Lvl</div>
              <div className="text-3xl font-black text-white leading-none">{level}</div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">{getLevelName()}</h3> {/* You can make this dynamic later! */}
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              {currentXp} / {currentXp + xpToNextLevel} XP to Next Level
            </p>
          </div>
        </div>

        {/* The XP Progress Bar */}
        <div className="h-4 w-full bg-[var(--surface-raised)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--xp-blue)] relative"
          >
            {/* Animated shimmer effect on the bar */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* --- BOTTOM ROW: STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total XP Card */}
        <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md hover:border-[var(--xp-blue)] transition-colors">
          <div className="text-4xl mb-2 opacity-80">⭐</div>
          <div className="text-3xl font-black text-white mb-1">{totalXp.toLocaleString()}</div>
          <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Lifetime XP</div>
        </div>

        {/* Gems Card */}
        <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md hover:border-[var(--gem-purple)] transition-colors">
          <div className="text-4xl mb-2 opacity-80">💎</div>
          <div className="text-3xl font-black text-white mb-1">{gemBalance.toLocaleString()}</div>
          <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Gems Hoarded</div>
        </div>

        {/* Streak Card */}
        <div className="bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md hover:border-[var(--streak-orange)] transition-colors relative overflow-hidden">
          {currentDailyStreak > 0 && (
            <div className="absolute inset-0 bg-[var(--streak-orange)] opacity-5 animate-pulse" />
          )}
          <div className="text-4xl mb-2 opacity-80">{currentDailyStreak > 0 ? '🔥' : '🧊'}</div>
          <div className="text-3xl font-black text-white mb-1">{currentDailyStreak || 0} Days</div>
          <div className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Active Streak</div>
          {longestDailyStreak > 0 && (
             <div className="text-xs text-[var(--text-secondary)] mt-2">
               Personal Best: {longestDailyStreak}
             </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default DashboardPage;