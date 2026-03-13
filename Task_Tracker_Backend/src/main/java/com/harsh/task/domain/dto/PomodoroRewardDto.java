package com.harsh.task.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroRewardDto {
    private int xpEarned;
    private int gemsEarned; // Flow gems only
    private double multiplierApplied;

    private boolean didLevelUp;
    private int newLevel;
    private int levelUpGemBonus; // Separate field

    private int currentXp;
    private int totalXp;
    private int xpToNextLevel;

    private int dailyStreak;
    private int longestDailyStreak;

    private int flowStreak;
    private boolean flowStreakBroken;
    private boolean sessionStateInvalid;
    private boolean freezeUsed;
}