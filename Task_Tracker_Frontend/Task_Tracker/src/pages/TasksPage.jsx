import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { taskApi } from '../api/gameApi';
import useGameStore from '../store/useGameStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { SkeletonTaskCard, SkeletonBox } from '../components/ui/Skeleton';

// --- CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ value, onChange, options, icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-sm z-10">{icon}</span>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-9 pr-8 py-2.5 bg-[var(--surface-raised)] border rounded-xl text-sm font-normal text-[var(--text-secondary)] hover:text-white cursor-pointer select-none transition-colors flex items-center min-h-[42px]"
        style={{ borderColor: isOpen ? 'var(--xp-blue)' : 'var(--border-subtle)' }}
      >
        <span className="truncate" style={{ color: value === 'ALL' ? 'var(--text-secondary)' : 'white' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>
      
      <div 
        className="absolute right-3 top-1/2 opacity-50 pointer-events-none transition-transform duration-200 flex items-center justify-center text-[var(--text-secondary)]" 
        style={{ transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)'}}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[9999] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[var(--border-subtle)] [&::-webkit-scrollbar-thumb]:rounded-full">
              {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                    className="px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-[var(--surface-base)] flex items-center gap-2"
                    style={{ 
                      color: isSelected ? 'var(--xp-blue)' : 'var(--text-secondary)',
                      backgroundColor: isSelected ? 'var(--surface-base)' : 'transparent',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TasksPage = () => {
  const { tasks, setTasks, setError } = useGameStore();
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL'); 
  const [availableTags, setAvailableTags] = useState([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchActiveTags = async () => {
      try {
        const response = await taskApi.getAll({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
        const allTasksForStatus = Array.isArray(response.data) ? response.data : response.data?.content || [];
        
        const uniqueTags = new Set();
        allTasksForStatus.forEach(task => {
          if (task.tags && Array.isArray(task.tags)) {
            task.tags.forEach(tag => {
              const tagName = typeof tag === 'object' ? tag.name : tag;
              if (tagName) uniqueTags.add(tagName);
            });
          }
        });
        
        setAvailableTags(Array.from(uniqueTags));
        
        if (tagFilter !== 'ALL' && !uniqueTags.has(tagFilter)) {
          setTagFilter('ALL');
        }
      } catch (err) {
        console.error("Failed to dynamically load tags.");
      }
    };
    fetchActiveTags();
  }, [statusFilter]);

  const fetchTasks = useCallback(async (pageNum = 0) => {
    try {
      if (pageNum > 0) setIsLoadingMore(true);

      const params = {
        page: pageNum,
        size: 10
      };
      
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (tagFilter !== 'ALL') params.tag = tagFilter; 

      const response = await taskApi.getAll(params);
      const newTasks = response.data?.content || (Array.isArray(response.data) ? response.data : []);
      
      if (pageNum === 0) {
        setTasks(newTasks);
      } else {
        setTasks([...useGameStore.getState().tasks, ...newTasks]);
      }

      setHasMore(response.data?.last === false);
      setPage(pageNum);

    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setIsLoadingMore(false);
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, tagFilter, setTasks, setError]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks(0);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTasks]);

  const handleOpenModal = (task = null) => {
    setTaskToEdit(task); 
    setIsModalOpen(true);
  };

  const priorityOptions = [
    { label: 'All Threats', value: 'ALL' },
    { label: 'High Threat', value: 'HIGH' },
    { label: 'Medium Threat', value: 'MEDIUM' },
    { label: 'Low Threat', value: 'LOW' }
  ];

  const statusOptions = [
    { label: 'Open Quests', value: 'OPEN' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'All Statuses', value: 'ALL' }
  ];

  const tagOptions = [
    { label: 'All Tags', value: 'ALL' },
    ...availableTags.map(tag => ({ label: tag, value: tag }))
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto py-6"
      >
        <div className="flex justify-between items-center mb-6">
          <SkeletonBox height="2.5rem" width="12rem" className="rounded-xl" />
          <SkeletonBox height="2.5rem" width="8rem" className="rounded-xl" />
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}
        >
          {[1,2,3,4].map(i => (
            <SkeletonBox key={i} height="2.5rem" className="rounded-xl" />
          ))}
        </div>
        
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <SkeletonTaskCard key={i} />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto py-6" 
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Active Quests</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="px-5 py-2.5 bg-[var(--flow-green)] rounded-xl font-bold text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(46,204,113,0.3)]"
        >
          + Forge Quest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 bg-[var(--surface-base)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-lg relative z-50">
        
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search titles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl text-sm font-normal text-white placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--xp-blue)] transition-colors"
          />
        </div>

        <CustomSelect 
          icon="🏷️"
          value={tagFilter}
          onChange={setTagFilter}
          options={tagOptions}
          placeholder="Filter by tag..."
        />

        <CustomSelect 
          icon="⚔️"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions}
          placeholder="All Threats"
        />

        <CustomSelect 
          icon="📜"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder="Open Quests"
        />
      </div>

      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-2xl border border-dashed relative z-0"
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}
        >
          {searchQuery || priorityFilter !== 'ALL' || tagFilter !== 'ALL' || statusFilter !== 'OPEN' ? (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                No quests match your filters
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Try adjusting your search or filters
              </p>
              {/* ✨ STANDARDIZED: Clear Filters Button Comment Moved */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('ALL');
                  setTagFilter('ALL');
                  setStatusFilter('OPEN');
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--xp-blue)',
                  border: '1px solid var(--xp-blue)',
                }}
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⚔️</div>
              <p className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
                No active quests
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Create your first quest to start earning XP and building your streak
              </p>
              <button
                onClick={() => handleOpenModal(null)}
                className="px-6 py-3 rounded-xl font-bold text-black transition-transform hover:scale-105 shadow-[0_0_15px_rgba(46,204,113,0.3)]"
                style={{ backgroundColor: 'var(--flow-green)' }}
              >
                + Forge Your First Quest
              </button>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="flex flex-col gap-3 relative z-0">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
              />
            ))}
          </AnimatePresence>

          {hasMore && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => fetchTasks(page + 1)}
              disabled={isLoadingMore}
              className="mt-4 py-3 px-6 mx-auto bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--xp-blue)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoadingMore ? '⏳ Searching Archives...' : '📜 Reveal More Quests'}
            </motion.button>
          )}
        </motion.div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTasks(0)} 
        existingTask={taskToEdit}
      />
    </motion.div>
  );
};

export default TasksPage;