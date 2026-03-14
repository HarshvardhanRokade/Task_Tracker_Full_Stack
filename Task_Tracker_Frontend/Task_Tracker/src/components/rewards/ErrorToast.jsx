import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/useGameStore';

const ErrorToast = () => {
  const { errorMessage, clearError } = useGameStore();

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
          className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 border"
          style={{ 
            backgroundColor: 'var(--surface-raised)', 
            borderColor: 'var(--danger-red)',
            color: 'var(--text-primary)',
            x: '-50%' // Centers it horizontally
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="text-xl">⚠️</span>
          <span className="font-semibold">{errorMessage}</span>
          <button 
            onClick={clearError}
            className="ml-2 text-[var(--text-secondary)] hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;