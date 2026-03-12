package com.harsh.task.engine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class StreakEngineTest {

    private StreakEngine engine;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        engine = new StreakEngine();
        // Anchor "now" to a specific date for predictable testing
        now = LocalDateTime.of(2026, 3, 11, 12, 0);
    }

    @Test
    void newbie_nullTimestamp_startsStreakAtOne() {
        StreakResult result = engine.calculate(0, 0, 0, null, now);
        assertEquals(1, result.getNewCurrentDailyStreak());
        assertEquals(1, result.getNewLongestDailyStreak());
        assertTrue(result.isStreakMaintained());
    }

    @Test
    void sameDayRepeat_doesNotIncrementStreak() {
        LocalDateTime twoHoursAgo = now.minusHours(2);
        StreakResult result = engine.calculate(5, 5, 0, twoHoursAgo, now);
        assertEquals(5, result.getNewCurrentDailyStreak());
        assertTrue(result.isStreakMaintained());
    }

    @Test
    void standardNextDay_incrementsStreak() {
        LocalDateTime yesterday = now.minusDays(1);
        StreakResult result = engine.calculate(5, 5, 0, yesterday, now);
        assertEquals(6, result.getNewCurrentDailyStreak());
        assertEquals(6, result.getNewLongestDailyStreak());
    }

    @Test
    void nightOwlGrace_under36Hours_incrementsStreak() {
        LocalDateTime mondayNight = LocalDateTime.of(2026, 3, 9, 23, 0);
        LocalDateTime wednesdayMorning = LocalDateTime.of(2026, 3, 11, 10, 0);
        StreakResult result = engine.calculate(5, 5, 0, mondayNight, wednesdayMorning);
        assertEquals(6, result.getNewCurrentDailyStreak());
        assertTrue(result.isStreakMaintained());
    }

    @Test
    void nightOwlBreak_over36Hours_resetsStreak() {
        LocalDateTime mondayNight = LocalDateTime.of(2026, 3, 9, 21, 0);
        LocalDateTime wednesdayMorning = LocalDateTime.of(2026, 3, 11, 10, 0);
        StreakResult result = engine.calculate(5, 10, 0, mondayNight, wednesdayMorning);
        assertEquals(1, result.getNewCurrentDailyStreak());
        assertEquals(10, result.getNewLongestDailyStreak());
        assertFalse(result.isStreakMaintained());
    }

    @Test
    void streakBreak_withFreeze_consumesFreezeAndMaintains() {
        LocalDateTime monday = now.minusDays(3);
        StreakResult result = engine.calculate(50, 50, 1, monday, now);
        assertEquals(50, result.getNewCurrentDailyStreak());
        assertEquals(0, result.getNewStreakFreezesOwned());
        assertTrue(result.isFreezeUsed());
        assertTrue(result.isStreakMaintained());
    }

    // --- NEW TESTS ADDED BELOW ---

    @Test
    void streakReset_longestStreakNeverDecreases() {
        // User had a 30-day longest streak, current is 14, misses 3 days
        LocalDateTime threeDaysAgo = now.minusDays(3);
        StreakResult result = engine.calculate(14, 30, 0, threeDaysAgo, now);

        assertEquals(1, result.getNewCurrentDailyStreak());
        assertEquals(30, result.getNewLongestDailyStreak()); // 30 preserved, not replaced with 1
        assertFalse(result.isStreakMaintained());
    }

    @Test
    void normalStreakIncrement_doesNotConsumeFreeeze() {
        LocalDateTime yesterday = now.minusDays(1);
        StreakResult result = engine.calculate(5, 5, 3, yesterday, now);

        assertEquals(3, result.getNewStreakFreezesOwned()); // Untouched
        assertFalse(result.isFreezeUsed());
        assertEquals(6, result.getNewCurrentDailyStreak());
    }
}