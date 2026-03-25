import React from 'react';
import { Flame, Gem } from 'lucide-react';
import useGameStore from '../../store/useGameStore';
import XpBar from './XpBar';
// ✨ NEW: Import the animation hook
import useCountUp from '../../hooks/useCountUp'; 

const PlayerCard = () => {
  const { 
    level, 
    username, 
    currentXp, 
    xpToNextLevel, 
    gemBalance, 
    dailyStreak,
    getLevelName,
    xpBoostActive 
  } = useGameStore();

  // ✨ NEW: Wrap our core numbers in the animation hook
  const animatedXp = useCountUp(currentXp);
  const animatedGems = useCountUp(gemBalance);
  const animatedStreak = useCountUp(dailyStreak);

  return (
    <div className="p-4 rounded-xl mb-6 shadow-lg border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--level-gold)' }}>
          {level}
        </div>
        <div>
          <h3 className="font-bold text-sm m-0" style={{ color: 'var(--text-primary)' }}>{username}</h3>
          <p className="text-xs m-0" style={{ color: 'var(--level-gold)' }}>{getLevelName()}</p>
        </div>
      </div>

      {/* ✨ UPDATED: Pass the animated value to the XP Bar */}
      <XpBar currentXp={animatedXp} totalXpForNextLevel={xpToNextLevel} />

      <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5" title="Gem Balance">
          <Gem size={16} style={{ color: 'var(--gem-purple)' }} />
          {/* ✨ UPDATED: Animated Gems */}
          <span className="text-sm font-semibold">{animatedGems}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Daily Streak">
          <Flame size={16} style={{ color: dailyStreak > 0 ? 'var(--streak-orange)' : 'var(--text-secondary)' }} />
          {/* ✨ UPDATED: Animated Streak */}
          <span className="text-sm font-semibold">{animatedStreak}</span>
        </div>
      </div>

      {xpBoostActive && (
        <div 
          className="mt-3 pt-3 border-t flex items-center justify-center gap-2 text-xs font-bold"
          style={{ 
            borderColor: 'var(--border-subtle)',
            color: 'var(--flow-green)'
          }}
        >
          <span className="animate-pulse text-base">⚡</span>
          XP Boost Ready
        </div>
      )}
    </div>
  );
};

export default PlayerCard;