import React, { useState } from "react";


export default function TaskForm({ initialData, onSubmit, onCancel, isUpdate , errors={} }) {

    const [formData, setFormData] = useState(initialData || {
        title: '',
        description: '', 
        dueDate: '',
        priority: 'MEDIUM',
        status: 'OPEN'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* --- TITLE --- */}
            <div>
                <label className="font-medium text-white mb-1 block text-sm">Title</label>
                <input
                    type="text"
                    className={`w-full bg-transparent border border-gray-700 rounded-md p-2.5 text-white outline-none transition-colors ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <p className="text-red-500 font-medium mt-1.5 text-xs">{errors.title}</p>}
            </div>

            {/* --- DESCRIPTION --- */}
            <div>
                <label className="font-medium text-white mb-1 block text-sm">Description</label>
                <textarea
                    className={`w-full bg-transparent border border-gray-700 rounded-md p-2.5 text-white  outline-none min-h-[80px] transition-colors ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500 font-medium mt-1.5 text-xs">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {/* --- DUE DATE --- */}
                <div className="col-span-1">
                    <label className="font-medium text-white mb-1 block text-sm">Due Date</label>
                    <input
                        type="date"
                        className={`w-full bg-[#0a0a0a] border border-gray-700 rounded-md p-2.5 text-white  outline-none appearance-none transition-colors ${errors.dueDate ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`}
                        value={formData.dueDate || ''}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                    {errors.dueDate && <p className="text-red-500 font-medium mt-1.5 text-xs">{errors.dueDate}</p>}
                </div>

                {/* --- PRIORITY --- */}
                <div className="col-span-1">
                    <label className="font-medium text-white mb-1 block text-sm">Priority</label>
                    <select
                        className={`w-full bg-[#0a0a0a] border border-gray-700 rounded-md p-2.5 text-white  outline-none appearance-none transition-colors ${errors.priority ? 'border-red-500 focus:border-red-500' : 'border-r-gray-700 focus:border-blue-500'}`}
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                    {errors.priority && <p className="text-red-500 font-medium mt-1.5 text-xs">{errors.priority}</p>}
                </div>

                {/* --- STATUS (Only shows when editing) --- */}
                {isUpdate && (
                    <div className="col-span-1">
                        <label className="font-medium text-white mb-1 block text-sm">Status</label>
                        <select
                            className={`w-full bg-[#0a0a0a] border border-gray-700 rounded-md p-2.5 text-white  outline-none appearance-none transition-colors ${errors.status ? 'border-red-500 focus:border-red-500' : 'border-gray-700  focus:border-blue-500'}`}
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="OPEN">Open</option>
                            <option value="COMPLETE">Complete</option>
                        </select>
                        {errors.status && <p className="text-red-500 font-medium mask-t-to-1.5 text-xs">{errors.status}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-white bg-transparent border border-gray-700 rounded-md hover:bg-red-600 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="px-4 py-2 bg-[#3b82f6] text-white rounded-md hover:bg-blue-600 transition font-medium"
                >
                    {isUpdate ? 'Save Changes' : 'Create Task'}
                </button>
            </div>

        </form>
    );
}