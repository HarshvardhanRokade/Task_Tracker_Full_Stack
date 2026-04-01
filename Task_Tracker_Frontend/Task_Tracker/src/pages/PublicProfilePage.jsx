import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { leaderboardApi } from '../api/gameApi'
import { SkeletonBox, SkeletonStatCard } from '../components/ui/Skeleton'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from 'recharts'

// --- Sub Components ---

const StatCard = ({ icon, value, label, color }) => (
    <div className="p-4 rounded-xl border text-center"
         style={{
             backgroundColor: 'var(--surface-base)',
             borderColor: 'var(--border-subtle)',
         }}>
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xl font-black"
             style={{ color: color || 'var(--text-primary)' }}>
            {typeof value === 'number'
                ? value.toLocaleString() : value}
        </div>
        <div className="text-xs mt-0.5 uppercase tracking-wider"
             style={{ color: 'var(--text-secondary)' }}>
            {label}
        </div>
    </div>
)

const BadgeCard = ({ badge, locked = false }) => (
    <div
        className="p-3 rounded-xl border text-center transition-all"
        style={{
            backgroundColor: locked
                ? 'var(--surface-base)'
                : 'var(--surface-raised)',
            borderColor: locked
                ? 'var(--border-subtle)'
                : 'var(--level-gold)',
            opacity: locked ? 0.5 : 1,
        }}
        title={locked
            ? `Locked: ${badge.description}`
            : badge.description}>
        <div className="text-2xl mb-1" style={{
            filter: locked ? 'grayscale(100%)' : 'none'
        }}>
            {locked ? '🔒' : badge.icon}
        </div>
        <div className="text-xs font-bold leading-tight"
             style={{ color: locked
                 ? 'var(--text-secondary)'
                 : 'var(--text-primary)' }}>
            {badge.name}
        </div>
        {!locked && badge.earnedAt && (
            <div className="text-xs mt-0.5"
                 style={{ color: 'var(--text-secondary)' }}>
                {badge.earnedAt}
            </div>
        )}
    </div>
)

// --- Main Page ---

