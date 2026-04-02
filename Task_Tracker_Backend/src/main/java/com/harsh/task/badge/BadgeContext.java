package com.harsh.task.badge;

import com.harsh.task.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BadgeContext {
    private final User user;
    private final BadgeEvent event;

    // Event-specific context
    private final int newLevel;              // For LEVEL_UP
    private final long totalTasksCompleted;  // For TASK_COMPLETED
    private final long totalPomodoros;       // For POMODORO_COMPLETED
    private final int currentStreak;         // For STREAK_UPDATED
    private final int totalGemsEarned;       // For STORE_PURCHASE
    private final int seasonRank;
    private final int seasonNumber;

    private final int streak;
}