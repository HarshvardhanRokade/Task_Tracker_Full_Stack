import React from "react";
import { FiCheckCircle, FiClock, FiList, FiTrendingUp } from "react-icons/fi";

export default function DashboardStats({ tasks }) {

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETE').length;
    const openTasks = totalTasks - completedTasks;

    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">


                {/* Total Tasks Card */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 flex items-center shadow-sm">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg mr-4">
                        <FiList size={24} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-400 text-sm">Total Tasks</p>
                        <h3 className="font-bold text-white text-2xl">{totalTasks}</h3>
                    </div>
                </div>


                {/* Open Tasks Card */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 flex items-center shadow-sm">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg mr-4">
                        <FiClock size={24} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-400 text-sm">In Progress</p>
                        <h3 className="font-bold text-white text-2xl">{openTasks}</h3>
                    </div>
                </div>

                {/* Completed Tasks Card */}
                <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 flex items-center shadow-sm">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-lg mr-4">
                        <FiCheckCircle size={24} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-400 text-sm">Completed Tasks</p>
                        <h3 className="font-bold text-white text-2xl">{completedTasks}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-[#121212] border border-gray-800 rounded-xl p-5 flex items-center shadow-sm">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <FiTrendingUp size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Completion Progress</span>
                        <span className="text-sm font-bold text-blue-400">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${completionPercentage}%` }}
                        >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}