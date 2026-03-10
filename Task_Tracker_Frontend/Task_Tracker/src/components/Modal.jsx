import React from "react";
import { FiX } from 'react-icons/fi'; 

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0F0E47]/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#272757] border border-[#505081] shadow-2xl rounded-2xl p-6 md:p-8 w-full max-w-lg relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-[#8686AC] hover:text-white bg-[#0F0E47] hover:bg-[#505081] p-1.5 rounded-lg transition-colors"
                >
                    <FiX size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">{title}</h2>
                {children}
            </div>
        </div>
    );
}