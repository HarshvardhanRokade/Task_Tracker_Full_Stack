import { Navigate } from 'react-router-dom'
import useGameStore from '../store/useGameStore'

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useGameStore(state => state.isAuthenticated)
    const accessToken = useGameStore(state => state.accessToken)

    if (!isAuthenticated || !accessToken) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute