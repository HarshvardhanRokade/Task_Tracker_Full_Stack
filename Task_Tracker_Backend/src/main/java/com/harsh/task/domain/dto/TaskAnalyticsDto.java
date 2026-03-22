package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class TaskAnalyticsDto {
    private List<DailyCountDto> dailyCompletions;
    private Map<String, Integer> byPriority;
    private List<TagCountDto> topTags;

    @Data
    @Builder
    public static class DailyCountDto {
        private String date;
        private long count;
    }

    @Data
    @Builder
    public static class TagCountDto {
        private String tagName;
        private long count;
    }
}