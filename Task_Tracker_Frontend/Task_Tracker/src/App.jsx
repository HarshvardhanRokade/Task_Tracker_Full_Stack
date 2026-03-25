import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useGameStore from './store/useGameStore'
import { authApi } from './api/gameApi'

import Sidebar from './components/sidebar/Sidebar'
import RewardOverlay from './components/rewards/RewardOverlay'
import ErrorToast from './components/rewards/ErrorToast'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary' // ✨ NEW IMPORT

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TaskPage'
import FocusPage from './pages/FocusPage'
import DashboardPage from './pages/DashboardPage'
import StorePage from './pages/StorePage'

const AppLayout = ({ children }) => (
    <div className="min-h-screen flex overflow-hidden"
         style={{ backgroundColor: 'var(--bg-dark)' }}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
            {children}
        </main>
        <RewardOverlay />
        <ErrorToast />
    </div>
)

function App() {
    const location = useLocation()
    const { isAuthenticated, setAuth, clearAuth } = useGameStore()
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        // On mount — attempt silent refresh to restore session
        const attemptSilentRefresh = async () => {
            if (isAuthenticated) {
                // Already have a token — skip refresh
                setInitializing(false)
                return
            }

            try {
                // Try to refresh using httpOnly cookie
                const response = await authApi.refresh()
                setAuth(response.data)
            } catch {
                // No valid refresh token — user must log in
                clearAuth()
            } finally {
                setInitializing(false)
            }
        }

        attemptSilentRefresh()
    }, [])

    // Show nothing while checking auth status
    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                 style={{ backgroundColor: 'var(--bg-dark)',
                          color: 'var(--text-secondary)' }}>
                <div className="text-center">
                    <div className="text-4xl mb-3">🚀</div>
                    <p className="text-sm">Loading Workspace...</p>
                </div>
            </div>
        )
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/login"    element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route path="/tasks" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {/* ✨ NEW: Wrapped in ErrorBoundary */}
                            <ErrorBoundary>
                                <TasksPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/focus" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {/* ✨ NEW: Wrapped in ErrorBoundary */}
                            <ErrorBoundary>
                                <FocusPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {/* ✨ NEW: Wrapped in ErrorBoundary */}
                            <ErrorBoundary>
                                <DashboardPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/store" element={
                    <ProtectedRoute>
                        <AppLayout>
                            {/* ✨ NEW: Wrapped in ErrorBoundary */}
                            <ErrorBoundary>
                                <StorePage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="/"   element={<Navigate to="/tasks" replace />} />
                <Route path="*"   element={<Navigate to="/tasks" replace />} />
            </Routes>
        </AnimatePresence>
    )
}

export default App