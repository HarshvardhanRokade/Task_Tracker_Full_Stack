import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useGameStore = create(devtools(persist(
    (set, get) => ({

        // --- Auth State ---
        accessToken: null,
        isAuthenticated: false,

        // --- User Identity ---
        userId: null,
        username: 'Loading...',
        level: 1,
        currentXp: 0,
        totalXp: 0,
        xpToNextLevel: 500,
        gemBalance: 0,
        dailyStreak: 0,
        longestDailyStreak: 0,
        flowStreak: 0,
        xpBoostActive: false,
        currentTheme: 'default',

        // --- Task State ---
        tasks: [],
        errorMessage: null,

        // --- Session State ---
        sessionActive: false,
        sessionPaused: false,
        currentMultiplier: 1.0,
        worstPauseTier: null,

        // --- Reward State ---
        pendingReward: null,
        isLevelingUp: false,

        // --- Auth Actions ---
        setAuth: (authData) => {
            document.documentElement.setAttribute(
                'data-theme', authData.currentTheme || 'default'
            )
            set({
                accessToken:       authData.accessToken,
                isAuthenticated:   true,
                userId:            authData.userId,
                username:          authData.username,
                level:             authData.level,
                currentXp:         authData.currentXp,
                totalXp:           authData.totalXp,
                xpToNextLevel:     authData.xpToNextLevel,
                gemBalance:        authData.gemBalance,
                dailyStreak:       authData.currentDailyStreak,
                longestDailyStreak: authData.longestDailyStreak,
                flowStreak:        authData.pomodoroFlowStreak,
                xpBoostActive:     authData.xpBoostActive,
                currentTheme:      authData.currentTheme,
            })
        },

        clearAuth: () => {
            document.documentElement.setAttribute('data-theme', 'default')
            set({
                accessToken:       null,
                isAuthenticated:   false,
                userId:            null,
                username:          'Loading...',
                level:             1,
                currentXp:         0,
                totalXp:           0,
                xpToNextLevel:     500,
                gemBalance:        0,
                dailyStreak:       0,
                longestDailyStreak: 0,
                flowStreak:        0,
                xpBoostActive:     false,
                currentTheme:      'default',
                tasks:             [],
                pendingReward:     null,
                isLevelingUp:      false,
            })
        },

        // Keep initializePlayer for the refresh flow
        initializePlayer: (userData) => {
            document.documentElement.setAttribute(
                'data-theme', userData.currentTheme || 'default'
            )
            set({
                userId:            userData.userId,
                username:          userData.username,
                level:             userData.level,
                currentXp:         userData.currentXp,
                totalXp:           userData.totalXp,
                xpToNextLevel:     userData.xpToNextLevel,
                gemBalance:        userData.gemBalance,
                dailyStreak:       userData.currentDailyStreak,
                longestDailyStreak: userData.longestDailyStreak,
                flowStreak:        userData.pomodoroFlowStreak,
                xpBoostActive:     userData.xpBoostActive,
                currentTheme:      userData.currentTheme,
            })
        },

        // --- Game Actions ---
        applyReward: (rewardDto) => {
            set((state) => ({
                currentXp:         rewardDto.currentXp ?? state.currentXp,
                totalXp:           rewardDto.totalXp ?? state.totalXp,
                xpToNextLevel:     rewardDto.xpToNextLevel ?? state.xpToNextLevel,
                level:             rewardDto.newLevel ?? state.level,
                gemBalance:        state.gemBalance +
                                   (rewardDto.gemsEarned || 0) +
                                   (rewardDto.levelUpGemBonus || 0),
                dailyStreak:       rewardDto.dailyStreak ?? state.dailyStreak,
                longestDailyStreak: rewardDto.longestDailyStreak ?? state.longestDailyStreak,
                flowStreak:        rewardDto.flowStreak ?? state.flowStreak,
                xpBoostActive:     rewardDto.boostConsumed
                                   ? false : state.xpBoostActive,
                pendingReward:     rewardDto,
                isLevelingUp:      rewardDto.didLevelUp || false,
            }))
        },

        // --- Store Actions ---
        updateGemBalance:  (newBalance) => set({ gemBalance: newBalance }),
        setXpBoostActive:  (active) => set({ xpBoostActive: active }),
        setCurrentTheme:   (theme) => {
            document.documentElement.setAttribute('data-theme', theme)
            set({ currentTheme: theme })
        },

        // --- Task Actions ---
        setTasks:    (tasks) => set({ tasks }),
        addTask:     (task) => set((state) => ({
            tasks: [...state.tasks, task]
        })),
        removeTask:  (taskId) => set((state) => ({
            tasks: state.tasks.filter(t => t.id !== taskId)
        })),
        updateTask:  (updatedTask) => set((state) => ({
            tasks: state.tasks.map(t =>
                t.id === updatedTask.id ? updatedTask : t)
        })),

        // --- UI Actions ---
        setError:           (msg) => set({ errorMessage: msg }),
        clearError:         () => set({ errorMessage: null }),
        setSessionActive:   (active) => set({ sessionActive: active }),
        setSessionPaused:   (paused) => set({ sessionPaused: paused }),
        setMultiplier:      (multiplier) => set({ currentMultiplier: multiplier }),
        clearPendingReward: () => set({ pendingReward: null, isLevelingUp: false }),

        // --- Computed ---
        getLevelName: () => {
            const level = get().level
            if (level >= 50) return 'Transcendent Planner'
            if (level >= 30) return 'Legendary Focuser'
            if (level >= 20) return 'Deep Work Champion'
            if (level >= 15) return 'Productivity Sage'
            if (level >= 10) return 'Flow Master'
            if (level >= 8)  return 'Flow Initiate'
            if (level >= 5)  return 'Dedicated Grinder'
            if (level >= 3)  return 'Focus Seeker'
            if (level >= 2)  return 'Task Apprentice'
            return 'Novice Planner'
        },
    }),
    {
        name: 'game-store',
        // Only persist the access token — everything else re-fetches
        partialize: (state) => ({
            accessToken:     state.accessToken,
            isAuthenticated: state.isAuthenticated,
        })
    }
)))

export default useGameStore