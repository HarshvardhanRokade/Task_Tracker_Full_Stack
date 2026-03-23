import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsApi } from '../api/gameApi'

// --- CONSTANTS ---
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

// --- SMALL REUSABLE COMPONENTS ---
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

// --- MAIN COMPONENT ---
const DashboardPage = () => {
    const [period, setPeriod]           = useState('WEEK')
    const [summary, setSummary]         = useState(null)
    const [taskData, setTaskData]       = useState(null)
    const [pomodoroData, setPomodoroData] = useState(null)
    const [progression, setProgression] = useState(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState(null)

    // Fetch summary once on mount — never changes with period
    useEffect(() => {
        analyticsApi.getSummary()
            .then(res => setSummary(res.data))
            .catch(() => setError('Failed to load summary.'))
    }, [])

    // Fetch period-dependent data whenever period changes
    const fetchPeriodData = useCallback(async () => {
        setLoading(true)
        try {
            const [tasks, pomodoro, prog] = await Promise.all([
                analyticsApi.getTasks(period),
                analyticsApi.getPomodoro(period),
                analyticsApi.getProgression(period),
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

    if (!summary) return (
        <div className="flex items-center justify-center h-full"
             style={{ color: 'var(--text-secondary)' }}>
            Loading your stats...
        </div>
    )

    // Transform priority data for PieChart
    const priorityChartData = taskData
        ? Object.entries(taskData.byPriority).map(([name, value]) => ({ name, value }))
        : []

    // Transform progression XP data for LineChart
    const xpChartData = progression?.xpByPeriod || []

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-8 space-y-8"
        >
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
                            {summary.totalXp.toLocaleString()} XP
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Lifetime Total
                        </div>
                    </div>
                </div>

                {/* Quick stat pills */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <StatCard label="Tasks Done"
                              value={summary.totalTasksCompleted}
                              icon="✅"
                              color="var(--flow-green)" />
                    <StatCard label="Focus Sessions"
                              value={summary.totalPomodoroSessions}
                              icon="🍅"
                              color="var(--xp-blue)" />
                    <StatCard label="Current Streak"
                              value={`${summary.currentDailyStreak}d`}
                              icon="🔥"
                              color="var(--streak-orange)" />
                    <StatCard label="Best Streak"
                              value={`${summary.longestDailyStreak}d`}
                              icon="🏆"
                              color="var(--level-gold)" />
                </div>
            </div>

            {/* ── PERIOD SELECTOR ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}>
                    Performance Analytics
                </h1>
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

            {loading ? (
                <div className="text-center py-20"
                     style={{ color: 'var(--text-secondary)' }}>
                    Loading analytics...
                </div>
            ) : (
                <>
                    {/* ── TASK PERFORMANCE ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Daily completions bar chart */}
                        <div className="p-5 rounded-2xl border"
                             style={{ backgroundColor: 'var(--surface-base)',
                                      borderColor: 'var(--border-subtle)' }}>
                            <SectionTitle>Tasks Completed</SectionTitle>
                            {taskData?.dailyCompletions?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={taskData.dailyCompletions}>
                                        <XAxis dataKey="date"
                                               tick={{ fill: 'var(--text-secondary)',
                                                       fontSize: 11 }} />
                                        <YAxis tick={{ fill: 'var(--text-secondary)',
                                                       fontSize: 11 }}
                                               allowDecimals={false} />
                                        <Tooltip
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

                        {/* Priority donut chart */}
                        <div className="p-5 rounded-2xl border"
                             style={{ backgroundColor: 'var(--surface-base)',
                                      borderColor: 'var(--border-subtle)' }}>
                            <SectionTitle>By Priority</SectionTitle>
                            {priorityChartData.some(d => d.value > 0) ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={priorityChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            dataKey="value"
                                            nameKey="name">
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
                                            formatter={(value) => (
                                                <span style={{ color: 'var(--text-secondary)',
                                                               fontSize: 12 }}>
                                                    {value}
                                                </span>
                                            )} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No task data for this period." />
                            )}
                        </div>
                    </div>

                    {/* ── TOP TAGS ── */}
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
                                                    transition={{ duration: 0.6,
                                                                  delay: i * 0.1 }}
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

                    {/* ── FOCUS PERFORMANCE ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 p-5 rounded-2xl border"
                             style={{ backgroundColor: 'var(--surface-base)',
                                      borderColor: 'var(--border-subtle)' }}>
                            <SectionTitle>Focus Sessions</SectionTitle>
                            {pomodoroData?.dailySessions?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={pomodoroData.dailySessions}>
                                        <XAxis dataKey="date"
                                               tick={{ fill: 'var(--text-secondary)',
                                                       fontSize: 11 }} />
                                        <YAxis tick={{ fill: 'var(--text-secondary)',
                                                       fontSize: 11 }}
                                               allowDecimals={false} />
                                        <Tooltip
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

                        {/* Focus stat cards */}
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
                                      value={(pomodoroData?.totalXpFromPomodoros || 0)
                                              .toLocaleString()}
                                      icon="🍅"
                                      color="var(--xp-blue)" />
                        </div>
                    </div>

                    {/* ── PROGRESSION TIMELINE ── */}
                    <div className="p-5 rounded-2xl border"
                         style={{ backgroundColor: 'var(--surface-base)',
                                  borderColor: 'var(--border-subtle)' }}>
                        <SectionTitle>XP Progression</SectionTitle>
                        {xpChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={xpChartData}>
                                    <XAxis dataKey="label"
                                           tick={{ fill: 'var(--text-secondary)',
                                                   fontSize: 11 }} />
                                    <YAxis tick={{ fill: 'var(--text-secondary)',
                                                   fontSize: 11 }} />
                                    <Tooltip
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
                            <EmptyState message="Complete Pomodoro sessions to see XP progression." />
                        )}

                        {/* Level-up markers */}
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
                </>
            )}
        </motion.div>
    )
}

export default DashboardPage