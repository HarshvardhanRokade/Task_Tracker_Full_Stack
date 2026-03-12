package com.harsh.task.engine;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class StreakResult {
    private final int newCurrentDailyStreak;
    private final int newLongestDailyStreak;
    private final int newStreakFreezesOwned;
    private final boolean streakMaintained;
    private final boolean freezeUsed;
    private final LocalDateTime newLastActiveTimestamp;
}