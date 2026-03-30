package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeeklyScoreHistoryDto {
    private String weekLabel;  // "Mar 16"
    private int totalScore;
    private int taskPoints;
    private int pomodoroPoints;
    private int consistencyPoints;
    private int daysActive;
}