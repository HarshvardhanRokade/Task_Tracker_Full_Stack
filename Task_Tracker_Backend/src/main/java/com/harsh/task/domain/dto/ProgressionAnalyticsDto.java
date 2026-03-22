package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProgressionAnalyticsDto {
    private List<PeriodXpDto> xpByPeriod;
    private List<LevelUpEventDto> levelUps;

    @Data
    @Builder
    public static class PeriodXpDto {
        private String label;
        private long xp;
    }

    @Data
    @Builder
    public static class LevelUpEventDto {
        private int level;
        private String achievedAt;
        private String triggeredBy;
    }
}