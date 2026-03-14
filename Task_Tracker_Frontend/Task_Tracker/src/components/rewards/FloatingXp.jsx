// src/components/rewards/FloatingXp.jsx
import { motion, AnimatePresence } from 'framer-motion'

const FloatingXp = ({ amount, isVisible, onComplete }) => {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -80, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            color: 'var(--xp-blue)',
            fontSize: '2rem',
            fontWeight: 'bold',
            textShadow: '0 0 20px var(--xp-blue)',
          }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingXp