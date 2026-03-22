import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const ErrorToast = () => {
  const { errorMessage, clearError } = useGameStore();

  // Dismiss error after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        clearError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError]);

  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          // We keep your top-center positioning but add backdrop-blur for a premium feel
          className="fixed top-8 left-1/2 z-[9999] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 border backdrop-blur-md"
          style={{ 
            backgroundColor: 'rgba(28, 15, 15, 0.9)', // Deep dark red
            borderColor: 'var(--danger-red)',
            color: 'white',
            x: '-50%' 
          }}
          initial={{ opacity: 0, y: -100, x: '-50%' }} // Start further off-screen
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Pulsing Warning Icon */}
          <span className="text-xl animate-pulse">⚠️</span>
          
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest opacity-50 text-[var(--danger-red)]">Quest Error</span>
            <span className="font-bold text-sm">{errorMessage}</span>
          </div>

          <button 
            onClick={clearError}
            className="ml-4 p-1 rounded-full hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;