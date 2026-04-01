import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MEDALS = {
    1: { icon: '🥇', color: 'var(--level-gold)',
         bg: 'rgba(241,196,15,0.1)',
         border: 'var(--level-gold)' },
    2: { icon: '🥈', color: '#95a5a6',
         bg: 'rgba(149,165,166,0.1)',
         border: '#95a5a6' },
    3: { icon: '🥉', color: '#cd7f32',
         bg: 'rgba(205,127,50,0.1)',
         border: '#cd7f32' },
}

const LeaderboardEntry = ({ entry, index, showScore = 'total' }) => {
    const navigate  = useNavigate()
    const medal     = MEDALS[entry.rank]
    const isTop3    = entry.rank <= 3

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => navigate(`/profile/${entry.username}`)}
            className="p-4 rounded-2xl border flex items-center
                       gap-4 cursor-pointer transition-all
                       hover:scale-[1.01]"
            style={{
                backgroundColor: entry.isCurrentUser
                    ? 'rgba(79,142,247,0.08)'
                    : isTop3
                        ? medal.bg
                        : 'var(--surface-base)',
                borderColor: entry.isCurrentUser
                    ? 'var(--xp-blue)'
                    : isTop3
                        ? medal.border
                        : 'var(--border-subtle)',
                boxShadow: entry.isCurrentUser
                    ? '0 0 0 1px var(--xp-blue)' : 'none',
            }}>

            {/* Rank */}
            <div className="w-10 text-center flex-shrink-0">
                {isTop3 ? (
                    <span className="text-2xl">{medal.icon}</span>
                ) : (
                    <span className="text-lg font-black"
                          style={{ color: 'var(--text-secondary)' }}>
                        #{entry.rank}
                    </span>
                )}
            </div>

            {/* Level Badge */}
            <div className="w-9 h-9 rounded-full flex items-center
                            justify-center font-black text-sm
                            flex-shrink-0"
                 style={{
                     backgroundColor: 'var(--surface-raised)',
                     color: 'var(--level-gold)',
                     border: '2px solid var(--level-gold)',
                 }}>
                {entry.level}
            </div>

            {/* Name + Title */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold truncate"
                          style={{ color: 'var(--text-primary)' }}>
                        {entry.username}
                    </span>
                    {entry.isCurrentUser && (
                        <span className="text-xs px-2 py-0.5
                                         rounded-full font-bold
                                         flex-shrink-0"
                              style={{
                                  backgroundColor:
                                      'rgba(79,142,247,0.2)',
                                  color: 'var(--xp-blue)',
                              }}>
                            You
                        </span>
                    )}
                </div>
                <div className="text-xs mt-0.5"
                     style={{ color: 'var(--text-secondary)' }}>
                    {entry.levelTitle}
                    {entry.currentDailyStreak > 0 && (
                        <span className="ml-2">
                            🔥 {entry.currentDailyStreak}d
                        </span>
                    )}
                </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
                <div className="font-black text-base"
                     style={{ color: isTop3
                         ? medal.color
                         : 'var(--xp-blue)' }}>
                    {entry.totalScore ?? entry.totalSeasonScore}
                </div>
                <div className="text-xs"
                     style={{ color: 'var(--text-secondary)' }}>
                    pts
                </div>
            </div>
        </motion.div>
    )
}

export default LeaderboardEntry