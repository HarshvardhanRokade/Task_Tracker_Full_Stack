import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { leaderboardApi } from '../api/gameApi'
import LeaderboardEntry from '../leaderboard/LeaderboardEntry'
import PersonalBreakdown from '../leaderboard/PersonalBreakdown'
import WeekCountdown from '../leaderboard/WeekCountdown'
import { SkeletonBox } from '../components/ui/Skeleton'

const TABS = [
    { label: '📅 This Week', value: 'weekly' },
    { label: '🏆 Season',    value: 'season' },
]

const LeaderboardPage = () => {
    const [tab, setTab]         = useState('weekly')
    const [weekly, setWeekly]   = useState(null)
    const [season, setSeason]   = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            try {
                const [w, s] = await Promise.all([
                    leaderboardApi.getWeekly(),
                    leaderboardApi.getSeason(),
                ])
                setWeekly(w.data)
                setSeason(s.data)
            } catch (err) {
                console.error('Failed to load leaderboard', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto py-6">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-black"
                        style={{ color: 'var(--text-primary)' }}>
                        Leaderboard
                    </h2>
                    <p className="text-sm mt-1"
                       style={{ color: 'var(--text-secondary)' }}>
                        Compete weekly. Dominate the season.
                    </p>
                </div>
                {weekly?.weekInfo && (
                    <WeekCountdown
                        secondsUntilReset={
                            weekly.weekInfo.secondsUntilReset}
                    />
                )}
            </div>

            {/* Week Info Banner */}
            {weekly?.weekInfo && (
                <div className="p-3 rounded-xl mb-4 text-sm
                                flex justify-between items-center"
                     style={{
                         backgroundColor: 'var(--surface-base)',
                         border: '1px solid var(--border-subtle)',
                     }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        📅 {weekly.weekInfo.weekStartDate} —{' '}
                        {weekly.weekInfo.weekEndDate}
                    </span>
                    <span className="font-bold text-xs"
                          style={{ color: 'var(--xp-blue)' }}>
                        {weekly.weekInfo.currentSeasonName}
                    </span>
                </div>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-xl border mb-6"
                 style={{
                     backgroundColor: 'var(--surface-base)',
                     borderColor: 'var(--border-subtle)',
                 }}>
                {TABS.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className="flex-1 py-2 px-3 rounded-lg
                                   text-sm font-bold transition-all"
                        style={{
                            backgroundColor: tab === t.value
                                ? 'var(--xp-blue)' : 'transparent',
                            color: tab === t.value
                                ? '#fff' : 'var(--text-secondary)',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                        <SkeletonBox key={i} height="5rem"
                                     className="rounded-2xl" />
                    ))}
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {tab === 'weekly' ? (
                        <motion.div
                            key="weekly"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4">

                            {/* Personal Breakdown */}
                            <PersonalBreakdown
                                breakdown={weekly?.personalBreakdown}
                            />

                            {/* Current Week Rankings */}
                            <div>
                                <h3 className="font-bold text-sm
                                               uppercase tracking-wider
                                               mb-3"
                                    style={{
                                        color: 'var(--text-secondary)'
                                    }}>
                                    This Week
                                </h3>
                                <div className="space-y-2">
                                    {weekly?.currentWeek?.length > 0
                                        ? weekly.currentWeek.map(
                                            (entry, i) => (
                                                <LeaderboardEntry
                                                    key={entry.userId}
                                                    entry={entry}
                                                    index={i}
                                                />
                                            ))
                                        : (
                                            <div className="text-center
                                                            py-8"
                                                 style={{
                                                     color: 'var(--text-secondary)'
                                                 }}>
                                                No activity this week yet.
                                                Complete tasks to appear!
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            {/* Last Week Champions */}
                            {weekly?.lastWeek?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-bold text-sm
                                                   uppercase tracking-wider
                                                   mb-3"
                                        style={{
                                            color: 'var(--text-secondary)'
                                        }}>
                                        🏛️ Last Week's Champions
                                    </h3>
                                    <div className="space-y-2">
                                        {weekly.lastWeek
                                            .slice(0, 3)
                                            .map((entry, i) => (
                                                <LeaderboardEntry
                                                    key={entry.userId}
                                                    entry={entry}
                                                    index={i}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-xs pt-2"
                               style={{
                                   color: 'var(--text-secondary)'
                               }}>
                                Scores update hourly ·
                                Click any player to view their profile
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="season"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}>

                            {/* Season Info */}
                            {season && (
                                <div className="p-4 rounded-2xl
                                                border mb-4"
                                     style={{
                                         backgroundColor:
                                             'rgba(241,196,15,0.08)',
                                         borderColor:
                                             'var(--level-gold)',
                                     }}>
                                    <div className="font-black text-lg"
                                         style={{
                                             color: 'var(--level-gold)'
                                         }}>
                                        🏆 {season.seasonName}
                                    </div>
                                    <div className="text-sm mt-1"
                                         style={{
                                             color: 'var(--text-secondary)'
                                         }}>
                                        {season.startDate} —{' '}
                                        {season.endDate}
                                    </div>
                                    <div className="text-xs mt-2"
                                         style={{
                                             color: 'var(--text-secondary)'
                                         }}>
                                        Top 3 at season end earn
                                        permanent badges 🥇🥈🥉
                                    </div>
                                </div>
                            )}

                            {/* Season Rankings */}
                            <div className="space-y-2">
                                {season?.entries?.length > 0
                                    ? season.entries.map((entry, i) => (
                                        <LeaderboardEntry
                                            key={entry.userId}
                                            entry={entry}
                                            index={i}
                                        />
                                    ))
                                    : (
                                        <div className="text-center py-8"
                                             style={{
                                                 color: 'var(--text-secondary)'
                                             }}>
                                            No season data yet.
                                            Keep earning weekly points!
                                        </div>
                                    )
                                }
                            </div>

                            <p className="text-center text-xs pt-4"
                               style={{
                                   color: 'var(--text-secondary)'
                               }}>
                                Season score = sum of all weekly scores
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    )
}

export default LeaderboardPage