package com.harsh.task.engine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class FlowEngineTest {

    private FlowEngine engine;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        engine = new FlowEngine();
        now = LocalDateTime.of(2026, 3, 11, 12, 0); // Wednesday Noon
    }

    @Test
    void startWindow_nullLastSession_firstEverSession_returnsTrue() {
        assertTrue(engine.isFlowMaintainedAtStart(null, now));
    }

    @Test
    void startWindow_under40Mins_maintainsFlow() {
        LocalDateTime lastSession = now.minusMinutes(30);
        assertTrue(engine.isFlowMaintainedAtStart(lastSession, now));
    }

    @Test
    void startWindow_exactly40Mins_maintainsFlow() {
        LocalDateTime lastSession = now.minusMinutes(40);
        assertTrue(engine.isFlowMaintainedAtStart(lastSession, now));
    }

    @Test
    void startWindow_41Mins_breaksFlow() {
        LocalDateTime lastSession = now.minusMinutes(41);
        assertFalse(engine.isFlowMaintainedAtStart(lastSession, now));
    }

    @Test
    void startWindow_nextDayEvenIfUnder40Mins_breaksFlow() {
        LocalDateTime lateNight = LocalDateTime.of(2026, 3, 10, 23, 50);
        LocalDateTime earlyMorning = LocalDateTime.of(2026, 3, 11, 0, 10);
        assertFalse(engine.isFlowMaintainedAtStart(lateNight, earlyMorning));
    }

    @Test
    void pauseEvaluation_exactBoundaries() {
        assertEquals(PauseTier.TIER_1_GRACE,  engine.evaluatePauseDuration(14));
        assertEquals(PauseTier.TIER_2_FROZEN, engine.evaluatePauseDuration(15)); // Exact lower bound
        assertEquals(PauseTier.TIER_2_FROZEN, engine.evaluatePauseDuration(30)); // Exact upper bound
        assertEquals(PauseTier.TIER_3_BROKEN, engine.evaluatePauseDuration(31)); // Just over
    }

    @Test
    void multiplier_scalesCorrectlyAndCapsAtTwo() {
        assertEquals(1.0, engine.calculateMultiplier(0), 0.001);
        assertEquals(1.2, engine.calculateMultiplier(1), 0.001);
        assertEquals(1.8, engine.calculateMultiplier(4), 0.001);
        assertEquals(2.0, engine.calculateMultiplier(5), 0.001); // Reaches cap
        assertEquals(2.0, engine.calculateMultiplier(10), 0.001); // Sustains cap
    }

    @Test
    void completion_tier1Pause_zeroStreak_incrementsToOne() {
        FlowCompletionResult result = engine.evaluateCompletion(0, PauseTier.TIER_1_GRACE);

        assertEquals(1, result.getNewFlowStreak());
        assertEquals(1.0, result.getMultiplierApplied(), 0.001); // Streak 0 = 1.0x
        assertFalse(result.isFlowStreakBroken());
    }

    @Test
    void completion_tier1Pause_incrementsStreak() {
        FlowCompletionResult result = engine.evaluateCompletion(2, PauseTier.TIER_1_GRACE);

        assertEquals(3, result.getNewFlowStreak());
        assertEquals(1.4, result.getMultiplierApplied(), 0.001);
        assertFalse(result.isFlowStreakBroken());
    }

    @Test
    void completion_tier2Pause_freezesStreak() {
        FlowCompletionResult result = engine.evaluateCompletion(2, PauseTier.TIER_2_FROZEN);

        assertEquals(2, result.getNewFlowStreak()); // Frozen at 2
        assertEquals(1.4, result.getMultiplierApplied(), 0.001);
        assertFalse(result.isFlowStreakBroken());
    }

    @Test
    void completion_tier3Pause_resetsStreak() {
        FlowCompletionResult result = engine.evaluateCompletion(4, PauseTier.TIER_3_BROKEN);

        assertEquals(0, result.getNewFlowStreak()); // Reset to 0
        assertEquals(1.8, result.getMultiplierApplied(), 0.001); // Still gets multiplier for THIS session
        assertTrue(result.isFlowStreakBroken());
    }
}