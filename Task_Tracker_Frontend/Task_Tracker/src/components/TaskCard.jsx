import React from "react";
import { FiCalendar, FiCheck, FiDelete, FiEdit, FiFlag, FiTag } from "react-icons/fi";

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {

    const isComplete = task.status === 'COMPLETE'

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-[#121212] transition-colors">
            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggleStatus(task.id, isComplete ? 'OPEN' : 'COMPLETE')}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded border ${isComplete ? "bg-green-500 border-green-500" : "border-gray-500"} flex items-center justify-center transition`}
                >
                    {isComplete && <FiCheck size={14} className="text-[#0a0a0a] font-bold" />}
                </button>

                <div>
                    <h3 className={`text-base font-medium ${isComplete ? "line-through text-gray-500" : "text-white"}`}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className="text-sm text-gray-400 mt-0.5">{task.description}</p>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                            {task.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-opacity-10"
                                    style={{
                                        color: tag.color,
                                        borderColor: `${tag.color}40`, // 40 adds 25% opacity to the hex color
                                        backgroundColor: `${tag.color}15` // 15 adds ~8% opacity
                                    }}
                                >
                                    <FiTag size={10} /> {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5 uppercase">
                            <FiFlag size={12} /> {task.priority}
                        </span>
                        {task.dueDate && (
                            <span className="flex items-center gap-1.5">
                                <FiCalendar size={12} /> {task.dueDate}
                            </span>
                        )}
                        {task.pomodoroCount > 0 && (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-500/20">
                                🍅 {task.pomodoroCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(task)}
                    className="p-2 border border-gray-800 rounded text-gray-400 hover:text-blue-500 hover:border-blue-900 transition"
                >
                    <FiEdit size={16} />
                </button>

                <button
                    onClick={() => onDelete(task)}
                    className="p-2 border rounded border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-800 transition"
                >
                    <FiDelete size={16} />
                </button>
            </div>
        </div>
    );
}