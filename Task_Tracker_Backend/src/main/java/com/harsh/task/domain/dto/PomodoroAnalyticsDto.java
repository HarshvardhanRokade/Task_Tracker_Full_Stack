package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PomodoroAnalyticsDto {
    private List<DailySessionDto> dailySessions;
    private int bestFlowStreak;
    private long totalSessions;
    private long totalXpFromPomodoros;
    private double averageMultiplier;

    @Data
    @Builder
    public static class DailySessionDto {
        private String date;
        private long count;
        private double averageMultiplier;
    }
}