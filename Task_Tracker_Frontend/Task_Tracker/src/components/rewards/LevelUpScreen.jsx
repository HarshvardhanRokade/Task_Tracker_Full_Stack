// src/components/rewards/LevelUpScreen.jsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const LevelUpScreen = ({ isVisible, newLevel, levelName, gemBonus, onDismiss }) => {

  useEffect(() => {
    if (isVisible) {
      // Fire confetti when level-up screen appears
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f1c40f', '#4f8ef7', '#9b59b6', '#2ecc71']
      })
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '2px solid var(--level-gold)',
              borderRadius: '1.5rem',
              padding: '3rem',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 0 60px rgba(241, 196, 15, 0.3)',
            }}
          >
            {/* Level Up Label */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                color: 'var(--level-gold)',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                letterSpacing: '0.2em',
                marginBottom: '0.5rem',
              }}
            >
              ⚡ LEVEL UP
            </motion.div>

            {/* Level Number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              style={{
                fontSize: '5rem',
                fontWeight: 'bold',
                color: 'var(--level-gold)',
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {newLevel}
            </motion.div>

            {/* Level Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                color: 'var(--text-primary)',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
              }}
            >
              {levelName}
            </motion.div>

            {/* Gem Bonus */}
            {gemBonus > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  backgroundColor: 'var(--surface-base)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  marginBottom: '1.5rem',
                  color: 'var(--gem-purple)',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                💎 +{gemBonus} Gems Awarded!
              </motion.div>
            )}

            {/* Dismiss Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onDismiss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'var(--level-gold)',
                color: '#000',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Keep Going! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LevelUpScreen