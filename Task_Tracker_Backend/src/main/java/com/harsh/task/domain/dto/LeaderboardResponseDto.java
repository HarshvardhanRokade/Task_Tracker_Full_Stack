package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LeaderboardResponseDto {
    private List<LeaderboardEntryDto> currentWeek;
    private List<LeaderboardEntryDto> lastWeek;
    private PersonalBreakdownDto personalBreakdown;
    private WeekInfoDto weekInfo;
}