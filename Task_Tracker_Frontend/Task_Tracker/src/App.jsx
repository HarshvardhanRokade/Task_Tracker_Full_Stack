import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✨ NEW
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';

import Modal from './components/Modal';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar'; // ✨ NEW

// We will create these pages next!
import TasksPage from './pages/TasksPage';
import FocusPage from './pages/FocusPage';
import DashboardPage from './pages/DashboardPage';

const API_URL = 'http://localhost:8080/api/v1/tasks';

export default function App() {
  // --- ALL YOUR EXISTING LOGIC STAYS EXACTLY THE SAME ---
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
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();

  const fetchTasks = async (currentPage=0, shouldReset = true) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, size: 10 });
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterTag) params.append('tag', filterTag);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      const newTasks = response.data.content;

      setTasks(prevTasks => {
        if (shouldReset) return newTasks;
        return [...prevTasks, ...newTasks];
      });

      setHasMore(!response.data.last);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (page > 0) fetchTasks(page, false);
  }, [page]);

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
      const payload = { ...taskToEdit, ...updatedTaskData };
      await axios.put(`${API_URL}/${taskToEdit.id}`, payload);
      setTaskToEdit(null);
      fetchTasks();
    } catch (error) {
      if (error.response && error.response.status === 400) setFormErrors(error.response.data);
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
    setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, status: newStatus } : task));
    try {
      await axios.put(`${API_URL}/${id}/status?status=${newStatus}`);
    } catch (error) {
      if (error.response && error.response.data) alert("Server Error:\n" + JSON.stringify(error.response.data, null, 2));
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

  const availableTags = Array.from(new Set(tasks.flatMap(task => task.tags?.map(t => t.name) || []))).sort();

  const lastTaskElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // --- ✨ THE NEW ROUTING UI SHELL ---
  return (
    <div className="min-h-screen bg-[#0F0E47] text-white flex selection:bg-[#505081]/50">
      
      {/* The Permanent Sidebar */}
      <Sidebar />

      {/* The Main Content Area (Pushed right by the 64-width sidebar) */}
      <div className="flex-1 ml-64 p-8 md:p-12 h-screen overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto">
          
          <Routes>
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            
            <Route path="/tasks" element={
              <TasksPage 
                tasks={tasks}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                filterPriority={filterPriority} setFilterPriority={setFilterPriority}
                filterTag={filterTag} setFilterTag={setFilterTag}
                availableTags={availableTags}
                isLoading={isLoading}
                lastTaskElementRef={lastTaskElementRef}
                setTaskToEdit={setTaskToEdit}
                setTaskToDelete={setTaskToDelete}
                handleToggleStatus={handleToggleStatus}
              />
            } />
            
            <Route path="/focus" element={<FocusPage tasks={tasks} handleCompletePomodoro={handleCompletePomodoro} />} />
            <Route path="/dashboard" element={<DashboardPage tasks={tasks} />} />
          </Routes>

        </div>
      </div>

      {/* Global Floating Action Button */}
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#505081] text-white px-5 py-3.5 rounded-full font-semibold flex items-center shadow-xl hover:bg-[#8686AC] hover:-translate-y-1 transition-all active:scale-95 duration-200"
        >
          <FiPlus className="mr-2" size={20} strokeWidth={3} /> Create Task
        </button>
      </div>

      {/* Global Modals */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Create a New Task">
        <TaskForm onSubmit={handleCreate} onCancel={closeCreateModal} isUpdate={false} errors={formErrors} />
      </Modal>

      <Modal isOpen={!!taskToEdit} onClose={closeEditModal} title="Update Task">
        {taskToEdit && <TaskForm initialData={taskToEdit} onSubmit={handleUpdate} onCancel={closeEditModal} isUpdate={true} errors={formErrors} />}
      </Modal>

      <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task">
        <div className="mb-6 text-gray-300">
          Are you sure you want to delete <span className="text-white font-bold">"{taskToDelete?.title}"</span>? <br />
          <span className="text-red-400 text-sm mt-2 block">This action cannot be undone.</span>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-white bg-transparent border border-[#505081] rounded-md hover:bg-[#272757] transition">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-900/80 text-white rounded-md hover:bg-red-800 transition font-medium">Delete</button>
        </div>
      </Modal>

    </div>
  );
}