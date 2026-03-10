import React, { useState, useRef, useEffect } from "react";
import { FiCalendar, FiCheck, FiDelete, FiEdit, FiFlag, FiTag } from "react-icons/fi";

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
    const [showCalendarMenu, setShowCalendarMenu] = useState(false);
    const menuRef = useRef(null); 
    const isComplete = task.status === 'COMPLETE';

    // ✨ IMPROVED: "Click Outside" Listener
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowCalendarMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="group flex items-center justify-between p-4 md:p-5 border-b border-[#272757] hover:bg-[#272757]/50 transition-colors">
            <div className="flex items-start gap-4">
                <button
                    onClick={() => onToggleStatus(task.id, isComplete ? 'OPEN' : 'COMPLETE')}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded border ${isComplete ? "bg-green-500 border-green-500" : "border-[#505081] group-hover:border-[#8686AC]"} flex items-center justify-center transition`}
                >
                    {isComplete && <FiCheck size={14} className="text-[#0F0E47] font-bold" />}
                </button>

                <div>
                    {/* Brightened Title */}
                    <h3 className={`text-base font-medium ${isComplete ? "line-through text-[#8686AC] opacity-80" : "text-white group-hover:text-blue-50"}`}>
                        {task.title}
                    </h3>
                    
                    {/* Brightened Description */}
                    {task.description && (
                        <p className="text-sm text-indigo-200/80 mt-0.5">{task.description}</p>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                            {task.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                                    style={{
                                        color: tag.color,
                                        borderColor: `${tag.color}50`,
                                        backgroundColor: `${tag.color}20` 
                                    }}
                                >
                                    <FiTag size={10} /> {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-indigo-300/80 font-medium">
                        <span className="flex items-center gap-1.5 uppercase">
                            <FiFlag size={12} className={task.priority === 'HIGH' ? 'text-red-400' : ''} /> {task.priority}
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 ml-4 relative z-30">
                
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card toggle
                            setShowCalendarMenu(!showCalendarMenu);
                        }}
                        className="p-2 border border-[#272757] rounded text-[#8686AC] hover:text-green-400 hover:bg-[#272757] transition"
                        title="Add to Calendar"
                    >
                        <FiCalendar size={16} /> 
                    </button>

                    {showCalendarMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#272757] border border-[#505081] rounded-lg shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleGoogleCalendar(); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#505081] transition-colors flex items-center gap-2"
                            >
                                🌐 Google Calendar
                            </button>
                            <div className="border-t border-[#505081]"></div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDownloadCalendar(); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#505081] transition-colors flex items-center gap-2"
                            >
                                💻 Apple / Outlook
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
                    className="p-2 border border-[#272757] rounded text-[#8686AC] hover:text-blue-400 hover:bg-[#272757] transition"
                >
                    <FiEdit size={16} />
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(task); }} 
                    className="p-2 border border-[#272757] rounded text-[#8686AC] hover:text-red-400 hover:bg-[#272757] transition"
                >
                    <FiDelete size={16} />
                </button>
            </div>
        </div>
    );
}