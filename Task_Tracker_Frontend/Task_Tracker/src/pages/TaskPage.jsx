import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { taskApi } from '../api/gameApi';
import useGameStore from '../store/useGameStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';

// ✨ UPGRADED: Beautiful, animated custom dropdown component that matches the search bar
const CustomSelect = ({ value, onChange, options, icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if user clicks anywhere outside of it
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
      
      {/* ✨ FIXED: Uses font-normal and text-[var(--text-secondary)] to match the Search bar perfectly */}
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
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* The animated popup menu */}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL'); 
  const [availableTags, setAvailableTags] = useState([]);

  // ✨ NEW: PAGINATION STATES ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✨ FIXED: Dynamic Tag Extraction (Safely handles Objects!)
  useEffect(() => {
    const fetchActiveTags = async () => {
      try {
        const response = await taskApi.getAll({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
        const allTasksForStatus = Array.isArray(response.data) ? response.data : response.data?.content || [];
        
        const uniqueTags = new Set();
        allTasksForStatus.forEach(task => {
          if (task.tags && Array.isArray(task.tags)) {
            task.tags.forEach(tag => {
              // Extract the string name whether it's an object {name: 'cooking'} or already a string
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

  // ✨ UPGRADED: MAIN TASK FETCH WITH PAGINATION
  const fetchTasks = useCallback(async (pageNum = 0) => {
    try {
      if (pageNum > 0) setIsLoadingMore(true);

      const params = {
        page: pageNum,
        size: 10 // Only grab 10 to keep the DB fast and UI snappy
      };
      
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (tagFilter !== 'ALL') params.tag = tagFilter; 

      const response = await taskApi.getAll(params);
      const newTasks = response.data?.content || (Array.isArray(response.data) ? response.data : []);
      
      // If we are on page 0 (new search/filter), replace list. Else, append to existing list!
      if (pageNum === 0) {
        setTasks(newTasks);
      } else {
        setTasks([...useGameStore.getState().tasks, ...newTasks]);
      }

      // Read Spring Boot's pagination metadata to see if we reached the end
      setHasMore(response.data?.last === false);
      setPage(pageNum);

    } catch (err) {
      setError('Failed to load tasks.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, tagFilter, setTasks, setError]);

  // --- DEBOUNCE ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks(0); // ✨ Always reset to Page 0 when user types or changes a filter
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchTasks]);

  const handleOpenModal = (task = null) => {
    setTaskToEdit(task); 
    setIsModalOpen(true);
  };

  // --- DROPDOWN OPTIONS DATA ---
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto py-6" 
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Active Quests</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="px-5 py-2.5 bg-[var(--flow-green)] rounded-xl font-bold text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(46,204,113,0.3)]"
        >
          + Forge Quest
        </button>
      </div>

      {/* --- THE UPGRADED FILTER DASHBOARD --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 bg-[var(--surface-base)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-lg relative z-50">
        
        {/* 1. Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-sm">🔍</span>
          {/* ✨ FIXED: Added font-normal and placeholder-[var(--text-secondary)] to perfectly match CustomSelect */}
          <input 
            type="text" 
            placeholder="Search titles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl text-sm font-normal text-white placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--xp-blue)] transition-colors"
          />
        </div>

        {/* 2. Tag Dropdown (Now Custom!) */}
        <CustomSelect 
          icon="🏷️"
          value={tagFilter}
          onChange={setTagFilter}
          options={tagOptions}
          placeholder="Filter by tag..."
        />

        {/* 3. Priority Dropdown (Now Custom!) */}
        <CustomSelect 
          icon="⚔️"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={priorityOptions}
          placeholder="All Threats"
        />

        {/* 4. Status Dropdown (Now Custom!) */}
        <CustomSelect 
          icon="📜"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder="Open Quests"
        />
      </div>

      {/* Task List Rendering */}
      {tasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 bg-[var(--surface-base)] border border-dashed rounded-2xl border-[var(--border-subtle)] text-[var(--text-secondary)] relative z-0"
        >
          <div className="text-4xl mb-3 opacity-50">🏕️</div>
          <div className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            {searchQuery || priorityFilter !== 'ALL' || tagFilter !== 'ALL' || statusFilter !== 'OPEN' 
              ? "No quests match your current filters." 
              : "No active quests. The realm is at peace."}
          </div>
          <p className="text-sm opacity-70">Enjoy your rest, or forge a new quest to earn XP.</p>
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

          {/* ✨ NEW: GAMIFIED LOAD MORE BUTTON */}
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

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTasks(0)} // ✨ Make sure it resets to Page 0 after editing!
        existingTask={taskToEdit}
      />
    </motion.div>
  );
};

export default TasksPage;