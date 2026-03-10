import React from 'react';
import { FiCheckCircle, FiClock, FiList, FiTrendingUp } from 'react-icons/fi';

export default function DashboardStats({ tasks }) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETE').length;
    const openTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="flex flex-col gap-4">
            {/* The Progress Bar */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <FiTrendingUp className="text-blue-500" /> Progress
                    </span>
                    <span className="text-sm font-bold text-gray-200">{completionPercentage}%</span>
                </div>
                
                {/* ✨ STYLED: Darker track, softer border, and a subtle gradient overlay on the blue fill */}
                <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${completionPercentage}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                </div>
            </div>

            {/* The 3 Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Total Tasks */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-xl">
                    <FiList className="text-gray-400 mb-3" size={20} />
                    <h3 className="text-3xl font-bold text-white leading-none mb-1">{totalTasks}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total</p>
                </div>

                {/* Open Tasks */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-xl">
                    <FiClock className="text-blue-400 mb-3" size={20} />
                    <h3 className="text-3xl font-bold text-white leading-none mb-1">{openTasks}</h3>
                    <p className="text-blue-400/70 text-[10px] font-bold uppercase tracking-widest">Open</p>
                </div>
                
                {/* Completed Tasks (Anchors the bottom) */}
                <div className="col-span-2 bg-[#121212] border border-white/5 rounded-2xl p-5 flex items-center shadow-xl">
                    <div className="p-3 bg-green-500/10 text-green-400 rounded-xl mr-5 border border-green-500/10">
                        <FiCheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-green-400/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">Completed Tasks</p>
                        <h3 className="text-3xl font-bold text-white">{completedTasks}</h3>
                    </div>
                </div>
                
            </div>
        </div>
    );
}