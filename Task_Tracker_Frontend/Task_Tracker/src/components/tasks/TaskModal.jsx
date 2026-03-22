import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskApi, tagApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';

// ✨ NEW: Custom Dropdown specifically styled for the Modal form inputs
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
                
                <svg 
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                    className="opacity-50 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
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
                                style={{
                                    color: value === opt.value ? 'var(--xp-blue)' : 'white',
                                    backgroundColor: value === opt.value ? 'var(--surface-base)' : 'transparent',
                                    fontWeight: value === opt.value ? 'bold' : 'normal'
                                }}
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
    const { setError } = useGameStore();
    const userId = useGameStore(state => state.userId);
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

    // Load tags when modal opens
    useEffect(() => {
        if (isOpen) {
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
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
        setReminderTime('');
        setSelectedTags([]);
        setIsCreatingTag(false);
        setNewTagName('');
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const res = await tagApi.create({ name: newTagName.trim(), color: newTagColor });
            setAvailableTags([...availableTags, res.data]);
            setSelectedTags([...selectedTags, res.data]);
            setIsCreatingTag(false);
            setNewTagName('');
        } catch (err) {
            setError(err.response?.status === 409 ? 'Tag name already exists.' : 'Failed to create tag.');
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

        if (dueDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const localTodayStr = `${year}-${month}-${day}`;

            if (dueDate < localTodayStr) {
                setError('Due date cannot be in the past.');
                return;
            }
        }

        if (reminderTime) {
            const selectedReminder = new Date(reminderTime);
            const now = new Date();
            now.setMinutes(now.getMinutes() - 1);

            if (selectedReminder < now) {
                setError('Reminder time must be in the future.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const cleanDueDate = dueDate ? dueDate : null;
            const cleanReminder = reminderTime ? (reminderTime.length === 16 ? `${reminderTime}:00` : reminderTime) : null;

            if (existingTask) {
                const updatePayload = {
                    title: title.trim(),
                    description: description.trim() || null,
                    dueDate: cleanDueDate,
                    reminderDateTime: cleanReminder,
                    status: existingTask.status || 'OPEN', 
                    priority: priority,
                    tags: selectedTags.map(t => t.name)
                };

                await taskApi.update(existingTask.id, updatePayload);

            } else {
                const createPayload = {
                    title: title.trim(),
                    description: description.trim() || null,
                    dueDate: cleanDueDate,
                    reminderDateTime: cleanReminder,
                    priority: priority,
                    tags: selectedTags.map(t => t.name),
                    userId: userId 
                };

                await taskApi.create(createPayload);
            }

            onSuccess(); 
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error.response?.data || error);
            setError(`Failed to ${existingTask ? 'update' : 'forge'} quest. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✨ Define options for our new ModalSelect
    const priorityOptions = [
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg p-6 rounded-2xl shadow-2xl border flex flex-col max-h-[90vh]"
                        style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            {existingTask ? 'Edit Quest' : 'Forging a New Quest'}
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Quest Title *</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Slay the Database Migration" className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-[var(--xp-blue)]" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Description</label>
                                    <textarea value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} rows="2" placeholder="Optional details..." className="w-full p-3 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-white focus:outline-none focus:border-[var(--xp-blue)] resize-none" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold mb-1 text-[var(--text-secondary)]">Priority Threat</label>
                                        
                                        {/* ✨ REPLACED NATIVE SELECT WITH MODAL SELECT */}
                                        <ModalSelect 
                                            value={priority}
                                            onChange={setPriority}
                                            options={priorityOptions}
                                        />
                                        
                                    </div>
                                </div>

                                {/* Tag System */}
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

                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => {
                                            const isSelected = selectedTags.some(t => t.id === tag.id);
                                            return (
                                                <button
                                                    key={tag.id} type="button" onClick={() => toggleTagSelection(tag)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: isSelected ? tag.color : 'transparent' }}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                        {availableTags.length === 0 && !isCreatingTag && <span className="text-xs text-[var(--text-secondary)]">No tags available. Create one!</span>}
                                    </div>
                                </div>

                                {/* Dates Row */}
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