import React from 'react';
import { FiCheckCircle, FiClock, FiList, FiTrendingUp } from 'react-icons/fi';

export default function DashboardStats({ tasks }) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETE').length;
    const openTasks = totalTasks - completedTasks;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="flex flex-col gap-5">
            {/* The Progress Bar */}
            <div className="bg-[#272757] border border-[#505081] rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-[#8686AC] flex items-center gap-2">
                        <FiTrendingUp className="text-blue-400" /> Progress
                    </span>
                    <span className="text-sm font-bold text-white">{completionPercentage}%</span>
                </div>
                
                <div className="w-full bg-[#0F0E47] rounded-full h-3 overflow-hidden border border-[#505081]/50 shadow-inner">
                    <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${completionPercentage}%` }}
                    >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                </div>
            </div>

            {/* The 3 Stat Cards */}
            <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#272757] border border-[#505081] rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl transition-transform hover:-translate-y-1 duration-300">
                    <FiList className="text-[#8686AC] mb-3" size={24} />
                    <h3 className="text-4xl font-black text-white leading-none mb-1 tracking-tight">{totalTasks}</h3>
                    <p className="text-[#8686AC] text-[10px] font-bold uppercase tracking-widest mt-1">Total</p>
                </div>

                <div className="bg-[#272757] border border-[#505081] rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl transition-transform hover:-translate-y-1 duration-300">
                    <FiClock className="text-blue-400 mb-3" size={24} />
                    <h3 className="text-4xl font-black text-white leading-none mb-1 tracking-tight">{openTasks}</h3>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Open</p>
                </div>
                
                <div className="col-span-2 bg-[#272757] border border-[#505081] rounded-2xl p-6 flex items-center shadow-xl transition-transform hover:-translate-y-1 duration-300">
                    <div className="p-4 bg-[#0F0E47] text-green-400 rounded-xl mr-6 border border-[#505081] shadow-inner">
                        <FiCheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[#8686AC] text-[10px] font-bold uppercase tracking-widest mb-1">Completed Tasks</p>
                        <h3 className="text-4xl font-black text-white tracking-tight">{completedTasks}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}