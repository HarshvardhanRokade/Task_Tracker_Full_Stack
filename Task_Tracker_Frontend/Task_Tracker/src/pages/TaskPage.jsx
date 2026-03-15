import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { taskApi } from '../api/gameApi';
import useGameStore from '../store/useGameStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal'; // ✨ NEW: Import the modal

const TasksPage = () => {
  const { tasks, setTasks, setError } = useGameStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // ✨ NEW: Modal state
  const [taskToEdit, setTaskToEdit] = useState(null);

  // ✨ NEW: Wrapped in useCallback so we can pass it to the modal's onSuccess
  const fetchTasks = useCallback(async () => {
    try {
      const response = await taskApi.getAll({ status: 'OPEN' });
      // ✨ FIXED: Bulletproof fallback for both List<TaskDto> and Page<TaskDto>
      setTasks(Array.isArray(response.data) ? response.data : response.data?.content || []);
    } catch (err) {
      setError('Failed to load tasks.');
    }
  }, [setTasks, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✨ NEW: Helper function to open modal for creation OR editing
  const handleOpenModal = (task = null) => {
    setTaskToEdit(task); // If null, it's a new task. If an object, it's an edit!
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto" // Added mx-auto to center it perfectly
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Active Quests</h2>

        {/* ✨ NEW: Wired up the button to open the modal! */}
        <button
          onClick={() => handleOpenModal(null)}
          className="px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-lg text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-sm"
        >
          + New Quest
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
          No open quests. You are all caught up!
        </div>
      ) : (
        <motion.div layout className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ✨ NEW: The Gamified Form mounted globally on the page */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
        existingTask={taskToEdit}
      />
    </motion.div>
  );
};

export default TasksPage;