package com.harsh.task.domain.dto;

import com.harsh.task.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInventoryDto {
    private int gemBalance;
    private int streakFreezesOwned;
    private boolean xpBoostActive;
    private String currentTheme;
    private Set<String> ownedThemes;
    private int currentStreak;
    private int streakFreezeCost; // ✨ Backend is the authority on price!

    public static UserInventoryDto fromUser(User user) {
        int streak = user.getCurrentDailyStreak();
        // Dynamic Pricing Logic: 30+ days = 200, 7+ days = 100, else 50
        int freezeCost = streak >= 30 ? 200 : streak >= 7 ? 100 : 50;

        return UserInventoryDto.builder()
                .gemBalance(user.getGemBalance())
                .streakFreezesOwned(user.getStreakFreezesOwned())
                .xpBoostActive(user.isXpBoostActive())
                .currentTheme(user.getProfileTheme())
                .ownedThemes(user.getOwnedThemes())
                .currentStreak(streak)
                .streakFreezeCost(freezeCost)
                .build();
    }
}