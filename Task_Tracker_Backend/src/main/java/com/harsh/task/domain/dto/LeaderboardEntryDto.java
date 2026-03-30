package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardEntryDto {
    private int rank;
    private Long userId;
    private String username;
    private int level;
    private String levelTitle;
    private int totalScore;
    private int taskPoints;
    private int pomodoroPoints;
    private int consistencyPoints;
    private int daysActive;
    private int tasksCompleted;
    private int pomodorosCompleted;
    private int currentDailyStreak;
    private boolean isCurrentUser;
}