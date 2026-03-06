import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function TaskForm({ initialData = {}, onSubmit, onCancel, isUpdate = false, errors = {} }) {
    const [title, setTitle] = useState(initialData.title || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [dueDate, setDueDate] = useState(initialData.dueDate || "");
    const [priority, setPriority] = useState(initialData.priority || "MEDIUM");
    
    // ✨ NEW: State for our tags and the text currently being typed
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");

    // Load existing tags if we are editing a task
    useEffect(() => {
        if (initialData.tags) {
            // Map the objects {id, name, color} to just an array of names ["Frontend", "Urgent"]
            setTags(initialData.tags.map(t => t.name)); 
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Include the tags array in the data sent to App.jsx!
        onSubmit({ 
            title, 
            description, 
            dueDate: dueDate || null, 
            priority,
            tags 
        });
    };

    // ✨ NEW: Logic to add a tag when pressing Enter or Comma
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); // Stop the form from submitting!
            const newTag = tagInput.trim();
            
            // Only add it if it's not empty and not already in the list
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput(""); // Clear the input box
        } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
            // Bonus UX: Pressing backspace on an empty input deletes the last tag!
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                    placeholder="What needs to be done?"
                    required
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                    placeholder="Add some details..."
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors color-scheme-dark"
                    />
                    {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-[#121212] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            {/* ✨ NEW: The Tags Input UI ✨ */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags (Press Enter to add)</label>
                <div className="w-full bg-[#121212] border border-gray-700 rounded-lg p-2 flex flex-wrap gap-2 focus-within:border-blue-500 transition-colors">
                    
                    {tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1 bg-[#2a2a2a] text-gray-200 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-600">
                            {tag}
                            <button 
                                type="button" 
                                onClick={() => removeTag(tag)}
                                className="text-gray-400 hover:text-red-400 ml-1 rounded-full p-0.5"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    ))}
                    
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-1 bg-transparent min-w-[120px] text-sm text-white outline-none px-1 py-1"
                        placeholder={tags.length === 0 ? "e.g., Bug, Frontend, Urgent..." : ""}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-white bg-transparent border border-gray-700 rounded-lg hover:bg-gray-800 transition font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium shadow-lg shadow-blue-500/20"
                >
                    {isUpdate ? "Update Task" : "Create Task"}
                </button>
            </div>
        </form>
    );
}