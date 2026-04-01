import { useState, useEffect } from 'react'

const WeekCountdown = ({ secondsUntilReset }) => {
    const [seconds, setSeconds] = useState(secondsUntilReset)

    useEffect(() => {
        setSeconds(secondsUntilReset)
    }, [secondsUntilReset])

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const days    = Math.floor(seconds / 86400)
    const hours   = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs    = seconds % 60

    const pad = (n) => String(n).padStart(2, '0')

    return (
        <div className="flex items-center gap-1.5 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>
                Resets in
            </span>
            <span className="font-black tabular-nums"
                  style={{ color: 'var(--streak-orange)' }}>
                {days > 0 && `${days}d `}
                {pad(hours)}:{pad(minutes)}:{pad(secs)}
            </span>
        </div>
    )
}

export default WeekCountdown