import React from 'react';
import { FiCheckCircle, FiClock, FiList, FiTrendingUp } from 'react-icons/fi';

export default function DashboardStats({ tasks }) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETE').length;
    const openTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="flex flex-col gap-4">
            {/* The Progress Bar (Moved to the top of the stats for better visual flow) */}
            <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <FiTrendingUp className="text-purple-500" /> Progress
                    </span>
                    <span className="text-sm font-bold text-blue-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-[#0a0a0a] rounded-full h-2.5 overflow-hidden border border-gray-800">
                    <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* The 3 Stat Cards (Now stacked vertically in a grid) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
                    <FiList className="text-blue-500 mb-2" size={20} />
                    <h3 className="text-2xl font-bold text-white leading-none mb-1">{totalTasks}</h3>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total</p>
                </div>

                <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
                    <FiClock className="text-orange-500 mb-2" size={20} />
                    <h3 className="text-2xl font-bold text-white leading-none mb-1">{openTasks}</h3>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Open</p>
                </div>
                
                {/* Completed spans both columns to anchor the bottom */}
                <div className="col-span-2 bg-[#121212] border border-gray-800 rounded-xl p-4 flex items-center shadow-sm">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-lg mr-4">
                        <FiCheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Completed Tasks</p>
                        <h3 className="text-2xl font-bold text-white">{completedTasks}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}