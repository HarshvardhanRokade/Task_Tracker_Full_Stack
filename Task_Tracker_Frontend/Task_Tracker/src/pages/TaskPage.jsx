import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { taskApi } from '../api/gameApi';
import useGameStore from '../store/useGameStore';
import TaskCard from '../components/tasks/TaskCard';

const TasksPage = () => {
  const { tasks, setTasks, setError } = useGameStore();

  useEffect(() => {
    // Fetch OPEN tasks on mount
    const fetchTasks = async () => {
      try {
        const response = await taskApi.getAll({ status: 'OPEN' });
        // Assuming your backend returns a Page object with a 'content' array
        setTasks(response.data.content || []);
      } catch (err) {
        setError('Failed to load tasks.');
      }
    };
    
    fetchTasks();
  }, [setTasks, setError]);

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Active Quests</h2>
        {/* We will build the Create Task button later! */}
        <button className="px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-lg text-sm hover:bg-white/5">
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
          No open tasks. You are all caught up!
        </div>
      ) : (
        // AnimatePresence keeps components in the DOM long enough to play their 'exit' animations
        <motion.div layout className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default TasksPage;