import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function CustomDropdown({ value, onChange, options, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative min-w-[150px] z-20" ref={dropdownRef}>
            {/* 1. The Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#272757] border rounded-xl px-4 py-2.5 flex justify-between items-center transition-all shadow-sm outline-none
                    ${isOpen ? 'border-blue-400 ring-1 ring-blue-400' : 'border-[#505081] hover:border-[#8686AC]'}`}
            >
                <span className={`truncate text-sm ${value ? "text-white" : "text-[#8686AC]"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiChevronDown
                    className={`ml-2 flex-shrink-0 text-[#8686AC] transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                    size={16}
                />
            </button>

            {/* 2. The Floating Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F0E47] border border-[#505081] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="py-1.5 max-h-60 overflow-y-auto no-scrollbar">

                        {/* The "All" Option */}
                        <li
                            onClick={() => { onChange(""); setIsOpen(false); }}
                            className={`px-4 py-2.5 cursor-pointer transition-colors text-sm
                                ${value === "" ? 'text-white font-medium bg-[#505081]' : 'text-[#8686AC] hover:bg-[#272757] hover:text-white'}`}
                        >
                            {placeholder}
                        </li>

                        {/* Map through the actual choices */}
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className={`px-4 py-2.5 cursor-pointer transition-colors text-sm
                                    ${value === option.value ? 'text-white font-medium bg-[#505081]' : 'text-[#8686AC] hover:bg-[#272757] hover:text-white'}`}
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