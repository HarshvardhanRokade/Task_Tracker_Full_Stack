package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsSummaryDto {
    private int currentLevel;
    private String levelTitle;
    private int totalXp;
    private int currentDailyStreak;
    private int longestDailyStreak;
    private int gemBalance;
    private long totalTasksCompleted;
    private long totalPomodoroSessions;
    private double averageMultiplier;
    private int bestFlowStreak;
}