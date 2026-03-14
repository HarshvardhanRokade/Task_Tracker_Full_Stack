import React from 'react';
import { motion } from 'framer-motion';

const XpBar = ({ currentXp, totalXpForNextLevel }) => {
  // Calculate percentage, capping at 100% just in case
  const fillPercentage = Math.min((currentXp / totalXpForNextLevel) * 100, 100);

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        <span>XP</span>
        <span>{currentXp} / {totalXpForNextLevel}</span>
      </div>
      
      {/* The Track */}
      <div 
        className="w-full h-2 rounded-full overflow-hidden relative" 
        style={{ backgroundColor: 'var(--surface-raised)' }}
      >
        {/* The Animated Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: 'var(--xp-blue)' }}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>
    </div>
  );
};

export default XpBar;