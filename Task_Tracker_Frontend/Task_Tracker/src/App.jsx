import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './components/TaskCard';
import Modal from './components/Modal';
import TaskForm from './components/TaskForm';
import TaskFilters from './components/TaskFilters';
import DashboardStats from './components/DashboardStats';
import PomodoroTimer from './components/PomodoroTimer';

const API_URL = 'http://localhost:8080/api/v1/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observer = useRef();

  // ✨ UPDATED: Now accepts pageNumber and a reset flag
  const fetchTasks = async (currentPage=0, shouldReset = true) => {
    setIsLoading(true);
    try {
      // Build the exact URL with all our backend filters and pagination!
      const params = new URLSearchParams({
        page: currentPage,
        size: 10
      });
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterTag) params.append('tag', filterTag);

      const response = await axios.get(`${API_URL}?${params.toString()}`);

      // Spring Boot hides the array inside "content" now!
      const newTasks = response.data.content;

      setTasks(prevTasks => {
        if (shouldReset) return newTasks; // Overwrite if filters changed
        return [...prevTasks, ...newTasks]; // Append if just scrolling down
      });

      // Spring Boot tells us if we hit the very last page!
      setHasMore(!response.data.last);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger 1: When the PAGE changes (scrolling down)
  useEffect(() => {
    if (page > 0) fetchTasks(page, false);
  }, [page]);

  // Trigger 2: When any FILTER changes (reset back to page 0)
  useEffect(() => {
    setPage(0);
    fetchTasks(0, true);
  }, [searchQuery, filterStatus, filterPriority, filterTag]);


  const handleCreate = async (newTaskData) => {
    setFormErrors({});
    try {
      await axios.post(API_URL, newTaskData);
      setIsCreateOpen(false);
      fetchTasks();
    } catch (error) {
      if (error.response && error.response.status === 400) setFormErrors(error.response.data);
    }
  };

  const handleUpdate = async (updatedTaskData) => {
    setFormErrors({});
    try {
      // ✨ THE FIX: Merge the existing task data (which has the status!) 
      // with the new data from the form (which has our new tags array!)
      const payload = {
        ...taskToEdit,      // Brings in the existing 'status'
        ...updatedTaskData  // Overwrites with the new title, tags, etc. from the form
      };

      await axios.put(`${API_URL}/${taskToEdit.id}`, payload);

      setTaskToEdit(null);
      fetchTasks();
    } catch (error) {
      console.error("Update failed:", error);
      if (error.response && error.response.status === 400) {
        setFormErrors(error.response.data);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${taskToDelete.id}`);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    // ✨ 1. OPTIMISTIC UPDATE: Instantly update the UI before the server even replies!
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );

    // 2. Extract just the names from the tag objects for Spring Boot
    const tagNames = taskToUpdate.tags ? taskToUpdate.tags.map(tag => tag.name) : [];

    try {
      // 3. Silently update the backend in the background
      await axios.put(`${API_URL}/${id}`, {
        ...taskToUpdate,
        status: newStatus,
        tags: tagNames
      });

      // Notice we removed fetchTasks() here! We don't need to download 
      // the list again because our local React state is already correct.

    } catch (error) {
      console.error("Failed to update status on server:", error);
      // 4. THE ROLLBACK: If the server crashed, fetch the real data to fix the UI
      fetchTasks();
    }
  };

  const handleCompletePomodoro = async (taskId) => {
    if (!taskId) return;
    try {
      await axios.post(`${API_URL}/${taskId}/pomodoro`);
      fetchTasks();
    } catch (error) {
      console.error("Error recording Pomodoro:", error);
    }
  };

  const closeCreateModal = () => { setIsCreateOpen(false); setFormErrors({}); };
  const closeEditModal = () => { setTaskToEdit(null); setFormErrors({}); };

  // ✨ NEW: Extract unique tags from all tasks for the dropdown
  const availableTags = Array.from(
    new Set(tasks.flatMap(task => task.tags?.map(t => t.name) || []))
  ).sort();


  const lastTaskElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-24">

        {/* HEADER */}
        <div className="border-b border-gray-800 pb-5 mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Workspace</h1>
          <p className="text-sm text-gray-500">Manage your tasks and focus sessions.</p>
        </div>

        {/* --- THE MAIN DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: THE MAIN STAGE (Tasks & Filters - Takes up 8 of 12 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <TaskFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              availableTags={availableTags}
            />

            <div className="flex flex-col border border-gray-800 rounded-xl overflow-hidden bg-[#0a0a0a] shadow-xl">

              {/* ✨ UPDATED: Map over 'tasks' and attach the ref to the last one! */}
              {tasks.map((task, index) => {
                if (tasks.length === index + 1) {
                  return (
                    // Attach the Infinite Scroll trigger to this div!
                    <div ref={lastTaskElementRef} key={task.id}>
                      <TaskCard
                        task={task}
                        onEdit={setTaskToEdit}
                        onDelete={setTaskToDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    </div>
                  );
                } else {
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setTaskToEdit}
                      onDelete={setTaskToDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  );
                }
              })}

              {/* ✨ NEW: Loading indicator for when you hit the bottom */}
              {isLoading && (
                <div className="text-center py-6 text-gray-500 text-sm font-medium border-t border-gray-800">
                  Loading more tasks...
                </div>
              )}

              {/* ✨ UPDATED: Empty state only shows if we are NOT loading */}
              {tasks.length === 0 && !isLoading && (
                <div className="text-gray-500 text-center py-24 flex flex-col items-center">
                  <p className="text-lg font-medium text-gray-300">No tasks found</p>
                  <p className="text-sm mt-1">Adjust your filters or create a new task to get started.</p>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: THE SIDEBAR (Stats & Timer - Takes up 4 of 12 columns) */}
          <div className="lg:col-span-4 relative">
            {/* The sticky container keeps the widgets on screen when scrolling down a long task list */}
            <div className="sticky top-8 flex flex-col gap-6">

              <DashboardStats tasks={tasks} />

              <PomodoroTimer
                tasks={tasks.filter(t => t.status === 'OPEN')}
                onPomodoroComplete={handleCompletePomodoro}
              />

            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 text-white px-5 py-3.5 rounded-full font-semibold flex items-center shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95 duration-200"
        >
          <FiPlus className="mr-2" size={20} strokeWidth={3} /> Create Task
        </button>
      </div>

      {/* Modals */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Create a New Task">
        <TaskForm onSubmit={handleCreate} onCancel={closeCreateModal} isUpdate={false} errors={formErrors} />
      </Modal>

      <Modal isOpen={!!taskToEdit} onClose={closeEditModal} title="Update Task">
        {taskToEdit && <TaskForm initialData={taskToEdit} onSubmit={handleUpdate} onCancel={closeEditModal} isUpdate={true} errors={formErrors} />}
      </Modal>

      <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task">
        {/* Your existing delete prompt content */}
        <div className="mb-6 text-gray-300">
          Are you sure you want to delete <span className="text-white font-bold">"{taskToDelete?.title}"</span>? <br />
          <span className="text-red-400 text-sm mt-2 block">This action cannot be undone.</span>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-white bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 transition">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-[#7f1d1d] text-white rounded-md hover:bg-red-800 transition font-medium">Delete</button>
        </div>
      </Modal>

    </div>
  );
}   