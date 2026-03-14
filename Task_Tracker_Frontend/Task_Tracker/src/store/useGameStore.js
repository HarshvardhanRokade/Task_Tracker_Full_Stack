import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useGameStore = create(devtools((set, get) => ({

  // --- User Identity (Temporary until auth is built) ---
  userId: 1,

  // --- Player State ---
  username: 'Loading...',
  level: 1,
  currentXp: 0,
  totalXp: 0,
  xpToNextLevel: 500,
  gemBalance: 0,
  dailyStreak: 0,
  longestDailyStreak: 0,
  flowStreak: 0,

  // --- Task List State ---
  tasks: [],

  // --- Global Error State ---
  errorMessage: null,

  // --- Session State (Focus Page) ---
  sessionActive: false,
  sessionPaused: false,
  currentMultiplier: 1.0,
  worstPauseTier: null,

  // --- UI State ---
  pendingReward: null,   // Holds reward payload until animation fires
  isLevelingUp: false,   // Triggers full-screen level-up overlay

  // --- Actions ---

  // 1. Called on app load to hydrate from backend
  initializePlayer: (userData) => set({
    userId: userData.id,
    username: userData.username,
    level: userData.level,
    currentXp: userData.currentXp,
    totalXp: userData.totalXp,
    xpToNextLevel: userData.xpToNextLevel,
    gemBalance: userData.gemBalance,
    dailyStreak: userData.currentDailyStreak,
    longestDailyStreak: userData.longestDailyStreak,
    flowStreak: userData.pomodoroFlowStreak,
  }),

  // 2. Called after task complete or pomodoro complete
  applyReward: (rewardDto) => {
    set((state) => ({
      currentXp: rewardDto.currentXp ?? state.currentXp,
      totalXp: rewardDto.totalXp ?? state.totalXp,
      xpToNextLevel: rewardDto.xpToNextLevel ?? state.xpToNextLevel,
      level: rewardDto.newLevel ?? state.level,
      gemBalance: state.gemBalance + (rewardDto.gemsEarned || 0) + (rewardDto.levelUpGemBonus || 0),
      dailyStreak: rewardDto.dailyStreak ?? state.dailyStreak,
      longestDailyStreak: rewardDto.longestDailyStreak ?? state.longestDailyStreak,
      flowStreak: rewardDto.flowStreak ?? state.flowStreak,
      pendingReward: rewardDto,
      isLevelingUp: rewardDto.didLevelUp || false,
    }));
  },

  // 3. Task Actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId)
  })),
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === updatedTask.id ? updatedTask : t)
  })),

  // 4. Error Actions
  setError: (msg) => set({ errorMessage: msg }),
  clearError: () => set({ errorMessage: null }),

  // 5. Focus session actions
  setSessionActive: (active) => set({ sessionActive: active }),
  setSessionPaused: (paused) => set({ sessionPaused: paused }),
  setMultiplier: (multiplier) => set({ currentMultiplier: multiplier }),

  // 6. Clear reward after animation completes
  clearPendingReward: () => set({ 
    pendingReward: null, 
    isLevelingUp: false 
  }),

  // 7. Dynamic Level Names
  getLevelName: () => {
    const level = get().level;
    if (level >= 50) return 'Transcendent Planner';
    if (level >= 30) return 'Legendary Focuser';
    if (level >= 20) return 'Deep Work Champion';
    if (level >= 15) return 'Productivity Sage';
    if (level >= 10) return 'Flow Master';
    if (level >= 8)  return 'Flow Initiate';
    if (level >= 5)  return 'Dedicated Grinder';
    if (level >= 3)  return 'Focus Seeker';
    if (level >= 2)  return 'Task Apprentice';
    return 'Novice Planner';
  },

})));

export default useGameStore;