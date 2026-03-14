import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { taskApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';
import { getPriorityRewards } from '../../utils/RewardCalculator';

const TaskCard = ({ task }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Get expected base loot
  const { xp, gems } = getPriorityRewards(task.priority);

  // Dynamic Priority Colors
  const baseBorderColor = 
    task.priority === 'HIGH' ? 'var(--danger-red)' : 
    task.priority === 'MEDIUM' ? 'var(--streak-orange)' : 
    'var(--xp-blue)';

  const handleCompleteTask = async () => {
    setIsCompleting(true); 
    try {
      const response = await taskApi.complete(task.id);
      
      // Satisfying gold flash delay
      await new Promise(resolve => setTimeout(resolve, 200));

      useGameStore.getState().applyReward(response.data);
      useGameStore.getState().removeTask(task.id);

    } catch (error) {
      console.error('Failed to complete task:', error);
      useGameStore.getState().setError('Could not complete task. Please try again.');
      setIsCompleting(false); 
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="p-4 mb-4 rounded-xl flex justify-between items-center transition-shadow hover:shadow-lg"
      style={{ 
        backgroundColor: 'var(--surface-base)',
        borderLeft: `4px solid ${isCompleting ? 'var(--level-gold)' : baseBorderColor}`,
        borderTop: '1px solid var(--border-subtle)',
        borderRight: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'border-left-color 0.2s ease-out'
      }}
    >
      {/* Left Side: Task Content */}
      <div className="flex-1 pr-4">
        <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </h3>
        
        {/* Optional Description */}
        {task.description && (
          <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {task.description}
          </p>
        )}

        {/* Optional Due Date */}
        {task.dueDate && (
          <div className="text-xs mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
            ⏳ Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
        
        {/* Loot Preview Badges */}
        <div className="flex gap-2 mt-3 text-xs font-bold">
          <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--xp-blue)' }}>
            ~+{xp} XP
          </span>
          <span className="px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--gem-purple)' }}>
            💎 {gems}
          </span>
        </div>
      </div>

      {/* Right Side: Action Button */}
      <button 
        onClick={handleCompleteTask}
        disabled={isCompleting}
        className="px-6 py-2 rounded-lg font-bold transition-all whitespace-nowrap"
        style={{ 
          backgroundColor: isCompleting ? 'var(--level-gold)' : 'var(--xp-blue)',
          color: isCompleting ? '#000' : '#fff',
          transform: isCompleting ? 'scale(0.95)' : 'scale(1)',
          cursor: isCompleting ? 'not-allowed' : 'pointer'
        }}
      >
        {isCompleting ? 'Done!' : 'Complete'}
      </button>
    </motion.div>
  );
};

export default TaskCard;