import React, { useState, useEffect, useRef } from 'react'; // ✨ NEW: Added useRef
import { FiPlay, FiPause, FiRefreshCw, FiCoffee, FiBriefcase, FiInfo, FiX } from 'react-icons/fi';

const WORK_TIME = 25 * 60; 
const BREAK_TIME = 5 * 60; 

export default function PomodoroTimer({ tasks = [], onPomodoroComplete }) {
    const [mode, setMode] = useState('work');
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [showInfo, setShowInfo] = useState(false);
    
    // ✨ NEW: Reference to track where the user clicks
    const infoRef = useRef(null);

    // ✨ NEW: Close popup if clicked outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (infoRef.current && !infoRef.current.contains(event.target)) {
                setShowInfo(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsRunning(false);
            if (mode === 'work') {
                if (selectedTaskId && onPomodoroComplete) onPomodoroComplete(selectedTaskId);
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
        <div className="bg-[#272757] border border-[#505081] rounded-2xl p-8 shadow-2xl relative flex flex-col items-center max-w-lg mx-auto mt-6">
            
            {/* ✨ NEW: Wrap both the button and popup in the ref */}
            <div ref={infoRef}>
                <button 
                    onClick={() => setShowInfo(!showInfo)} 
                    className="absolute top-5 right-5 text-[#8686AC] hover:text-white bg-[#0F0E47] hover:bg-[#505081] p-1.5 rounded-lg transition-colors z-40"
                >
                    {showInfo ? <FiX size={18} /> : <FiInfo size={18} />}
                </button>

                {showInfo && (
                    <div className="absolute top-14 right-5 w-64 bg-[#0F0E47] border border-[#505081] rounded-xl p-5 text-sm text-[#8686AC] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-base">
                            <FiInfo className="text-blue-400" /> Pomodoro Technique
                        </h4>
                        <ol className="list-decimal pl-4 space-y-2 marker:text-[#505081]">
                            <li>Pick a specific task below.</li>
                            <li>Click <strong className="text-white">Start</strong> and focus for 25 minutes.</li>
                            <li>Earn a 🍅 when the timer rings!</li>
                            <li>Take a 5-minute break.</li>
                        </ol>
                    </div>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-[#0F0E47] p-1.5 rounded-xl border border-[#505081] mb-8 w-full max-w-[260px]">
                <button 
                    onClick={() => switchMode('work')} 
                    className={`flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'work' ? 'bg-blue-600 text-white shadow-md' : 'text-[#8686AC] hover:text-white'}`}
                >
                    <FiBriefcase className="mr-2" /> Focus
                </button>
                <button 
                    onClick={() => switchMode('break')} 
                    className={`flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'break' ? 'bg-[#505081] text-white shadow-md' : 'text-[#8686AC] hover:text-white'}`}
                >
                    <FiCoffee className="mr-2" /> Break
                </button>
            </div>

            {/* Timer Display */}
            <div className="text-8xl font-black tracking-tight text-white mb-10 font-mono tabular-nums drop-shadow-md">
                {formatTime(timeLeft)}
            </div>

            {/* Task Selector */}
            {mode === 'work' && (
                <div className="w-full mb-8 relative max-w-sm">
                    <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        disabled={isRunning}
                        className="w-full bg-[#0F0E47] border border-[#505081] hover:border-[#8686AC] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-[#8686AC] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all disabled:opacity-50 appearance-none shadow-sm cursor-pointer"
                    >
                        <option value="">-- Select a task to focus on (Optional) --</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
                <button 
                    onClick={toggleTimer} 
                    className={`px-10 py-4 rounded-full font-bold flex items-center transition-all active:scale-95 shadow-sm text-lg
                        ${isRunning 
                            ? 'bg-[#0F0E47] text-white border border-[#505081] hover:bg-[#505081]' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_5px_15px_rgba(37,99,235,0.3)]'}`}
                >
                    {isRunning ? <><FiPause className="mr-2"/> Pause</> : <><FiPlay className="mr-2"/> Start</>}
                </button>
                <button 
                    onClick={resetTimer} 
                    className="p-4 bg-[#0F0E47] border border-[#505081] text-[#8686AC] rounded-full hover:bg-[#505081] hover:text-white transition-all shadow-sm"
                >
                    <FiRefreshCw size={22} />
                </button>
            </div>

        </div>
    );
}