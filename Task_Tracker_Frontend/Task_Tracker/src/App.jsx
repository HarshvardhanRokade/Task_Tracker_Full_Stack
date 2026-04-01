import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useGameStore from './store/useGameStore'
import { authApi } from './api/gameApi'

import Sidebar from './components/sidebar/Sidebar'
import RewardOverlay from './components/rewards/RewardOverlay'
import ErrorToast from './components/rewards/ErrorToast'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import FocusPage from './pages/FocusPage'
import DashboardPage from './pages/DashboardPage'
import StorePage from './pages/StorePage'
import LeaderboardPage from './pages/LeaderboardPage'
import PublicProfilePage from './pages/PublicProfilePage'

const AppLayout = ({ children }) => {
    // Check if the user is logged in
    const isAuthenticated = useGameStore(state => state.isAuthenticated)

    return (
        <div className="fixed inset-0 flex w-full h-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-dark)' }}>

            {/* Only show Sidebar if logged in */}
            {isAuthenticated && <Sidebar />}

            {/* ✨ Added universal padding-top (pt-20) to clear the hamburger button! */}
            <main className="flex-1 h-full p-4 pt-20 md:p-8 md:pt-20 overflow-y-auto overflow-x-hidden">
                <div className="max-w-5xl mx-auto pb-12">
                    {children}
                </div>
            </main>

            {/* Only show overlays if logged in */}
            {isAuthenticated && <RewardOverlay />}
            {isAuthenticated && <ErrorToast />}
        </div>
    )
}

function App() {
    const location = useLocation()
    const { isAuthenticated, setAuth, clearAuth } = useGameStore()
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        const attemptSilentRefresh = async () => {
            try {
                const response = await authApi.refresh()
                setAuth(response.data)
            } catch {
                clearAuth()
            } finally {
                setInitializing(false)
            }
        }

        attemptSilentRefresh()
    }, [])

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundColor: 'var(--bg-dark)',
                    color: 'var(--text-secondary)'
                }}>
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/tasks" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ErrorBoundary>
                                <TasksPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/focus" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ErrorBoundary>
                                <FocusPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ErrorBoundary>
                                <DashboardPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/store" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ErrorBoundary>
                                <StorePage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/leaderboard" element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ErrorBoundary>
                                <LeaderboardPage />
                            </ErrorBoundary>
                        </AppLayout>
                    </ProtectedRoute>
                } />

                <Route path="/profile/:username"
                    element={
                        <AppLayout>
                            <ErrorBoundary>
                                <PublicProfilePage />
                            </ErrorBoundary>
                        </AppLayout>
                    }
                />

                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="*" element={<Navigate to="/tasks" replace />} />
            </Routes>
        </AnimatePresence>
    )
}

export default App