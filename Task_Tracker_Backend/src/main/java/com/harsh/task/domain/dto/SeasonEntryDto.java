package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SeasonEntryDto {
    private int rank;
    private Long userId;
    private String username;
    private int level;
    private String levelTitle;
    private int totalSeasonScore;
    private boolean isCurrentUser;
}