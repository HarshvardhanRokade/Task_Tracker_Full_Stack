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

const AppLayout = ({ children }) => (
    // ✨ Perfectly fills the locked #root container
    <div className="w-full h-full flex overflow-hidden"
         style={{ backgroundColor: 'var(--bg-dark)' }}>
        
        <Sidebar />
        
        {/* ✨ Only this specific section is allowed to scroll */}
        <main className="flex-1 h-full p-8 overflow-y-auto overflow-x-hidden">
            <div className="pb-12">
                {children}
            </div>
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
                <Route path="/login"    element={<LoginPage />} />
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

                <Route path="/"   element={<Navigate to="/tasks" replace />} />
                <Route path="*"   element={<Navigate to="/tasks" replace />} />
            </Routes>
        </AnimatePresence>
    )
}

export default App