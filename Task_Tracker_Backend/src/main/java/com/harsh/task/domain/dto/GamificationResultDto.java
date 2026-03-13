package com.harsh.task.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationResultDto {
    private int xpEarned;
    private int gemsEarned;

    private boolean didLevelUp;
    private int newLevel;
    private int levelUpGemBonus;

    private int currentXp;
    private int totalXp;
    private int xpToNextLevel;

    private int dailyStreak;
    private int longestDailyStreak;
    private boolean freezeUsed;
}