const PublicProfilePage = () => {
    const { username } = useParams()
    const navigate     = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(null)

    useEffect(() => {
        leaderboardApi.getProfile(username)
            .then(res => setProfile(res.data))
            .catch(err => {
                if (err.response?.status === 404) {
                    setError('Player not found.')
                } else {
                    setError('Failed to load profile.')
                }
            })
            .finally(() => setLoading(false))
    }, [username])

    if (loading) return (
        <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4 p-6 rounded-2xl border"
                 style={{
                     backgroundColor: 'var(--surface-base)',
                     borderColor: 'var(--border-subtle)',
                 }}>
                <SkeletonBox width="5rem" height="5rem"
                             className="rounded-full" />
                <div className="flex-1">
                    <SkeletonBox height="1.75rem" width="40%"
                                 className="mb-2" />
                    <SkeletonBox height="1rem" width="25%"
                                 className="mb-1" />
                    <SkeletonBox height="0.875rem" width="35%" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>
        </div>
    )

    if (error) return (
        <div className="max-w-3xl mx-auto py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-bold mb-2"
               style={{ color: 'var(--text-primary)' }}>
                {error}
            </p>
            <button
                onClick={() => navigate('/leaderboard')}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-bold"
                style={{
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--xp-blue)',
                    border: '1px solid var(--xp-blue)',
                }}>
                ← Back to Leaderboard
            </button>
        </div>
    )

    const allBadges = [
        ...profile.earnedBadges,
        ...profile.lockedBadges,
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto py-6 space-y-6">

            {/* Back button */}
            <button
                onClick={() => navigate('/leaderboard')}
                className="flex items-center gap-2 text-sm font-bold
                           transition-colors hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}>
                ← Leaderboard
            </button>

            {/* Hero Card */}
            <div className="p-6 rounded-2xl border"
                 style={{
                     backgroundColor: 'var(--surface-raised)',
                     borderColor: profile.isCurrentUser
                         ? 'var(--xp-blue)'
                         : 'var(--border-subtle)',
                 }}>
                <div className="flex items-center gap-5">

                    {/* Level Circle */}
                    <div className="w-20 h-20 rounded-full flex
                                    items-center justify-center
                                    font-black text-3xl flex-shrink-0"
                         style={{
                             backgroundColor: 'var(--surface-base)',
                             color: 'var(--level-gold)',
                             border: '3px solid var(--level-gold)',
                         }}>
                        {profile.level}
                    </div>

                    {/* Identity */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3
                                        flex-wrap">
                            <h1 className="text-2xl font-black"
                                style={{
                                    color: 'var(--text-primary)'
                                }}>
                                {profile.username}
                            </h1>
                            {profile.isCurrentUser && (
                                <span className="text-xs px-2 py-0.5
                                                 rounded-full font-bold"
                                      style={{
                                          backgroundColor:
                                              'rgba(79,142,247,0.2)',
                                          color: 'var(--xp-blue)',
                                      }}>
                                    This is you
                                </span>
                            )}
                        </div>
                        <div className="font-bold mt-0.5"
                             style={{ color: 'var(--level-gold)' }}>
                            {profile.levelTitle}
                        </div>
                        <div className="text-sm mt-1"
                             style={{ color: 'var(--text-secondary)' }}>
                            Member since {profile.memberSince}
                        </div>
                    </div>

                    {/* Week Rank */}
                    <div className="text-center flex-shrink-0">
                        <div className="text-3xl font-black"
                             style={{ color: 'var(--xp-blue)' }}>
                            #{profile.currentWeekRank}
                        </div>
                        <div className="text-xs"
                             style={{
                                 color: 'var(--text-secondary)'
                             }}>
                            This Week
                        </div>
                        <div className="text-lg font-black mt-1"
                             style={{ color: 'var(--xp-blue)' }}>
                            {profile.currentWeekScore} pts
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard icon="⭐" value={profile.totalXp}
                          label="Lifetime XP"
                          color="var(--xp-blue)" />
                <StatCard icon="🔥"
                          value={`${profile.currentDailyStreak}d`}
                          label="Current Streak"
                          color="var(--streak-orange)" />
                <StatCard icon="🏆"
                          value={`${profile.longestDailyStreak}d`}
                          label="Best Streak"
                          color="var(--level-gold)" />
                <StatCard icon="✅"
                          value={profile.totalTasksCompleted}
                          label="Tasks Done"
                          color="var(--flow-green)" />
                <StatCard icon="🍅"
                          value={profile.totalPomodoroSessions}
                          label="Sessions"
                          color="var(--xp-blue)" />
                <StatCard icon="⚡"
                          value={profile.bestFlowStreak}
                          label="Best Flow"
                          color="var(--flow-green)" />
            </div>

            {/* Score History Chart */}
            {profile.scoreHistory?.length > 0 && (
                <div className="p-5 rounded-2xl border"
                     style={{
                         backgroundColor: 'var(--surface-base)',
                         borderColor: 'var(--border-subtle)',
                     }}>
                    <h3 className="font-bold mb-4"
                        style={{ color: 'var(--text-primary)' }}>
                        Weekly Score History
                    </h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={profile.scoreHistory}
                                  barSize={28}>
                            <XAxis
                                dataKey="weekLabel"
                                tick={{ fill: 'var(--text-secondary)',
                                        fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-secondary)',
                                        fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor:
                                        'var(--surface-raised)',
                                    border:
                                        '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                }}
                                formatter={(value, name) => [
                                    `${value} pts`,
                                    name === 'taskPoints'
                                        ? 'Tasks'
                                        : name === 'pomodoroPoints'
                                            ? 'Pomodoro'
                                            : 'Consistency',
                                ]}
                            />
                            <Bar dataKey="taskPoints"
                                 stackId="a"
                                 fill="var(--xp-blue)"
                                 radius={[0,0,0,0]} />
                            <Bar dataKey="pomodoroPoints"
                                 stackId="a"
                                 fill="var(--flow-green)"
                                 radius={[0,0,0,0]} />
                            <Bar dataKey="consistencyPoints"
                                 stackId="a"
                                 fill="var(--streak-orange)"
                                 radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 justify-center mt-2">
                        {[
                            { color: 'var(--xp-blue)',
                              label: 'Tasks' },
                            { color: 'var(--flow-green)',
                              label: 'Pomodoro' },
                            { color: 'var(--streak-orange)',
                              label: 'Consistency' },
                        ].map(item => (
                            <div key={item.label}
                                 className="flex items-center gap-1.5
                                            text-xs"
                                 style={{
                                     color: 'var(--text-secondary)'
                                 }}>
                                <div className="w-3 h-3 rounded-sm"
                                     style={{
                                         backgroundColor: item.color
                                     }} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Tags */}
            {profile.topTags?.length > 0 && (
                <div className="p-5 rounded-2xl border"
                     style={{
                         backgroundColor: 'var(--surface-base)',
                         borderColor: 'var(--border-subtle)',
                     }}>
                    <h3 className="font-bold mb-4"
                        style={{ color: 'var(--text-primary)' }}>
                        Focus Areas
                    </h3>
                    <div className="space-y-3">
                        {profile.topTags.map((tag, i) => {
                            const max = profile.topTags[0].count
                            const pct = (tag.count / max) * 100
                            return (
                                <div key={tag.tagName}
                                     className="flex items-center gap-3">
                                    <div className="w-20 text-sm
                                                    font-bold text-right
                                                    flex-shrink-0"
                                         style={{
                                             color: 'var(--text-secondary)'
                                         }}>
                                        {tag.tagName}
                                    </div>
                                    <div className="flex-1 h-5
                                                    rounded-full
                                                    overflow-hidden"
                                         style={{
                                             backgroundColor:
                                                 'var(--surface-raised)'
                                         }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${pct}%`
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                delay: i * 0.1
                                            }}
                                            className="h-full
                                                       rounded-full"
                                            style={{
                                                backgroundColor:
                                                    'var(--xp-blue)'
                                            }} />
                                    </div>
                                    <div className="w-8 text-sm
                                                    font-bold
                                                    flex-shrink-0"
                                         style={{
                                             color: 'var(--text-primary)'
                                         }}>
                                        {tag.count}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Badge Shelf */}
            <div className="p-5 rounded-2xl border"
                 style={{
                     backgroundColor: 'var(--surface-base)',
                     borderColor: 'var(--border-subtle)',
                 }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold"
                        style={{ color: 'var(--text-primary)' }}>
                        Badges
                    </h3>
                    <span className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}>
                        {profile.earnedBadges.length} / {
                            profile.earnedBadges.length +
                            profile.lockedBadges.length
                        } earned
                    </span>
                </div>

                {/* Earned */}
                {profile.earnedBadges.length > 0 && (
                    <div className="mb-4">
                        <div className="text-xs font-bold uppercase
                                        tracking-wider mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                            Earned
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5
                                        gap-2">
                            {profile.earnedBadges.map(badge => (
                                <BadgeCard key={badge.badgeKey}
                                           badge={badge} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked */}
                {profile.lockedBadges.length > 0 && (
                    <div>
                        <div className="text-xs font-bold uppercase
                                        tracking-wider mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                            Locked
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5
                                        gap-2">
                            {profile.lockedBadges.map(badge => (
                                <BadgeCard key={badge.badgeKey}
                                           badge={badge}
                                           locked={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default PublicProfilePage