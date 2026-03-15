import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';
import { getPriorityRewards } from '../../utils/RewardCalculator';

const TaskCard = ({ task, onEdit }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ✨ NEW: State to control our custom delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  
  const { xp, gems } = getPriorityRewards(task.priority);

  const baseBorderColor = 
    task.priority === 'HIGH' ? 'var(--danger-red)' : 
    task.priority === 'MEDIUM' ? 'var(--streak-orange)' : 
    'var(--xp-blue)';

  const handleCompleteTask = async () => {
    setIsCompleting(true); 
    try {
      const response = await taskApi.complete(task.id);
      await new Promise(resolve => setTimeout(resolve, 200));
      useGameStore.getState().applyReward(response.data);
      useGameStore.getState().removeTask(task.id);
    } catch (error) {
      console.error('Failed to complete task:', error);
      useGameStore.getState().setError('Could not complete task. Please try again.');
      setIsCompleting(false); 
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    try {
      await taskApi.delete(task.id);
      useGameStore.getState().removeTask(task.id); 
    } catch (error) {
      console.error('Failed to delete task:', error);
      useGameStore.getState().setError('Failed to abandon quest.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className="p-4 mb-4 rounded-xl flex justify-between items-center transition-shadow hover:shadow-lg relative"
        style={{ 
          backgroundColor: 'var(--surface-base)',
          borderLeft: `4px solid ${isCompleting ? 'var(--level-gold)' : baseBorderColor}`,
          borderTop: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'border-left-color 0.2s ease-out'
        }}
      >
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {task.tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 rounded text-xs font-bold border"
                  style={{ 
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}30`
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {task.dueDate && (
            <div className="text-xs mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              ⏳ Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          
          <div className="flex gap-2 mt-3 text-xs font-bold">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--xp-blue)' }}>
              ~+{xp} XP
            </span>
            <span className="px-2 py-1 rounded flex items-center gap-1" style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--gem-purple)' }}>
              💎 {gems}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-end">
          {/* ✨ UPGRADED: Real buttons with SVG icons and hover states */}
          <div className="flex gap-2 text-[var(--text-secondary)]">
            <button 
              onClick={onEdit} 
              className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200" 
              title="Edit Quest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)} 
              className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all duration-200" 
              title="Abandon Quest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

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
        </div>
      </motion.div>

      {/* ✨ NEW: The Custom Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm p-6 rounded-2xl shadow-2xl border text-center"
              style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--danger-red)' }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center text-[var(--danger-red)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold mb-2 text-white">Abandon Quest?</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Are you sure you want to permanently delete <strong className="text-white">"{task.title}"</strong>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg font-bold text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-lg font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: 'var(--danger-red)',
                    opacity: isDeleting ? 0.7 : 1
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Abandon'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskCard;