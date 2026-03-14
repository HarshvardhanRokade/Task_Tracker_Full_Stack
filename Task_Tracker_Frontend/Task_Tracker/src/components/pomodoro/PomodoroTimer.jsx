import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { pomodoroApi } from '../../api/gameApi';
import useGameStore from '../../store/useGameStore';

const PomodoroTimer = () => {
  const { 
    flowStreak, 
    sessionActive, 
    sessionPaused, 
    setSessionActive, 
    setSessionPaused, 
    applyReward, 
    setError 
  } = useGameStore();

  const WORK_TIME = 25 * 60; 
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const isCompletingRef = useRef(false);

  // --- VISUAL SYNC STATE ---
  // Prevents the circles from filling up before the reward toast finishes animating
  const [displayStreak, setDisplayStreak] = useState(flowStreak);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayStreak(flowStreak), 600);
    return () => clearTimeout(timer);
  }, [flowStreak]);

  // --- API HANDLERS ---
  const handleComplete = useCallback(async () => {
    try {
      const response = await pomodoroApi.complete();
      applyReward(response.data);
      
      setSessionActive(false);
      setSessionPaused(false);
      setTimeLeft(WORK_TIME);
    } catch (err) {
      setError('Failed to log completed session.');
    }
  }, [applyReward, setSessionActive, setSessionPaused, setError]);

  useEffect(() => {
    let interval = null;
    if (sessionActive && !sessionPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && sessionActive && !isCompletingRef.current) {
      isCompletingRef.current = true;
      handleComplete().finally(() => {
        isCompletingRef.current = false;
      });
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionPaused, timeLeft, handleComplete]);

  const handleStart = async () => {
    try {
      await pomodoroApi.start();
      setSessionActive(true);
      setSessionPaused(false);
    } catch (err) {
      setError('Failed to start session on the server.');
    }
  };

  const handlePause = async () => {
    try {
      await pomodoroApi.pause();
      setSessionPaused(true);
    } catch (err) {
      setError('Failed to pause session.');
    }
  };

  const handleResume = async () => {
    try {
      await pomodoroApi.resume();
      setSessionPaused(false);
    } catch (err) {
      setError('Failed to resume session.');
    }
  };

  const handleForfeit = async () => {
    try {
      await pomodoroApi.forfeit();
    } catch (err) {
      // Non-critical if it fails on the backend, we still want to reset the UI 
      // so the user isn't trapped in a broken timer.
      console.error('Failed to forfeit on backend', err);
    } finally {
      setSessionActive(false);
      setSessionPaused(false);
      setTimeLeft(WORK_TIME);
    }
  };

  // --- FORMATTING ---
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const calculatedMultiplier = Math.min(1.0 + (flowStreak * 0.2), 2.0).toFixed(1);

  return (
    <div 
      className="max-w-md mx-auto p-8 rounded-2xl flex flex-col items-center border shadow-2xl"
      style={{ 
        backgroundColor: 'var(--surface-base)', 
        borderColor: sessionActive && !sessionPaused ? 'var(--flow-green)' : 'var(--border-subtle)',
        transition: 'border-color 0.5s ease'
      }}
    >
      <div 
        className="mb-6 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2"
        style={{ 
          backgroundColor: flowStreak > 0 ? 'rgba(46, 204, 113, 0.1)' : 'var(--surface-raised)',
          color: flowStreak > 0 ? 'var(--flow-green)' : 'var(--text-secondary)',
          border: `1px solid ${flowStreak > 0 ? 'var(--flow-green)' : 'transparent'}`
        }}
      >
        <span>⚡ Flow Multiplier</span>
        <span className="text-lg">{calculatedMultiplier}x</span>
      </div>

      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3, 4].map((index) => {
          // ✨ Now using displayStreak instead of raw flowStreak!
          const isFilled = displayStreak > index;
          const isActiveNode = displayStreak === index && sessionActive && !sessionPaused;
          
          return (
            <motion.div 
              key={index}
              animate={isActiveNode ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
              transition={isActiveNode ? { repeat: Infinity, duration: 2 } : {}}
              className="w-4 h-4 rounded-full border-2"
              style={{
                borderColor: isFilled || isActiveNode ? 'var(--flow-green)' : 'var(--surface-raised)',
                backgroundColor: isFilled ? 'var(--flow-green)' : 'transparent',
              }}
            />
          );
        })}
      </div>

      <div 
        className="text-8xl font-black tabular-nums tracking-tighter mb-10"
        style={{ 
          color: sessionPaused ? 'var(--text-secondary)' : 'var(--text-primary)',
          textShadow: sessionActive && !sessionPaused ? '0 0 40px rgba(46, 204, 113, 0.3)' : 'none'
        }}
      >
        {minutes}:{seconds}
      </div>

      <div className="flex gap-4 w-full">
        {!sessionActive ? (
          <button 
            onClick={handleStart}
            className="flex-1 py-4 rounded-xl font-bold text-lg text-black transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--flow-green)' }}
          >
            Start Focus Session
          </button>
        ) : (
          <>
            <button 
              onClick={sessionPaused ? handleResume : handlePause}
              className="flex-1 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 active:scale-95 border"
              style={{ 
                backgroundColor: sessionPaused ? 'var(--flow-green)' : 'transparent',
                borderColor: 'var(--flow-green)',
                color: sessionPaused ? 'black' : 'var(--flow-green)'
              }}
            >
              {sessionPaused ? 'Resume' : 'Pause'}
            </button>
            <button 
              onClick={handleForfeit}
              className="px-6 py-4 rounded-xl font-bold transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--danger-red)' }}
            >
              Stop
            </button>
          </>
        )}
      </div>
      
      {sessionActive && (
         <button onClick={() => setTimeLeft(2)} className="mt-6 text-xs text-[var(--text-secondary)] hover:text-white underline">
           [Dev: 2s remaining]
         </button>
      )}
    </div>
  );
};

export default PomodoroTimer;