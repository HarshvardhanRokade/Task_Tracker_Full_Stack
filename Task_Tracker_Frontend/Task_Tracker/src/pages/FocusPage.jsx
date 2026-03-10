import React from 'react';
import PomodoroTimer from '../components/PomodoroTimer';

export default function FocusPage({ tasks, handleCompletePomodoro }) {
  // Only pass OPEN tasks to the timer dropdown
  const openTasks = tasks.filter(t => t.status === 'OPEN');

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-10">
      
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight mb-2 text-white">Deep Work Zone</h2>
        <p className="text-[#8686AC]">Pick a task, start the timer, and eliminate distractions.</p>
      </div>

      <PomodoroTimer
        tasks={openTasks}
        onPomodoroComplete={handleCompletePomodoro}
      />
      
    </div>
  );
}