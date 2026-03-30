package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeekInfoDto {
    private String weekStartDate;
    private String weekEndDate;
    private long secondsUntilReset; // For countdown timer
    private int currentSeasonNumber;
    private String currentSeasonName;
    private String seasonEndDate;
}