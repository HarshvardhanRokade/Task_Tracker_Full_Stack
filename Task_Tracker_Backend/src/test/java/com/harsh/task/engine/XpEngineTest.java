package com.harsh.task.engine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class XpEngineTest {

    private XpEngine engine;

    @BeforeEach
    void setUp() {
        engine = new XpEngine();
    }

    @Test
    void firstPomodoro_noMultiplier_returnsBaseXp() {
        XpResult result = engine.calculate(1, 0, 0, 100, 1.0, 1.0);

        assertEquals(100, result.getFinalXpEarned());
        assertFalse(result.isDidLevelUp());
        assertEquals(100, result.getNewCurrentXp());
        assertEquals(400, result.getXpToNextLevel());
    }

    @Test
    void levelUp_carriesOverRemainder() {
        // Level 1 needs 500 XP. User has 490, earns 50.
        XpResult result = engine.calculate(1, 490, 490, 50, 1.0, 1.0);

        assertTrue(result.isDidLevelUp());
        assertEquals(2, result.getNewLevel());
        assertEquals(40, result.getNewCurrentXp()); // 540 - 500 = 40
        assertEquals(10, result.getLevelUpGemBonus()); // Level 2 * 5 = 10
    }

    @Test
    void multiLevelJump_grinder_accumulatesGems() {
        // Level 49 Grinder. currentXp=24400, earns 200 XP.
        // 24400 + 200 = 24600 >= 24500 (49*500) -> levels to 50
        // remaining = 100, needs 25000 (50*500) -> stops
        XpResult result = engine.calculate(49, 24400, 500000, 200, 1.0, 1.0);

        assertTrue(result.isDidLevelUp());
        assertEquals(50, result.getNewLevel());
        assertEquals(100, result.getNewCurrentXp());
        assertEquals(250, result.getLevelUpGemBonus()); // Level 50 * 5 = 250
    }

    @Test
    void debuffEvent_floorPreventsLessThanBase() {
        // Event multiplier of 0.2 should still return base reward (100)
        XpResult result = engine.calculate(1, 0, 0, 100, 1.0, 0.2);

        assertEquals(100, result.getFinalXpEarned()); // Floor holds
    }

    @Test
    void zeroLevel_throwsIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () ->
                engine.calculate(0, 0, 0, 100, 1.0, 1.0)
        );
    }

    @Test
    void maxFlowMultiplier_capsAt2x() {
        // 2.0 flow + 1.0 event = 2.0 combined (additive, not multiplicative)
        XpResult result = engine.calculate(1, 0, 0, 100, 2.0, 1.0);

        assertEquals(200, result.getFinalXpEarned());
    }
}