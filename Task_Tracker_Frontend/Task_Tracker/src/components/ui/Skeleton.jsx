import { motion } from 'framer-motion'

const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
    },
}

export const SkeletonBox = ({ width = '100%', height = '1rem', className = '' }) => (
    <motion.div
        {...shimmer}
        className={`rounded-lg ${className}`}
        style={{
            width,
            height,
            background: 'linear-gradient(90deg, var(--surface-raised) 25%, var(--border-subtle) 50%, var(--surface-raised) 75%)',
            backgroundSize: '200% 100%',
        }}
    />
)

export const SkeletonCard = ({ className = '' }) => (
    <div
        className={`p-5 rounded-2xl border ${className}`}
        style={{
            backgroundColor: 'var(--surface-base)',
            borderColor: 'var(--border-subtle)',
        }}>
        <SkeletonBox height="1.25rem" width="40%" className="mb-3" />
        <SkeletonBox height="0.875rem" width="80%" className="mb-2" />
        <SkeletonBox height="0.875rem" width="60%" />
    </div>
)

export const SkeletonTaskCard = () => (
    <div
        className="p-5 rounded-2xl mb-3"
        style={{
            backgroundColor: 'var(--surface-base)',
            border: '1px solid var(--border-subtle)',
            borderLeft: '4px solid var(--border-subtle)',
        }}>
        <div className="flex justify-between items-center">
            <div className="flex-1">
                <SkeletonBox height="1.1rem" width="50%" className="mb-2" />
                <SkeletonBox height="0.8rem" width="30%" className="mb-3" />
                <div className="flex gap-2">
                    <SkeletonBox height="1.5rem" width="4rem" />
                    <SkeletonBox height="1.5rem" width="3rem" />
                </div>
            </div>
            <SkeletonBox height="2.5rem" width="6rem" className="ml-4 rounded-xl" />
        </div>
    </div>
)

export const SkeletonStatCard = () => (
    <div
        className="p-4 rounded-xl border"
        style={{
            backgroundColor: 'var(--surface-base)',
            borderColor: 'var(--border-subtle)',
        }}>
        <SkeletonBox height="2rem" width="2rem" className="mb-2" />
        <SkeletonBox height="1.75rem" width="60%" className="mb-1" />
        <SkeletonBox height="0.75rem" width="80%" />
    </div>
)

// ✨ Added for Achievement Grid
export const SkeletonBadge = () => (
    <div className="p-3 rounded-xl text-center border flex flex-col items-center"
        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-subtle)' }}>
        <SkeletonBox height="2.5rem" width="2.5rem" className="mb-2 rounded-full" />
        <SkeletonBox height="0.7rem" width="60%" className="mb-1" />
        <SkeletonBox height="0.5rem" width="40%" />
    </div>
)