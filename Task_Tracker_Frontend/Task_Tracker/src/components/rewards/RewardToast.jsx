// src/components/rewards/RewardToast.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Zap, Flame } from 'lucide-react'

const RewardToast = ({ reward, isVisible, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && reward && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            zIndex: 9998,
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div style={{ 
            color: 'var(--flow-green)', 
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            letterSpacing: '0.05em'
          }}>
            ✅ SESSION COMPLETE
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: 'var(--xp-blue)', 
                fontSize: '1.4rem', 
                fontWeight: 'bold' 
              }}>
                +{reward.xpEarned}
              </div>
              <div style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.7rem' 
              }}>XP</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: 'var(--gem-purple)', 
                fontSize: '1.4rem', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Gem size={18} /> {reward.gemsEarned}
              </div>
              <div style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.7rem' 
              }}>GEMS</div>
            </div>

            {reward.multiplierApplied > 1.0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  color: 'var(--flow-green)', 
                  fontSize: '1.4rem', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={18} /> {reward.multiplierApplied}x
                </div>
                <div style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.7rem' 
                }}>FLOW</div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: 'var(--streak-orange)', 
                fontSize: '1.4rem', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Flame size={18} /> {reward.dailyStreak}
              </div>
              <div style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.7rem' 
              }}>STREAK</div>
            </div>
          </div>

          {/* Freeze Used Warning */}
          {reward.freezeUsed && (
            <div style={{ 
              color: 'var(--streak-orange)', 
              fontSize: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              🧊 Streak Freeze used — streak protected!
            </div>
          )}

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '0.4rem',
              backgroundColor: 'var(--surface-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            Continue
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RewardToast