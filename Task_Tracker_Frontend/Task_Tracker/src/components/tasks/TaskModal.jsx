import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskApi, tagApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';

// ✨ Custom Dropdown for the Priority field
const ModalSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border text-white cursor-pointer select-none transition-colors flex items-center justify-between"
                style={{ borderColor: isOpen ? 'var(--xp-blue)' : 'var(--border-subtle)' }}
            >
                <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-[calc(100%+4px)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-lg shadow-2xl z-50 overflow-hidden"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className="p-3 text-sm cursor-pointer transition-colors hover:bg-[var(--surface-base)]"
                                style={{ color: value === opt.value ? 'var(--xp-blue)' : 'white', backgroundColor: value === opt.value ? 'var(--surface-base)' : 'transparent', fontWeight: value === opt.value ? 'bold' : 'normal' }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, onSuccess, existingTask = null }) => {
    const { setError, userId } = useGameStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    // Tag Management State
    const [availableTags, setAvailableTags] = useState([]);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6');

    useEffect(() => {
        if (isOpen) {
            // ✨ Backend now automatically filters by OPEN tasks!
            tagApi.getAll()
                .then(res => setAvailableTags(res.data))
                .catch(() => setError('Could not load tags.'));

            if (existingTask) {
                setTitle(existingTask.title);
                setDescription(existingTask.description || '');
                setPriority(existingTask.priority);
                setDueDate(existingTask.dueDate || '');
                setReminderTime(existingTask.reminderDateTime ? existingTask.reminderDateTime.substring(0, 16) : '');
                setSelectedTags(existingTask.tags || []);
            } else {
                resetForm();
            }
        }
    }, [isOpen, existingTask, setError]);

    const resetForm = () => {
        setTitle(''); setDescription(''); setPriority('MEDIUM');
        setDueDate(''); setReminderTime(''); setSelectedTags([]);
        setIsCreatingTag(false); setNewTagName('');
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        // Remove any local checks like: 
        // if (availableTags.find(t => t.name === newTagName)) ...

        try {
            const res = await tagApi.create({ name: newTagName.trim(), color: newTagColor });

            // If the backend returns the "revived" tag, this logic handles it perfectly:
            setAvailableTags(prev => {
                // Check if it's already in the visible list to avoid UI duplicates
                if (prev.find(t => t.id === res.data.id)) return prev;
                return [...prev, res.data];
            });

            setSelectedTags(prev => [...prev, res.data]);
            setIsCreatingTag(false);
            setNewTagName('');
        } catch (err) {
            // Now this will only fire for actual system errors!
            setError(err.response?.data?.message || 'Failed to create tag.');
        }
    };

    const handleDeleteTag = async (tagId, e) => {
        e.stopPropagation();
        try {
            await tagApi.delete(tagId);
            setAvailableTags(availableTags.filter(t => t.id !== tagId));
            setSelectedTags(selectedTags.filter(t => t.id !== tagId));
        } catch (err) {
            // ✨ IMPROVED: Check if the backend sent a specific error message
            // Spring Boot usually puts it in err.response.data.message
            const backendMessage = err.response?.data?.message;
            const fallbackMessage = 'Failed to delete tag. It might be tied to an active quest.';

            setError(backendMessage || fallbackMessage);
        }
    };

    const toggleTagSelection = (tag) => {
        if (selectedTags.find(t => t.id === tag.id)) {
            setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        // Date Validation
        if (dueDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            if (dueDate < `${year}-${month}-${day}`) {
                setError('Due date cannot be in the past.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const cleanDueDate = dueDate ? dueDate : null;
            const cleanReminder = reminderTime ? (reminderTime.length === 16 ? `${reminderTime}:00` : reminderTime) : null;

            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                dueDate: cleanDueDate,
                reminderDateTime: cleanReminder,
                priority: priority,
                tags: selectedTags.map(t => t.name), // Sends list of names to backend
                userId: userId
            };

            if (existingTask) {
                await taskApi.update(existingTask.id, { ...payload, status: existingTask.status });
            } else {
                await taskApi.create(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            setError(`Failed to save quest.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityOptions = [
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
                        style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-white">{existingTask ? 'Edit Quest' : 'Forging a New Quest'}</h2>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex flex-col gap-4 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">

                                {/* --- TITLE --- */}
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Quest Title *</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Slay the Database Migration" className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-[var(--xp-blue)]" />
                                </div>

                                {/* --- DESCRIPTION --- */}
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Description</label>
                                    <textarea value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} rows="2" placeholder="Optional details..." className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-[var(--xp-blue)] resize-none" />
                                </div>

                                {/* --- PRIORITY --- */}
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Priority Threat</label>
                                    <ModalSelect value={priority} onChange={setPriority} options={priorityOptions} />
                                </div>

                                {/* --- TAG SYSTEM --- */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-[var(--text-secondary)]">Tags</label>
                                        <button type="button" onClick={() => setIsCreatingTag(!isCreatingTag)} className="text-[var(--xp-blue)] text-sm hover:text-white transition-colors">
                                            + New Tag
                                        </button>
                                    </div>

                                    {isCreatingTag && (
                                        <div className="flex gap-2 mb-3 p-3 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-subtle)]">
                                            <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                                            <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag name..." className="flex-1 bg-transparent text-white focus:outline-none text-sm" />
                                            <button type="button" onClick={handleCreateTag} className="px-3 py-1 bg-[var(--xp-blue)] text-white rounded text-sm font-bold">Add</button>
                                        </div>
                                    )}

                                    {/* Scrollable Container with Hover-to-Delete tags */}
                                    {/* ✨ FIXED: Added pt-2 and pr-2 to prevent the 'X' from being cut in half */}
                                    <div className="flex flex-wrap content-start gap-3 max-h-40 overflow-y-auto pt-2 pr-2 pb-1 custom-scrollbar">
                                        {availableTags.map(tag => {
                                            const isSelected = selectedTags.some(t => t.id === tag.id);
                                            return (
                                                <div key={tag.id} className="relative group inline-block">

                                                    {/* Main Tag Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTagSelection(tag)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                                                        style={{
                                                            backgroundColor: `${tag.color}20`,
                                                            color: tag.color,
                                                            borderColor: isSelected ? tag.color : 'transparent'
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </button>

                                                    {/* The Delete 'X' - Now with enough room to breathe! */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteTag(tag.id, e)}
                                                        className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--surface-raised)] border border-[var(--danger-red)] text-[var(--danger-red)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--danger-red)] hover:text-white z-10 shadow-lg"
                                                        title="Delete Tag"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                        </svg>
                                                    </button>

                                                </div>
                                            );
                                        })}
                                        {availableTags.length === 0 && !isCreatingTag && (
                                            <span className="text-xs text-[var(--text-secondary)]">No tags available.</span>
                                        )}
                                    </div>
                                </div>

                                {/* --- DATES --- */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Due Date</label>
                                        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--xp-blue)] [color-scheme:dark]" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Reminder</label>
                                        <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--xp-blue)] [color-scheme:dark]" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-bold text-[var(--text-secondary)] hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg font-bold text-white transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: 'var(--xp-blue)', opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'Saving...' : (existingTask ? 'Update Quest' : 'Create Quest')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TaskModal;