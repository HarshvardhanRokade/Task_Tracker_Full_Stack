import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative w-full group">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8686AC] group-focus-within:text-blue-400 transition-colors duration-200">
                <FiSearch size={18} />
            </div>

            <input
                type="text"
                placeholder="Search tasks by title..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#272757] border border-[#505081] hover:border-[#8686AC] rounded-xl py-2.5 pl-11 pr-11 text-white placeholder:text-[#8686AC] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all shadow-sm"
            />

            {/* Clear Button */}
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8686AC] hover:text-red-400 transition-colors duration-200 focus:outline-none"
                    aria-label="Clear search"
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );
}