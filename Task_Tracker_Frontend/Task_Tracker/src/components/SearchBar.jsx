import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative w-full group">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200">
                <FiSearch size={18} />
            </div>

            <input
                type="text"
                placeholder="Search tasks by title..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                // ✨ STYLED: Swapped border-gray-800 for border-white/5, and softened the focus ring
                className="w-full bg-[#121212] border border-white/5 hover:border-white/10 rounded-xl py-2.5 pl-11 pr-11 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all shadow-sm"
            />

            {/* Your Awesome Clear Button */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-400 transition-colors duration-200 focus:outline-none"
                    aria-label="Clear search"
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );
}