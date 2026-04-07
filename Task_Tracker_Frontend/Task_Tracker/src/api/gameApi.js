import axios from 'axios'
import useGameStore from '../store/useGameStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ||
                 'http://localhost:8080/api'

const apiClient = axios.create({ baseURL: BASE_URL })

// --- Request Interceptor — attach access token ---
apiClient.interceptors.request.use((config) => {
    const token = useGameStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// --- Response Interceptor — handle token refresh on 401 ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error)
        } else {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Only attempt refresh on 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                }).catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Attempt token refresh — browser sends httpOnly cookie automatically
                const response = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                )

                const newAccessToken = response.data.accessToken

                // Update store with new token
                useGameStore.getState().setAuth({
                    ...response.data,
                    accessToken: newAccessToken,
                })

                // Retry all queued requests with new token
                processQueue(null, newAccessToken)

                // Retry the original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return apiClient(originalRequest)

            } catch (refreshError) {
                // Refresh failed — clear auth and redirect to login
                processQueue(refreshError, null)
                useGameStore.getState().clearAuth()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

// --- API Endpoints ---
export const authApi = {
    register:  (data) => axios.post(`${BASE_URL}/auth/register`, data,
                    { withCredentials: true }),
    login:     (data) => axios.post(`${BASE_URL}/auth/login`, data,
                    { withCredentials: true }),
    refresh:   () => axios.post(`${BASE_URL}/auth/refresh`, {},
                    { withCredentials: true }),
    logout:    () => apiClient.post('/auth/logout',  {},
                    { withCredentials: true }),
}

export const userApi = {
    getProfile: () => apiClient.get('/users/me'),
}

export const taskApi = {
    getAll:       (params = {}) => apiClient.get('/v1/tasks', { params }),
    create:       (data)        => apiClient.post('/v1/tasks', data),
    update:       (taskId, data)=> apiClient.put(`/v1/tasks/${taskId}`, data),
    updateStatus: (taskId, status) => apiClient.put(
                    `/v1/tasks/${taskId}/status`, null, { params: { status } }),
    complete:     (taskId)      => apiClient.post(`/v1/tasks/${taskId}/complete`),
    delete:       (taskId)      => apiClient.delete(`/v1/tasks/${taskId}`),
}

export const pomodoroApi = {
    start:    () => apiClient.post('/pomodoro/start'),
    pause:    () => apiClient.post('/pomodoro/pause'),
    resume:   () => apiClient.post('/pomodoro/resume'),
    complete: () => apiClient.post('/pomodoro/complete'),
    forfeit:  () => apiClient.post('/pomodoro/forfeit'),
}

export const storeApi = {
    getInventory:  () => apiClient.get('/v1/store/inventory'),
    purchaseItem:  (data) => apiClient.post('/v1/store/purchase', data),
    equipTheme:    (themeName) => apiClient.post(
                    '/v1/store/equip-theme', null, { params: { themeName } }),
}

export const tagApi = {
    getAll:  () => apiClient.get('/v1/tags'),
    create:  (data) => apiClient.post('/v1/tags', data),
    delete:  (tagId) => apiClient.delete(`/v1/tags/${tagId}`),
}

export const analyticsApi = {
    getSummary:     () => apiClient.get('/v1/analytics/summary'),
    getTasks:       (period) => apiClient.get('/v1/analytics/tasks',
                        { params: { period } }),
    getPomodoro:    (period) => apiClient.get('/v1/analytics/pomodoro',
                        { params: { period } }),
    getProgression: (period) => apiClient.get('/v1/analytics/progression',
                        { params: { period } }),
}

export const badgeApi = {
    getMyBadges: () => apiClient.get('/v1/badges'),
}

export const leaderboardApi = {
    getWeekly:  () => apiClient.get('/v1/leaderboard'),
    getSeason:  () => apiClient.get('/v1/leaderboard/season'),
    getProfile: (username) =>
        apiClient.get(`/v1/leaderboard/profile/${username}`),
}