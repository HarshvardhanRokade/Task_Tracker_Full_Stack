import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsApi, badgeApi } from '../api/gameApi'

import { SkeletonBox, SkeletonStatCard, SkeletonBadge } from '../components/ui/Skeleton'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import useCountUp from '../hooks/useCountUp'

const PERIODS = [
    { label: '7D',  value: 'WEEK' },
    { label: '30D', value: 'MONTH' },
    { label: '90D', value: 'QUARTER' },
    { label: 'ALL', value: 'ALL_TIME' },
]

const PRIORITY_COLORS = {
    HIGH:   'var(--danger-red)',
    MEDIUM: 'var(--streak-orange)',
    LOW:    'var(--xp-blue)',
}

const MOTIVATIONAL_MESSAGES = [
    { min: 0,   max: 0,   msg: 'Start your streak today. Every journey begins with one task.' },
    { min: 1,   max: 3,   msg: 'Good start. Keep the momentum going.' },
    { min: 4,   max: 6,   msg: 'Building consistency. You are forming a habit.' },
    { min: 7,   max: 13,  msg: 'One week strong. You are in the zone.' },
    { min: 14,  max: 29,  msg: 'Two weeks of dedication. This is becoming who you are.' },
    { min: 30,  max: 59,  msg: 'A month of consistency. Legendary work.' },
    { min: 60,  max: 99,  msg: 'Two months of discipline. You are exceptional.' },
    { min: 100, max: Infinity, msg: '100 day club. You have mastered consistency.' },
]

const getMotivationalMessage = (streak) =>
    MOTIVATIONAL_MESSAGES.find(m => streak >= m.min && streak <= m.max)?.msg || ''

const formatChartDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date)) return dateStr 
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

const StatCard = ({ label, value, icon, color }) => (
    <div className="p-4 rounded-xl border flex flex-col gap-1"
         style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}>
        <div className="text-2xl">{icon}</div>
        <div className="text-2xl font-black" style={{ color: color || 'var(--text-primary)' }}>
            {value}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider"
             style={{ color: 'var(--text-secondary)' }}>
            {label}
        </div>
    </div>
)

const SectionTitle = ({ children }) => (
    <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        {children}
    </h2>
)

const EmptyState = ({ message }) => (
    <div className="flex items-center justify-center h-32 rounded-xl border border-dashed"
         style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <p className="text-sm">{message}</p>
    </div>
)

