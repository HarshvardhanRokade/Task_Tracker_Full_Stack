import React from 'react';
import { FiEdit, FiTrash2, FiFlag, FiCalendar, FiCheck } from 'react-icons/fi';

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const isComplete = task.status === 'COMPLETE';

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-[#121212] transition-colors">

      <div className="flex items-start gap-4">
        {/* Custom Checkbox mapping to your "OPEN" / "COMPLETE" Enum */}
        <button
          onClick={() => onToggleStatus(task.id, isComplete ? 'OPEN' : 'COMPLETE')}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border ${isComplete ? 'bg-green-500 border-green-500' : 'border-gray-500'} flex items-center justify-center transition`}
        >
          {isComplete && <FiCheck size={14} className="text-[#0a0a0a] font-bold" />}
        </button>

        <div>
          <h3 className={`text-base font-medium ${isComplete ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-400 mt-0.5">{task.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5 uppercase">
              <FiFlag size={12} /> {task.priority}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1.5">
                <FiCalendar size={12} /> {task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="p-2 border border-gray-800 rounded text-gray-400 hover:text-white hover:border-gray-600 transition"
        >
          <FiEdit size={16} />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-2 border border-gray-800 rounded text-gray-400 hover:text-red-500 hover:border-red-900 transition"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

    </div>
  );
}