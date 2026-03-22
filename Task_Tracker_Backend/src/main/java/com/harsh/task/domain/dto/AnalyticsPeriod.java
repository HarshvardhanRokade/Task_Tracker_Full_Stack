package com.harsh.task.domain.dto;

import java.time.LocalDateTime;

public enum AnalyticsPeriod {
    WEEK, MONTH, QUARTER, ALL_TIME;

    public LocalDateTime toStartDate() {
        LocalDateTime now = LocalDateTime.now();
        return switch (this) {
            case WEEK    -> now.minusDays(7);
            case MONTH   -> now.minusDays(30);
            case QUARTER -> now.minusDays(90);
            case ALL_TIME -> LocalDateTime.of(2000, 1, 1, 0, 0);
        };
    }
}