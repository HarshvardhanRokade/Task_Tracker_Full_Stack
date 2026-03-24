package com.harsh.task.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDto {
    private String accessToken;
    private Long userId;
    private String username;
    private String email;
    private Integer level;
    private String levelTitle;
    private Integer currentXp;
    private Integer totalXp;
    private Integer xpToNextLevel;
    private Integer gemBalance;
    private Integer currentDailyStreak;
    private Integer longestDailyStreak;
    private Integer pomodoroFlowStreak;
    private boolean xpBoostActive;
    private String currentTheme;
}