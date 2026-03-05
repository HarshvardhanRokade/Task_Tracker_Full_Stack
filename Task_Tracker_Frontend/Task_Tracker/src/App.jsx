import React, { useState, useEffect } from 'react';
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

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          search: searchQuery || undefined,
          status: filterStatus || undefined,
          priority: filterPriority || undefined
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, filterStatus, filterPriority]);

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
        await axios.put(`${API_URL}/${taskToEdit.id}`, updatedTaskData);
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
      } catch (error) {}
  };

  const handleToggleStatus = async (id, newStatus) => { 
      const taskToUpdate = tasks.find(t => t.id === id);
      if (taskToUpdate) {
        try {
          await axios.put(`${API_URL}/${id}`, { ...taskToUpdate, status: newStatus });
          fetchTasks();
        } catch (error) {}
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
            />

            <div className="flex flex-col border border-gray-800 rounded-xl overflow-hidden bg-[#0a0a0a] shadow-xl">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setTaskToEdit}
                  onDelete={setTaskToDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
              {tasks.length === 0 && (
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