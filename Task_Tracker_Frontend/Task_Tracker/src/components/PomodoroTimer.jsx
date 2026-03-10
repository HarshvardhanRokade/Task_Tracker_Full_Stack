import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiRefreshCw, FiCoffee, FiBriefcase, FiInfo, FiX } from 'react-icons/fi';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WORK_TIME = 25 * 60; 
const BREAK_TIME = 5 * 60; 

export default function PomodoroTimer({ tasks = [], onPomodoroComplete }) {
    const [mode, setMode] = useState('work');
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState("");
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
                toast.success("Pomodoro finished! Time for a short break.");
            } else {
                setMode('work');
                setTimeLeft(WORK_TIME);
                toast.error("Break is over! Time to get back to work.");
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
        // ✨ STYLED: Premium container matching DashboardStats
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl relative flex flex-col items-center">
            
            <button 
                onClick={() => setShowInfo(!showInfo)}
                className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-20"
                aria-label="How to use this timer"
            >
                {showInfo ? <FiX size={18} /> : <FiInfo size={18} />}
            </button>

            {/* ✨ STYLED: Floating glass popover */}
            {showInfo && (
                <div className="absolute top-14 right-5 w-64 bg-[#1a1a1a] border border-white/5 rounded-xl p-5 text-sm text-gray-300 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
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

            {/* ✨ STYLED: Sleek Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-8 w-full max-w-[240px]">
                <button 
                    onClick={() => switchMode('work')} 
                    className={`flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'work' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <FiBriefcase className="mr-2" /> Focus
                </button>
                <button 
                    onClick={() => switchMode('break')} 
                    className={`flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'break' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <FiCoffee className="mr-2" /> Break
                </button>
            </div>

            {/* ✨ STYLED: Tabular Nums keeps the text from shifting, bumped size to 7xl */}
            <div className="text-7xl font-black tracking-tight text-white mb-8 font-mono tabular-nums">
                {formatTime(timeLeft)}
            </div>

            {/* Task Selector */}
            {mode === 'work' && (
                <div className="w-full mb-8 relative">
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        disabled={isRunning}
                        // ✨ STYLED: Matches CustomDropdown exactly
                        className="w-full bg-[#121212] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50 appearance-none shadow-sm cursor-pointer"
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

            {/* ✨ STYLED: Premium Buttons */}
            <div className="flex gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`px-8 py-3.5 rounded-full font-bold flex items-center transition-all active:scale-95 shadow-sm
                        ${isRunning 
                            ? 'bg-white/10 text-white border border-white/5 hover:bg-white/20' 
                            : 'bg-white text-black hover:bg-gray-200 hover:-translate-y-0.5 shadow-[0_5px_15px_rgba(255,255,255,0.1)]'}`}
                >
                    {isRunning ? <><FiPause className="mr-2"/> Pause</> : <><FiPlay className="mr-2"/> Start</>}
                </button>
                <button 
                    onClick={resetTimer} 
                    className="p-3.5 bg-white/5 border border-white/5 text-gray-400 rounded-full hover:bg-white/10 hover:text-white transition-all" 
                    aria-label="Reset Timer"
                >
                    <FiRefreshCw size={20} />
                </button>
            </div>

            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
        </div>
    );
}