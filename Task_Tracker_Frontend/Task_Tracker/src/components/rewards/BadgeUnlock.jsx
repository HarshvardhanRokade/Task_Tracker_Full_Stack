import { motion, AnimatePresence } from 'framer-motion'

const BadgeUnlock = ({ badge, isVisible, onDismiss }) => (
    <AnimatePresence>
        {isVisible && badge && (
            <motion.div
                // Drops down from the top-right corner
                initial={{ opacity: 0, x: 50, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, y: -20, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                    position: 'fixed',
                    top: '2rem',  
                    right: '2rem', // ✨ CHANGED: Switched from left to right
                    backgroundColor: 'var(--surface-raised)',
                    border: '2px solid var(--level-gold)',
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    zIndex: 9999,
                    minWidth: '280px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(241,196,15,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    borderLeft: '4px solid var(--level-gold)' // Adds a nice accent bar
                }}
                onClick={onDismiss}
            >
                <div style={{ 
                    fontSize: '2.5rem',
                    filter: 'drop-shadow(0 0 10px rgba(241,196,15,0.4))' 
                }}>
                    {badge.icon}
                </div>
                <div>
                    <div style={{
                        color: 'var(--level-gold)',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: '0.2rem',
                    }}>
                        New Achievement
                    </div>
                    <div style={{
                        color: 'var(--text-primary)',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                    }}>
                        {badge.name}
                    </div>
                    <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        marginTop: '0.2rem',
                        lineHeight: '1.4'
                    }}>
                        {badge.description}
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
)

export default BadgeUnlock