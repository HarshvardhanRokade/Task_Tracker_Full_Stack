package com.harsh.task.engine;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class StreakEngine {

    /**
     * Calculates the new streak state based on the 36-hour rolling window and calendar dates.
     */
    public StreakResult calculate(Integer currentDailyStreak, Integer longestDailyStreak,
                                  Integer streakFreezesOwned, LocalDateTime lastActiveTimestamp,
                                  LocalDateTime actionTimestamp) {

        // --- 1. The Null State (Newbie) ---
        if (lastActiveTimestamp == null) {
            return buildResult(1, Math.max(1, longestDailyStreak), streakFreezesOwned, true, false, actionTimestamp);
        }

        LocalDate lastActiveDate = lastActiveTimestamp.toLocalDate();
        LocalDate actionDate = actionTimestamp.toLocalDate();

        long calendarDaysDifference = actionDate.toEpochDay() - lastActiveDate.toEpochDay();
        long hoursDifference = Duration.between(lastActiveTimestamp, actionTimestamp).toHours();

        // --- 2. Rule 1: Same Day Repeat ---
        if (calendarDaysDifference == 0) {
            // Streak stays exactly the same, but we update the timestamp to now
            return buildResult(currentDailyStreak, longestDailyStreak, streakFreezesOwned, true, false, actionTimestamp);
        }

        // --- 3. Rule 2: Standard Next Day ---
        if (calendarDaysDifference == 1) {
            int newStreak = currentDailyStreak + 1;
            int newLongest = Math.max(newStreak, longestDailyStreak);
            return buildResult(newStreak, newLongest, streakFreezesOwned, true, false, actionTimestamp);
        }

        // --- 4. Rule 3: Night Owl Grace Period ---
        if (calendarDaysDifference == 2 && hoursDifference < 36) {
            int newStreak = currentDailyStreak + 1;
            int newLongest = Math.max(newStreak, longestDailyStreak);
            return buildResult(newStreak, newLongest, streakFreezesOwned, true, false, actionTimestamp);
        }

        // --- 5. Rule 4: Streak Broken (Check for Freeze) ---
        if (streakFreezesOwned > 0) {
            // Freeze Auto-Activates!
            return buildResult(currentDailyStreak, longestDailyStreak, streakFreezesOwned - 1, true, true, actionTimestamp);
        } else {
            // Streak Resets to 1
            return buildResult(1, longestDailyStreak, streakFreezesOwned, false, false, actionTimestamp);
        }
    }

    // Helper method to keep the return statements clean
    private StreakResult buildResult(int newStreak, int newLongest, int newFreezes,
                                     boolean maintained, boolean freezeUsed, LocalDateTime timestamp) {
        return StreakResult.builder()
                .newCurrentDailyStreak(newStreak)
                .newLongestDailyStreak(newLongest)
                .newStreakFreezesOwned(newFreezes)
                .streakMaintained(maintained)
                .freezeUsed(freezeUsed)
                .newLastActiveTimestamp(timestamp)
                .build();
    }
}