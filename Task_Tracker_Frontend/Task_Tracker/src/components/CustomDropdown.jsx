import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function CustomDropdown({ value, onChange, options, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // This closes the dropdown if the user clicks anywhere else on the screen
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Find the currently selected option to display its label
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative min-w-[150px] z-20" ref={dropdownRef}>

            {/* 1. The Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#121212] border rounded-xl px-4 h-[50px] flex justify-between items-center transition-colors shadow-sm outline-none
                    ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-800 hover:border-gray-700'}`}
            >
                <span className={value ? "text-white" : "text-gray-400"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
                    size={20}
                />
            </button>

            {/* 2. The Floating Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="py-1 max-h-60 overflow-y-auto">

                        {/* The "All" Option (Clears the filter) */}
                        <li
                            onClick={() => { onChange(""); setIsOpen(false); }}
                            className={`px-4 py-3 cursor-pointer transition-colors text-sm hover:bg-[#1a1a1a] 
                                ${value === "" ? 'text-blue-500 font-medium bg-[#0a0a0a]' : 'text-gray-300'}`}
                        >
                            {placeholder}
                        </li>

                        {/* Map through the actual choices */}
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={`px-4 py-3 cursor-pointer transition-colors text-sm hover:bg-[#1a1a1a] 
                                    ${value === option.value ? 'text-blue-500 font-medium bg-[#0a0a0a]' : 'text-gray-300'}`}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}