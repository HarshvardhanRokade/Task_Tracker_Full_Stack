import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/gameApi'
import useGameStore from '../store/useGameStore'

const RegisterPage = () => {
    const navigate = useNavigate()
    const setAuth = useGameStore(state => state.setAuth)

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    
    const [fieldErrors, setFieldErrors] = useState({})
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const validate = () => {
        const errors = {}
        if (form.username.length < 3)
            errors.username = 'Username must be at least 3 characters'
        if (!form.email.includes('@'))
            errors.email = 'Enter a valid email address'
        if (form.password.length < 8)
            errors.password = 'Password must be at least 8 characters'
        if (form.password !== form.confirmPassword)
            errors.confirmPassword = 'Passwords do not match'
        return errors
    }

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setFieldErrors(prev => ({ ...prev, [e.target.name]: null }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        setError(null)
        setLoading(true)

        try {
            const response = await authApi.register({
                username: form.username,
                email:    form.email,
                password: form.password,
            })
            setAuth(response.data)
            navigate('/tasks')
        } catch (err) {
            const msg = err.response?.data?.message
                || err.response?.data?.error
                || 'Registration failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
    }

    return (
        <div className="h-full w-full min-h-screen flex items-center justify-center overflow-y-auto p-4"
             style={{ backgroundColor: 'var(--bg-dark)' }}>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md m-auto pb-8 pt-8"
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
                        Begin your productivity journey
                    </p>
                </div>

                {/* ✨ STANDARDIZED: Tightened padding to p-6 */}
                <div className="p-6 rounded-2xl border shadow-xl"
                     style={{ backgroundColor: 'var(--surface-base)',
                              borderColor: 'var(--border-subtle)' }}>

                    <h2 className="text-xl font-bold mb-6 text-center"
                        style={{ color: 'var(--text-primary)' }}>
                        Create Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-bold mb-1.5"
                                   style={{ color: 'var(--text-secondary)' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                required
                                minLength={3}
                                maxLength={50}
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.username ? 'var(--danger-red)' : 'var(--border-subtle)'
                                }}
                                onFocus={e => !fieldErrors.username && (e.target.style.borderColor = 'var(--xp-blue)')}
                                onBlur={e => !fieldErrors.username && (e.target.style.borderColor = 'var(--border-subtle)')}
                            />
                            {fieldErrors.username && (
                                <p className="text-xs mt-1.5 font-bold" style={{ color: 'var(--danger-red)' }}>
                                    {fieldErrors.username}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold mb-1.5"
                                   style={{ color: 'var(--text-secondary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.email ? 'var(--danger-red)' : 'var(--border-subtle)'
                                }}
                                onFocus={e => !fieldErrors.email && (e.target.style.borderColor = 'var(--xp-blue)')}
                                onBlur={e => !fieldErrors.email && (e.target.style.borderColor = 'var(--border-subtle)')}
                            />
                            {fieldErrors.email && (
                                <p className="text-xs mt-1.5 font-bold" style={{ color: 'var(--danger-red)' }}>
                                    {fieldErrors.email}
                                </p>
                            )}
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
                                placeholder="Minimum 8 characters"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.password ? 'var(--danger-red)' : 'var(--border-subtle)'
                                }}
                                onFocus={e => !fieldErrors.password && (e.target.style.borderColor = 'var(--xp-blue)')}
                                onBlur={e => !fieldErrors.password && (e.target.style.borderColor = 'var(--border-subtle)')}
                            />
                            {fieldErrors.password && (
                                <p className="text-xs mt-1.5 font-bold" style={{ color: 'var(--danger-red)' }}>
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold mb-1.5"
                                   style={{ color: 'var(--text-secondary)' }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat your password"
                                required
                                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.confirmPassword ? 'var(--danger-red)' : 'var(--border-subtle)'
                                }}
                                onFocus={e => !fieldErrors.confirmPassword && (e.target.style.borderColor = 'var(--xp-blue)')}
                                onBlur={e => !fieldErrors.confirmPassword && (e.target.style.borderColor = 'var(--border-subtle)')}
                            />
                            {fieldErrors.confirmPassword && (
                                <p className="text-xs mt-1.5 font-bold" style={{ color: 'var(--danger-red)' }}>
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Global API Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl text-sm mt-4 text-center font-bold"
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
                                       disabled:cursor-not-allowed mt-6 shadow-[0_0_15px_rgba(46,204,113,0.3)]"
                            style={{
                                backgroundColor: 'var(--flow-green)',
                                color: '#000',
                            }}>
                            {loading ? 'Creating account...' : 'Start Your Journey 🚀'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm mt-6"
                       style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login"
                              style={{ color: 'var(--xp-blue)' }}
                              className="font-bold hover:underline transition-colors hover:brightness-125">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default RegisterPage