import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiCoffee, FiBriefcase, FiInfo, FiX } from 'react-icons/fi';

const WORK_TIME = 25 * 60; 
const BREAK_TIME = 5 * 60; 

export default function PomodoroTimer({ tasks = [], onPomodoroComplete }) {
    const [mode, setMode] = useState('work');
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    
    // ✨ NEW: State to show/hide the info panel
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsRunning(false);
            
            if (mode === 'work') {
                if (selectedTaskId && onPomodoroComplete) {
                    onPomodoroComplete(selectedTaskId);
                }
                setMode('break');
                setTimeLeft(BREAK_TIME);
                alert("Pomodoro finished! Time for a short break.");
            } else {
                setMode('work');
                setTimeLeft(WORK_TIME);
                alert("Break is over! Time to get back to work.");
            }
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode, selectedTaskId, onPomodoroComplete]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
    };

    const switchMode = (newMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
    };

    return (
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
            
            {/* ✨ NEW: The Info Toggle Button */}
            <button 
                onClick={() => setShowInfo(!showInfo)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
                aria-label="How to use this timer"
            >
                {showInfo ? <FiX size={18} /> : <FiInfo size={18} />}
            </button>

            <div className="flex flex-col items-center relative z-10">
                
                {/* ✨ NEW: The Info Popover Panel */}
                {showInfo && (
                    <div className="absolute top-0 inset-x-0 bg-[#1a1a1a] border border-gray-700 rounded-lg p-5 text-sm text-gray-300 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-base">
                            <FiInfo className="text-blue-400" /> The Pomodoro Technique
                        </h4>
                        <ol className="list-decimal pl-4 space-y-2 marker:text-gray-500">
                            <li>Pick a specific task from the dropdown below.</li>
                            <li>Click <strong>Start</strong> and focus entirely on that task for 25 minutes.</li>
                            <li>When the timer rings, you earn a 🍅 for that task!</li>
                            <li>Take a 5-minute break to recharge, then repeat.</li>
                        </ol>
                    </div>
                )}

                {/* Mode Switcher */}
                <div className="flex bg-[#0a0a0a] rounded-lg p-1 mb-6 border border-gray-800 mt-2">
                    <button onClick={() => switchMode('work')} className={`flex items-center px-4 py-2 rounded-md transition-colors ${mode === 'work' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        <FiBriefcase className="mr-2" /> Focus
                    </button>
                    <button onClick={() => switchMode('break')} className={`flex items-center px-4 py-2 rounded-md transition-colors ${mode === 'break' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
                        <FiCoffee className="mr-2" /> Break
                    </button>
                </div>

                {/* Clock */}
                <div className="text-6xl font-black tracking-tight text-white mb-6 font-mono">
                    {formatTime(timeLeft)}
                </div>

                {/* Task Selector */}
                {mode === 'work' && (
                    <div className="w-full max-w-sm mb-6">
                        <select
                            value={selectedTaskId}
                            onChange={(e) => setSelectedTaskId(e.target.value)}
                            disabled={isRunning}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors disabled:opacity-50 appearance-none"
                        >
                            <option value="">-- Select a task to focus on (Optional) --</option>
                            {tasks.map(task => (
                                <option key={task.id} value={task.id}>
                                    {task.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-4">
                    <button onClick={toggleTimer} className={`px-8 py-3 rounded-full font-bold flex items-center transition-transform active:scale-95 ${isRunning ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-white text-black hover:bg-gray-200'}`}>
                        {isRunning ? <><FiPause className="mr-2"/> Pause</> : <><FiPlay className="mr-2"/> Start</>}
                    </button>
                    <button onClick={resetTimer} className="p-3 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors" aria-label="Reset Timer">
                        <FiRefreshCw size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}