import React from 'react';
import DashboardStats from '../components/DashboardStats';

export default function DashboardPage({ tasks }) {
  return (
    <div className="animate-in fade-in duration-300">
      
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Dashboard & Progress</h2>
        <p className="text-[#8686AC]">Track your productivity and visualize your success.</p>
      </div>

      <div className="max-w-3xl">
        <DashboardStats tasks={tasks} />
      </div>
      
    </div>
  );
}