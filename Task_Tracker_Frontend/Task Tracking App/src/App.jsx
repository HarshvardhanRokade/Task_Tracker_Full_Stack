import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import TaskCard from './components/TaskCard';
import Modal from './components/Modal';
import TaskForm from './components/TaskForm';

const API_URL = 'http://localhost:8080/api/v1/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);



  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();   // eslint-disable-line
  }, []); // fetchTasks is stable due to useCallback, so omitting it from deps is safe

  const handleCreate = async (taskData) => {
    try {
      await axios.post(API_URL, taskData);
      setIsCreateOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdate = async (taskData) => {
    try {
      await axios.put(`${API_URL}/${taskToEdit.id}`, taskData);
      setTaskToEdit(null);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${taskToDelete.id}`);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        await axios.put(`${API_URL}/${id}`, { ...task, status: newStatus });
        fetchTasks();
      } catch (err) {
        console.error("Error updating status:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto pt-10 px-6 pb-24">

        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-4 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Your Tasks</h1>
          <span className="text-gray-400 text-lg">{tasks.length}</span>
        </div>

        {/* Task List */}
        <div className="flex flex-col">
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
            <div className="text-gray-500 text-center py-10">No tasks yet. Create one below.</div>
          )}
        </div>

      </div>

      {/* Create Button (Fixed Bottom Left) */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-white text-black px-4 py-2.5 rounded-md font-medium flex items-center shadow-lg hover:bg-gray-200 transition"
        >
          <FiPlus className="mr-2" size={18} /> Create Task
        </button>
      </div>

      {/* Modals */}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create a New Task">
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isUpdate={false}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!taskToEdit} onClose={() => setTaskToEdit(null)} title="Update Task">
        <TaskForm
          initialData={taskToEdit}
          onSubmit={handleUpdate}
          onCancel={() => setTaskToEdit(null)}
          isUpdate={true}
        />
      </Modal>

      {/* Delete Confirmation Modal (Screenshot 5) */}
      <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task">
        <div className="mb-6 text-gray-300 text-lg">
          Are you sure you want to delete "{taskToDelete?.title}"? <br />
          This cannot be undone!
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setTaskToDelete(null)}
            className="px-4 py-2 text-white bg-transparent border border-gray-700 rounded-md hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-[#7f1d1d] text-white rounded-md hover:bg-red-800 transition font-medium"
          >
            Delete
          </button>
        </div>
      </Modal>

    </div>
  );
}