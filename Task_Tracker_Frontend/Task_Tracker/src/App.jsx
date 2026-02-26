import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './components/TaskCard';
import Modal from './components/Modal';
import TaskForm from './components/TaskForm';

// Make sure this matches your Spring Boot URL exactly!
const API_URL = 'http://localhost:8080/api/v1/tasks'; 

export default function App() {
  const [tasks, setTasks] = useState([]); // Starts empty now!

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- NEW: Fetching Data from Spring Boot ---
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data); // Load the database tasks into React's memory
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Run fetchTasks EXACTLY ONCE when the app first loads
  useEffect(() => {
    fetchTasks(); 
  }, []);

  // --- UPDATED: CRUD Operations using Axios ---
  const handleCreate = async (newTaskData) => {
    try {
      await axios.post(API_URL, newTaskData);
      setIsCreateOpen(false);
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdate = async (updatedTaskData) => {
    try {
      await axios.put(`${API_URL}/${taskToEdit.id}`, updatedTaskData);
      setTaskToEdit(null);
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${taskToDelete.id}`);
      setTaskToDelete(null);
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    // Find the current task, swap its status, and send the full update to the backend
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate) {
      try {
        await axios.put(`${API_URL}/${id}`, { ...taskToUpdate, status: newStatus });
        fetchTasks(); // Refresh the list
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="max-w-4xl mx-auto pt-10 px-6 pb-24">

        <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Your Tasks</h1>
          <span className="text-gray-400 text-lg font-medium bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <div className="flex flex-col border border-gray-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-xl">
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
            <div className="text-gray-500 text-center py-16 flex flex-col items-center">
              <p className="text-lg">No tasks left!</p>
              <p className="text-sm mt-1">Click the button below to create one.</p>
            </div>
          )}
        </div>

      </div>

      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#3b82f6] text-white px-5 py-3.5 rounded-full font-semibold flex items-center shadow-lg hover:bg-blue-500 hover:scale-105 transition-all active:scale-95"
        >
          <FiPlus className="mr-2" size={20} strokeWidth={3} /> Create Task
        </button>
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create a New Task">
        <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} isUpdate={false} />
      </Modal>

      <Modal isOpen={!!taskToEdit} onClose={() => setTaskToEdit(null)} title="Update Task">
        {taskToEdit && (
          <TaskForm initialData={taskToEdit} onSubmit={handleUpdate} onCancel={() => setTaskToEdit(null)} isUpdate={true} />
        )}
      </Modal>

      <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task">
        <div className="mb-6 text-gray-300">
          Are you sure you want to delete <span className="text-white font-bold">"{taskToDelete?.title}"</span>? <br />
          <span className="text-red-400 text-sm mt-2 block">This action cannot be undone.</span>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-white bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 transition">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-[#7f1d1d] text-white rounded-md hover:bg-red-800 transition font-medium">
            Delete
          </button>
        </div>
      </Modal>

    </div>
  );
}