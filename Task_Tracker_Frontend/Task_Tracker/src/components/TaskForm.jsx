import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function TaskForm({ initialData = {}, onSubmit, onCancel, isUpdate = false, errors = {} }) {
    const [title, setTitle] = useState(initialData.title || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [dueDate, setDueDate] = useState(initialData.dueDate || "");
    const [reminderDateTime, setReminderDateTime] = useState(initialData.reminderDateTime || "");
    const [priority, setPriority] = useState(initialData.priority || "MEDIUM");
    
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        if (initialData.tags) {
            setTags(initialData.tags.map(t => t.name)); 
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            title, 
            description, 
            dueDate: dueDate || null, 
            reminderDateTime: reminderDateTime || null,
            priority,
            tags 
        });
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); 
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
            setTagInput(""); 
        } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const inputClasses = "w-full bg-[#0F0E47] border border-[#505081] hover:border-[#8686AC] rounded-xl px-4 py-2.5 text-white placeholder:text-[#8686AC]/70 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-sm";
    const labelClasses = "block text-sm font-medium text-[#8686AC] mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className={labelClasses}>Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClasses}
                    placeholder="What needs to be done?"
                    required
                />
                {errors.title && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.title}</p>}
            </div>

            <div>
                <label className={labelClasses}>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputClasses} min-h-[100px] resize-y`}
                    placeholder="Add some details..."
                />
                {errors.description && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className={labelClasses}>Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`${inputClasses} [color-scheme:dark]`}
                    />
                    {errors.dueDate && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.dueDate}</p>}
                </div>

                <div>
                    <label className={labelClasses}>Set Reminder</label>
                    <input
                        type="datetime-local"
                        value={reminderDateTime}
                        onChange={(e) => setReminderDateTime(e.target.value)}
                        className={`${inputClasses} [color-scheme:dark]`}
                    />
                    {errors.reminderDateTime && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.reminderDateTime}</p>}
                </div>

                <div className="col-span-2">
                    <label className={labelClasses}>Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClasses}>Tags (Press Enter to add)</label>
                <div className="w-full bg-[#0F0E47] border border-[#505081] hover:border-[#8686AC] rounded-xl p-2.5 flex flex-wrap gap-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all shadow-sm cursor-text">
                    
                    {tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1.5 bg-[#505081] text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                            {tag}
                            <button 
                                type="button" 
                                onClick={() => removeTag(tag)}
                                className="text-indigo-200 hover:text-red-400 hover:bg-[#272757] rounded-full p-0.5 transition-colors"
                            >
                                <FiX size={14} />
                            </button>
                        </span>
                    ))}
                    
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-1 bg-transparent min-w-[120px] text-sm text-white outline-none px-1 py-1 placeholder:text-[#8686AC]/70"
                        placeholder={tags.length === 0 ? "e.g., Bug, Frontend, Urgent..." : ""}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 mt-2 border-t border-[#505081]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-[#8686AC] bg-transparent border border-[#505081] rounded-xl hover:bg-[#505081] hover:text-white transition-all font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 hover:-translate-y-0.5 transition-all font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95"
                >
                    {isUpdate ? "Update Task" : "Create Task"}
                </button>
            </div>
        </form>
    );
}