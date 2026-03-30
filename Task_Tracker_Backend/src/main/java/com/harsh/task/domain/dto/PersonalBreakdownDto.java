package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonalBreakdownDto {
    private int rank;
    private int totalScore;
    private int taskPoints;
    private int pomodoroPoints;
    private int consistencyPoints;
    private int daysActive;
    private int tasksCompleted;
    private int pomodorosCompleted;

    // Max possible points this week for progress bars
    private int maxConsistencyPoints; // Always 35 (7 days × 5)
}