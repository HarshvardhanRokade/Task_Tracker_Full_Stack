import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BreakdownBar = ({ label, value, max, color, icon, detail }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 text-sm font-bold"
                     style={{ color: 'var(--text-primary)' }}>
                    <span>{icon}</span>
                    <span>{label}</span>
                </div>
                <div className="text-sm font-black"
                     style={{ color }}>
                    {value} pts
                </div>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden"
                 style={{ backgroundColor: 'var(--surface-raised)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8,
                                  ease: 'easeOut',
                                  delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <div className="text-xs mt-1"
                 style={{ color: 'var(--text-secondary)' }}>
                {detail}
            </div>
        </div>
    )
}

const PersonalBreakdown = ({ breakdown }) => {
    const [showRules, setShowRules] = useState(false)

    if (!breakdown) return null

    const maxTaskPoints = 21       // 7 days × 3 HIGH tasks
    const maxPomodoroPoints = 98   // 7 days × (2+3+4+5) sessions
    const maxConsistency = 35      // 7 days × 5

    return (
        <div className="p-5 rounded-2xl border"
             style={{
                 backgroundColor: 'var(--surface-base)',
                 borderColor: 'var(--border-subtle)',
             }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold"
                    style={{ color: 'var(--text-primary)' }}>
                    Your Breakdown
                </h3>
                <div className="text-right">
                    <div className="text-2xl font-black"
                         style={{ color: 'var(--xp-blue)' }}>
                        {breakdown.totalScore}
                    </div>
                    <div className="text-xs"
                         style={{ color: 'var(--text-secondary)' }}>
                        Rank #{breakdown.rank}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <BreakdownBar
                    label="Task Points"
                    value={breakdown.taskPoints}
                    max={maxTaskPoints}
                    color="var(--xp-blue)"
                    icon="📋"
                    detail={`${breakdown.tasksCompleted} tasks completed this week`}
                />
                <BreakdownBar
                    label="Focus Points"
                    value={breakdown.pomodoroPoints}
                    max={maxPomodoroPoints}
                    color="var(--flow-green)"
                    icon="🍅"
                    detail={`${breakdown.pomodorosCompleted} sessions · Consecutive sessions earn bonus points`}
                />
                <BreakdownBar
                    label="Consistency"
                    value={breakdown.consistencyPoints}
                    max={maxConsistency}
                    color="var(--streak-orange)"
                    icon="🔥"
                    detail={`${breakdown.daysActive}/7 days active · +5 pts per day`}
                />
            </div>

            {breakdown.daysActive < 7 && (
                <div className="mt-4 p-3 rounded-xl text-xs text-center"
                     style={{
                         backgroundColor: 'rgba(243,156,18,0.1)',
                         color: 'var(--streak-orange)',
                         border: '1px solid rgba(243,156,18,0.3)',
                     }}>
                    ⚡ Stay active {7 - breakdown.daysActive} more day
                    {7 - breakdown.daysActive !== 1 ? 's' : ''} this
                    week to max your consistency bonus
                </div>
            )}

            {/* --- RULES TOGGLE SECTION --- */}
            <div className="mt-4 border-t pt-4"
                 style={{ borderColor: 'var(--border-subtle)' }}>

                <button
                    onClick={() => setShowRules(prev => !prev)}
                    className="flex items-center gap-2 text-xs font-bold
                               w-full transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}>
                    <span>{showRules ? '▲' : '▼'}</span>
                    How is my score calculated?
                </button>

                <AnimatePresence>
                    {showRules && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 text-xs overflow-hidden"
                            style={{ color: 'var(--text-secondary)' }}>

                            <div className="p-3 rounded-xl"
                                 style={{
                                     backgroundColor: 'var(--surface-raised)'
                                 }}>
                                <p className="font-bold mb-2"
                                   style={{ color: 'var(--text-primary)' }}>
                                    📋 Task Points
                                </p>
                                <p>HIGH quest = 3 pts · MEDIUM = 2 pts · LOW = 1 pt</p>
                                <p className="mt-1">
                                    Daily cap: 3 HIGH, 5 MEDIUM, 10 LOW quests score
                                    per day — quality over quantity.
                                </p>
                                <p className="mt-1">
                                    Quests need at least 1 hour from creation to
                                    completion — because real work takes real time.
                                </p>
                            </div>

                            <div className="p-3 rounded-xl"
                                 style={{
                                     backgroundColor: 'var(--surface-raised)'
                                 }}>
                                <p className="font-bold mb-2"
                                   style={{ color: 'var(--text-primary)' }}>
                                    🍅 Focus Points
                                </p>
                                <p>
                                    Each session = 2 pts base. Consecutive sessions
                                    in the same day earn bonus points — 2, 3, 4, 5...
                                </p>
                                <p className="mt-1">
                                    Four sessions in one day = 14 pts.
                                    Sustained focus is rewarded.
                                </p>
                            </div>

                            <div className="p-3 rounded-xl"
                                 style={{
                                     backgroundColor: 'var(--surface-raised)'
                                 }}>
                                <p className="font-bold mb-2"
                                   style={{ color: 'var(--text-primary)' }}>
                                    🔥 Consistency Points
                                </p>
                                <p>
                                    +5 pts for every day you complete at least one
                                    quest or focus session. Maximum 35 pts per week.
                                </p>
                                <p className="mt-1">
                                    Showing up every day beats doing everything
                                    in one sitting.
                                </p>
                            </div>

                            <p className="text-center pt-1 pb-2"
                               style={{ color: 'var(--text-secondary)' }}>
                                Scores reset every Monday at midnight.
                                Season scores accumulate across all weeks.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default PersonalBreakdown