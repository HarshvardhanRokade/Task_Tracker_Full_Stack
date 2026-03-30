package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SeasonLeaderboardDto {
    private int seasonNumber;
    private String seasonName;
    private String startDate;
    private String endDate;
    private boolean isActive;
    private List<SeasonEntryDto> entries;
}