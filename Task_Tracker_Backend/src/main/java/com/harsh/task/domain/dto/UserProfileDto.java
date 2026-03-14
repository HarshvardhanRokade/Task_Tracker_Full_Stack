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

    public static UserProfileDto fromUser(User user) {
        int requiredXpForNextLevel = user.getLevel() * 500;
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
                .build();
    }
}