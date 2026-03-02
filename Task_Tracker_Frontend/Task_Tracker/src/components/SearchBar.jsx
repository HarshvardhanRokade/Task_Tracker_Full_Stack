import React from "react";
import { FiSearch , FiX } from "react-icons/fi";

export default function SearchBar({value , onChange}){
    return(
        <div className="mb-6 relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors duration-200">
                <FiSearch size={18}/>
            </div>

            <input 
                type="text" 
                placeholder="Search tasks by title......"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#121212] border border-gray-800 rounded-xl py-3 pl-11 pr-11 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm hover:border-gray-700"
            />

            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white hover:text-red-500 transition-colors duration-200 focus:outline-none"
                    aria-label="Clear search"
                >
                    <FiX size={18}/>
                </button>
            )}
        </div>
    );
}