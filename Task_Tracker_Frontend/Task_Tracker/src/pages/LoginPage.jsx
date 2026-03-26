import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/gameApi'
import useGameStore from '../store/useGameStore'

const LoginPage = () => {
    const navigate = useNavigate()
    const setAuth = useGameStore(state => state.setAuth)

    const [form, setForm] = useState({
        usernameOrEmail: '',
        password: '',
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.login(form)
            setAuth(response.data)
            navigate('/tasks')
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.error
                || 'Invalid credentials. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4"
             style={{ backgroundColor: 'var(--bg-dark)' }}>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🚀</div>
                    <h1 className="text-3xl font-black"
                        style={{ color: 'var(--text-primary)' }}>
                        Workspace
                    </h1>
                    <p className="mt-2 text-sm"
                       style={{ color: 'var(--text-secondary)' }}>
                        Sign in to continue your journey
                    </p>
                </div>

                {/* ✨ STANDARDIZED: Tightened padding to p-6 to match Dashboard hero cards */}
                <div className="p-6 rounded-2xl border shadow-xl"
                     style={{ backgroundColor: 'var(--surface-base)',
                              borderColor: 'var(--border-subtle)' }}>

                    <h2 className="text-xl font-bold mb-6 text-center"
                        style={{ color: 'var(--text-primary)' }}>
                        Welcome Back
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username or Email */}
                        <div>
                            <label className="block text-sm font-bold mb-1.5"
                                   style={{ color: 'var(--text-secondary)' }}>
                                Username or Email
                            </label>
                            <input
                                type="text"
                                name="usernameOrEmail"
                                value={form.usernameOrEmail}
                                onChange={handleChange}
                                placeholder="Enter username or email"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--surface-raised)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--xp-blue)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold mb-1.5"
                                   style={{ color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--surface-raised)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--xp-blue)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl text-sm text-center font-bold"
                                style={{
                                    backgroundColor: 'rgba(231,76,60,0.15)',
                                    border: '1px solid var(--danger-red)',
                                    color: 'var(--danger-red)',
                                }}>
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm
                                       transition-transform hover:scale-105
                                       active:scale-95 disabled:opacity-50
                                       disabled:cursor-not-allowed mt-2 shadow-lg"
                            style={{
                                backgroundColor: 'var(--xp-blue)',
                                color: '#fff',
                            }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm mt-6"
                       style={{ color: 'var(--text-secondary)' }}>
                        No account?{' '}
                        <Link to="/register"
                              style={{ color: 'var(--xp-blue)' }}
                              className="font-bold hover:underline transition-colors hover:brightness-125">
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage