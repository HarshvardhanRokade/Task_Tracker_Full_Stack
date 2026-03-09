import React, { useState, useRef, useEffect } from "react"; // ✨ NEW IMPORTS
import { FiCalendar, FiCheck, FiDelete, FiEdit, FiFlag, FiTag } from "react-icons/fi";

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
    const [showCalendarMenu, setShowCalendarMenu] = useState(false);
    
    // ✨ NEW: Create a reference to our dropdown container
    const menuRef = useRef(null); 
    
    const isComplete = task.status === 'COMPLETE';

    // ✨ NEW: The "Click Outside" Listener
    useEffect(() => {
        function handleClickOutside(event) {
            // If the menu is open, and the user clicked something outside of 'menuRef', close it!
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowCalendarMenu(false);
            }
        }

        // Attach the listener to the whole document
        document.addEventListener("mousedown", handleClickOutside);
        
        // Clean up the listener when the component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDownloadCalendar = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/tasks/${task.id}/calendar`);
            if (!response.ok) throw new Error("Failed to download file");
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `task-${task.title.replace(/\s+/g, '-')}.ics`); 
            
            document.body.appendChild(link);
            link.click(); 

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setShowCalendarMenu(false); 
        } catch (error) {
            console.error("Error downloading calendar event:", error);
            setShowCalendarMenu(false);
        }
    };

    const handleGoogleCalendar = () => {
        const date = new Date(task.dueDate || task.reminderDateTime || new Date());
        const start = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        date.setHours(date.getHours() + 1);
        const end = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&details=${encodeURIComponent(task.description || "")}&dates=${start}/${end}`;
        
        window.open(googleUrl, '_blank');
        setShowCalendarMenu(false); 
    };

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
                                        borderColor: `${tag.color}40`,
                                        backgroundColor: `${tag.color}15` 
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

            <div className="flex items-center gap-2">
                
                {/* ✨ TWEAK: Attached the menuRef here! */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                        className="p-2 border border-gray-800 rounded text-gray-400 hover:text-green-500 hover:border-green-900 transition"
                        title="Add to Calendar"
                    >
                        <FiCalendar size={16} /> 
                    </button>

                    {/* ✨ TWEAK: Changed positioning to top-full mt-2 and z-[100] */}
                    {showCalendarMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-xl z-[100] overflow-hidden">
                            <button 
                                onClick={handleGoogleCalendar}
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
                            >
                                🌐 Google Calendar
                            </button>
                            <div className="border-t border-gray-700"></div>
                            <button 
                                onClick={handleDownloadCalendar}
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
                            >
                                💻 Apple / Outlook
                            </button>
                        </div>
                    )}
                </div>

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