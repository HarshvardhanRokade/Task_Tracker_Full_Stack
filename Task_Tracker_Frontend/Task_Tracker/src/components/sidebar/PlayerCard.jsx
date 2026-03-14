import React from 'react';
import { Flame, Gem } from 'lucide-react';
import useGameStore from '../../store/useGameStore';
import XpBar from './XpBar';

const PlayerCard = () => {
  const { 
    level, 
    username, // Added this!
    currentXp, 
    xpToNextLevel, 
    gemBalance, 
    dailyStreak,
    getLevelName 
  } = useGameStore();

  return (
    <div className="p-4 rounded-xl mb-6 shadow-lg border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--level-gold)' }}>
          {level}
        </div>
        <div>
          {/* Fixed: Now perfectly reactive to state changes! */}
          <h3 className="font-bold text-sm m-0" style={{ color: 'var(--text-primary)' }}>{username}</h3>
          <p className="text-xs m-0" style={{ color: 'var(--level-gold)' }}>{getLevelName()}</p>
        </div>
      </div>

      <XpBar currentXp={currentXp} totalXpForNextLevel={xpToNextLevel} />

      <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5" title="Gem Balance">
          <Gem size={16} style={{ color: 'var(--gem-purple)' }} />
          <span className="text-sm font-semibold">{gemBalance}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Daily Streak">
          <Flame size={16} style={{ color: dailyStreak > 0 ? 'var(--streak-orange)' : 'var(--text-secondary)' }} />
          <span className="text-sm font-semibold">{dailyStreak}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;