const DashboardPage = () => {
    const [period, setPeriod]           = useState('WEEK')
    const [summary, setSummary]         = useState(null)
    const [taskData, setTaskData]       = useState(null)
    const [pomodoroData, setPomodoroData] = useState(null)
    const [progression, setProgression] = useState(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState(null)
    const [badges, setBadges]           = useState([])

    useEffect(() => {
        analyticsApi.getSummary()
            .then(res => setSummary(res.data))
            .catch(() => setError('Failed to load summary.'))
            
        badgeApi.getMyBadges()
            .then(res => setBadges(res.data))
            .catch(() => {}) 
    }, [])

    const fetchPeriodData = useCallback(async () => {
        setLoading(true)
        try {
            const [tasks, pomodoro, prog] = await Promise.all([
                analyticsApi.getTasks(period),
                analyticsApi.getPomodoro(period),
                analyticsApi.getProgression(period),
                new Promise(resolve => setTimeout(resolve, 400))
            ])
            setTaskData(tasks.data)
            setPomodoroData(pomodoro.data)
            setProgression(prog.data)
        } catch {
            setError('Failed to load analytics data.')
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => { fetchPeriodData() }, [fetchPeriodData])

    const animatedTasks      = useCountUp(summary?.totalTasksCompleted || 0)
    const animatedSessions   = useCountUp(summary?.totalPomodoroSessions || 0)
    const animatedStreak     = useCountUp(summary?.currentDailyStreak || 0)
    const animatedBestStreak = useCountUp(summary?.longestDailyStreak || 0)
    const animatedXp         = useCountUp(summary?.totalXp || 0)

    if (!summary) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto py-8 space-y-8">
            <div className="mb-2">
                <SkeletonBox height="2.5rem" width="14rem" className="rounded-lg" />
            </div>

            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-4 mb-4">
                    <SkeletonBox height="4rem" width="4rem" className="rounded-full" />
                    <div>
                        <SkeletonBox height="2rem" width="14rem" className="mb-2 rounded-md" />
                        <SkeletonBox height="1rem" width="18rem" className="rounded-md" />
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                        <SkeletonBox height="2.5rem" width="8rem" className="mb-2 rounded-md" />
                        <SkeletonBox height="1rem" width="6rem" className="rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <SkeletonBox height="2rem" width="18rem" className="rounded-lg" />
                <SkeletonBox height="2.5rem" width="14rem" className="rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonBox height="18rem" className="rounded-2xl" />
                <SkeletonBox height="18rem" className="rounded-2xl" />
            </div>
        </motion.div>
    )

    const priorityChartData = taskData
        ? Object.entries(taskData.byPriority).map(([name, value]) => ({ name, value }))
        : []

    const xpChartData = progression?.xpByPeriod || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-8 space-y-8"
        >
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Dashboard
                </h1>
            </div>

            {/* ── HERO CARD ── */}
            <div className="p-6 rounded-2xl border"
                 style={{ backgroundColor: 'var(--surface-raised)',
                          borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center
                                    text-2xl font-black border-4"
                         style={{ backgroundColor: 'var(--surface-base)',
                                  color: 'var(--level-gold)',
                                  borderColor: 'var(--level-gold)' }}>
                        {summary.currentLevel}
                    </div>
                    <div>
                        <div className="text-2xl font-black"
                             style={{ color: 'var(--level-gold)' }}>
                            {summary.levelTitle}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {getMotivationalMessage(summary.currentDailyStreak)}
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-3xl font-black"
                             style={{ color: 'var(--xp-blue)' }}>
                            {animatedXp.toLocaleString()} XP
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Lifetime Total
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <StatCard label="Tasks Done"
                              value={animatedTasks}
                              icon="✅"
                              color="var(--flow-green)" />
                    <StatCard label="Focus Sessions"
                              value={animatedSessions}
                              icon="🍅"
                              color="var(--xp-blue)" />
                    <StatCard label="Current Streak"
                              value={`${animatedStreak}d`}
                              icon="🔥"
                              color="var(--streak-orange)" />
                    <StatCard label="Best Streak"
                              value={`${animatedBestStreak}d`}
                              icon="🏆"
                              color="var(--level-gold)" />
                </div>
            </div>

            {/* ── PERIOD SELECTOR ── */}
            <div className="flex items-center justify-between mt-8">
                <h2 className="text-xl font-bold"
                    style={{ color: 'var(--text-primary)' }}>
                    Performance Analytics
                </h2>
                <div className="flex gap-1 p-1 rounded-xl border"
                     style={{ backgroundColor: 'var(--surface-base)',
                              borderColor: 'var(--border-subtle)' }}>
                    {PERIODS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
                            style={{
                                backgroundColor: period === p.value
                                    ? 'var(--xp-blue)' : 'transparent',
                                color: period === p.value
                                    ? '#fff' : 'var(--text-secondary)',
                            }}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="skeleton"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SkeletonBox height="18rem" className="rounded-2xl" />
                            <SkeletonBox height="18rem" className="rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <SkeletonBox height="16rem" className="rounded-2xl" />
                            </div>
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
                            </div>
                        </div>
                        <SkeletonBox height="20rem" className="rounded-2xl" />

                        {/* Achievements Skeleton */}
                        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-subtle)' }}>
                            <SkeletonBox height="1.5rem" width="10rem" className="mb-4" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(i => <SkeletonBadge key={i} />)}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="charts"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                        className="space-y-8"
                    >
                        {/* ── TASK PERFORMANCE ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ErrorBoundary>
                                <div className="p-5 rounded-2xl border"
                                     style={{ backgroundColor: 'var(--surface-base)',
                                              borderColor: 'var(--border-subtle)' }}>
                                    <SectionTitle>Tasks Completed</SectionTitle>
                                    {taskData?.dailyCompletions?.length > 0 ? (
                                        <ResponsiveContainer width="99%" height={200} minWidth={1} minHeight={1}>
                                            <BarChart data={taskData.dailyCompletions}>
                                                <XAxis dataKey="date"
                                                       tickFormatter={formatChartDate}
                                                       tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                                       allowDecimals={false} />
                                                <Tooltip
                                                    labelFormatter={formatChartDate} 
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface-raised)',
                                                        border: '1px solid var(--border-subtle)',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-primary)'
                                                    }} />
                                                <Bar dataKey="count"
                                                     fill="var(--xp-blue)"
                                                     radius={[4,4,0,0]}
                                                     name="Tasks" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState message="No completed tasks in this period." />
                                    )}
                                </div>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <div className="p-5 rounded-2xl border flex flex-col h-full"
                                     style={{ backgroundColor: 'var(--surface-base)',
                                              borderColor: 'var(--border-subtle)' }}>
                                    <SectionTitle>By Priority</SectionTitle>
                                    {priorityChartData.some(d => d.value > 0) ? (
                                        <div className="flex-1 flex items-center justify-center min-h-[200px]">
                                            <ResponsiveContainer width="99%" height={200} minWidth={1} minHeight={1}>
                                                <PieChart>
                                                    <Pie
                                                        data={priorityChartData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        stroke="none">
                                                        {priorityChartData.map(entry => (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={PRIORITY_COLORS[entry.name]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--surface-raised)',
                                                            border: '1px solid var(--border-subtle)',
                                                            borderRadius: '8px',
                                                            color: 'var(--text-primary)'
                                                        }} />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={36}
                                                        formatter={(value) => (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }}>
                                                                {value}
                                                            </span>
                                                        )} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <EmptyState message="No task data for this period." />
                                    )}
                                </div>
                            </ErrorBoundary>
                        </div>

                        {/* ── TOP TAGS ── */}
                        <ErrorBoundary>
                            <div className="p-5 rounded-2xl border"
                                 style={{ backgroundColor: 'var(--surface-base)',
                                          borderColor: 'var(--border-subtle)' }}>
                                <SectionTitle>Top Tags</SectionTitle>
                                {taskData?.topTags?.length > 0 ? (
                                    <div className="space-y-3">
                                        {taskData.topTags.map((tag, i) => {
                                            const maxCount = taskData.topTags[0].count
                                            const pct = (tag.count / maxCount) * 100
                                            return (
                                                <div key={tag.tagName}
                                                     className="flex items-center gap-3">
                                                    <div className="w-24 text-sm font-bold text-right"
                                                         style={{ color: 'var(--text-secondary)' }}>
                                                        {tag.tagName}
                                                    </div>
                                                    <div className="flex-1 h-6 rounded-full overflow-hidden"
                                                         style={{ backgroundColor: 'var(--surface-raised)' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.6, delay: i * 0.1 }}
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: 'var(--xp-blue)' }} />
                                                    </div>
                                                    <div className="w-8 text-sm font-bold"
                                                         style={{ color: 'var(--text-primary)' }}>
                                                        {tag.count}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState message="No tagged tasks completed in this period." />
                                )}
                            </div>
                        </ErrorBoundary>

                        {/* ── FOCUS PERFORMANCE ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ErrorBoundary>
                                <div className="md:col-span-2 p-5 rounded-2xl border h-full"
                                     style={{ backgroundColor: 'var(--surface-base)',
                                              borderColor: 'var(--border-subtle)' }}>
                                    <SectionTitle>Focus Sessions</SectionTitle>
                                    {pomodoroData?.dailySessions?.length > 0 ? (
                                        <ResponsiveContainer width="99%" height={200} minWidth={1} minHeight={1}>
                                            <BarChart data={pomodoroData.dailySessions}>
                                                <XAxis dataKey="date"
                                                       tickFormatter={formatChartDate}
                                                       tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                                       allowDecimals={false} />
                                                <Tooltip
                                                    labelFormatter={formatChartDate}
                                                    contentStyle={{
                                                        backgroundColor: 'var(--surface-raised)',
                                                        border: '1px solid var(--border-subtle)',
                                                        borderRadius: '8px',
                                                        color: 'var(--text-primary)'
                                                    }} />
                                                <Bar dataKey="count"
                                                     fill="var(--flow-green)"
                                                     radius={[4,4,0,0]}
                                                     name="Sessions" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState message="No focus sessions in this period." />
                                    )}
                                </div>
                            </ErrorBoundary>

                            <ErrorBoundary>
                                <div className="flex flex-col gap-3">
                                    <StatCard label="Best Flow Streak"
                                              value={`${pomodoroData?.bestFlowStreak || 0}🔗`}
                                              icon="⚡"
                                              color="var(--flow-green)" />
                                    <StatCard label="Avg Multiplier"
                                              value={`${pomodoroData?.averageMultiplier || 1.0}x`}
                                              icon="✨"
                                              color="var(--level-gold)" />
                                    <StatCard label="Pomodoro XP"
                                              value={(pomodoroData?.totalXpFromPomodoros || 0).toLocaleString()}
                                              icon="🍅"
                                              color="var(--xp-blue)" />
                                </div>
                            </ErrorBoundary>
                        </div>

                        {/* ── PROGRESSION TIMELINE ── */}
                        <ErrorBoundary>
                            <div className="p-5 rounded-2xl border"
                                 style={{ backgroundColor: 'var(--surface-base)',
                                          borderColor: 'var(--border-subtle)' }}>
                                <SectionTitle>XP Progression</SectionTitle>
                                {xpChartData.length > 0 ? (
                                    <ResponsiveContainer width="99%" height={220} minWidth={1} minHeight={1}>
                                        <LineChart data={xpChartData}>
                                            <XAxis dataKey="label"
                                                   tickFormatter={formatChartDate}
                                                   tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                            <Tooltip
                                                labelFormatter={formatChartDate} 
                                                contentStyle={{
                                                    backgroundColor: 'var(--surface-raised)',
                                                    border: '1px solid var(--border-subtle)',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)'
                                                }} />
                                            <Line
                                                type="monotone"
                                                dataKey="xp"
                                                stroke="var(--level-gold)"
                                                strokeWidth={2}
                                                dot={{ fill: 'var(--level-gold)', r: 4 }}
                                                name="XP Earned" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState message="Complete quests or sessions to see XP progression." />
                                )}

                                {progression?.levelUps?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t"
                                         style={{ borderColor: 'var(--border-subtle)' }}>
                                        <div className="text-xs font-bold uppercase mb-2"
                                             style={{ color: 'var(--text-secondary)' }}>
                                            Level Ups in This Period
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {progression.levelUps.map((lu, i) => (
                                                <div key={i}
                                                     className="px-3 py-1 rounded-full text-xs font-bold"
                                                     style={{
                                                         backgroundColor: 'rgba(241,196,15,0.15)',
                                                         color: 'var(--level-gold)',
                                                         border: '1px solid var(--level-gold)'
                                                     }}>
                                                    ⚡ Level {lu.level} — {lu.triggeredBy}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ErrorBoundary>

                        {/* ── ACHIEVEMENTS ── */}
                        {badges.length > 0 && (
                            <ErrorBoundary>
                                <div className="p-5 rounded-2xl border"
                                     style={{ backgroundColor: 'var(--surface-base)',
                                              borderColor: 'var(--border-subtle)' }}>
                                    <SectionTitle>Achievements</SectionTitle>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {badges.map(badge => (
                                            <div
                                                key={badge.badgeKey}
                                                className="p-3 rounded-xl text-center border transition-transform hover:scale-105"
                                                style={{
                                                    backgroundColor: 'var(--surface-raised)',
                                                    borderColor: 'var(--border-subtle)',
                                                }}
                                                title={badge.description}>
                                                <div className="text-4xl mb-2">{badge.icon}</div>
                                                <div className="text-xs font-bold mb-1"
                                                     style={{ color: 'var(--text-primary)' }}>
                                                    {badge.name}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider"
                                                     style={{ color: 'var(--text-secondary)' }}>
                                                    {badge.earnedAt}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ErrorBoundary>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default DashboardPage