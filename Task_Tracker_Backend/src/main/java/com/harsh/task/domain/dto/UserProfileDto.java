package com.harsh.task.domain.dto;

import com.harsh.task.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private Integer level;
    private Integer currentXp;
    private Integer totalXp;
    private Integer xpToNextLevel;
    private Integer gemBalance;
    private Integer currentDailyStreak;
    private Integer longestDailyStreak;
    private Integer pomodoroFlowStreak;
    private boolean xpBoostActive;
    private String currentTheme;

    public static UserProfileDto fromUser(User user) {
        int totalXpForCurrentLevel = user.getLevel() * 500;
        int remainingXp = totalXpForCurrentLevel - user.getCurrentXp();
        int requiredXpForNextLevel = Math.max(0, remainingXp);

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .totalXp(user.getTotalXp())
                .xpToNextLevel(requiredXpForNextLevel)
                .gemBalance(user.getGemBalance())
                .currentDailyStreak(user.getCurrentDailyStreak())
                .longestDailyStreak(user.getLongestDailyStreak())
                .pomodoroFlowStreak(user.getPomodoroFlowStreak())
                .xpBoostActive(user.isXpBoostActive())
                .currentTheme(user.getProfileTheme())
                .build();
    }
}