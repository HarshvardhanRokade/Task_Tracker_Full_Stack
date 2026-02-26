import React from "react";
import { FiX } from 'react-icons/fi'; 

export default function Modal({isOpen , onClose , title , children}){

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <FiX size={20} />
                </button>
                <h2 className="text-xl font-semibold mb-6 text-white">{title}</h2>
                {children}
            </div>
        </div>
    );
}