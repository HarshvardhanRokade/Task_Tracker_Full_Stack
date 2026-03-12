package com.harsh.task.engine;

import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class FlowEngine {

    /**
     * 1. Evaluates if the 40-minute window was respected between sessions.
     * Must also be the same calendar day.
     */
    public boolean isFlowMaintainedAtStart(LocalDateTime lastPomodoroTime, LocalDateTime newStartTime) {
        if (lastPomodoroTime == null) {
            return true; // First ever session
        }

        boolean isSameDay = lastPomodoroTime.toLocalDate().equals(newStartTime.toLocalDate());
        long minutesElapsed = Duration.between(lastPomodoroTime, newStartTime).toMinutes();

        return isSameDay && minutesElapsed <= 40;
    }

    /**
     * 2. Calculates the active multiplier for the current session.
     * Formula: 1.0 + (streak * 0.2), capped at 2.0.
     */
    public double calculateMultiplier(int currentFlowStreak) {
        if (currentFlowStreak <= 0) return 1.0;

        double multiplier = 1.0 + (currentFlowStreak * 0.2);
        return Math.min(2.0, multiplier); // Hard cap at 2.0x (reached at streak 5)
    }

    /**
     * 3. Determines the Pause Tier based on duration.
     */
    public PauseTier evaluatePauseDuration(long pauseDurationMinutes) {
        if (pauseDurationMinutes < 15) return PauseTier.TIER_1_GRACE;
        if (pauseDurationMinutes <= 30) return PauseTier.TIER_2_FROZEN;
        return PauseTier.TIER_3_BROKEN;
    }

    /**
     * 4. Calculates the final state upon session completion based on pause history.
     * * @param worstPauseTier The WORST tier encountered across ALL pauses in this session.
     * The orchestrator is responsible for tracking and escalating this value.
     * Example: Tier1 -> Tier2 -> Tier1 should pass TIER_2_FROZEN, not TIER_1_GRACE.
     */
    public FlowCompletionResult evaluateCompletion(int currentFlowStreak, PauseTier worstPauseTier) {
        int newStreak;
        boolean isBroken = false;

        switch (worstPauseTier) {
            case TIER_3_BROKEN:
                newStreak = 0;
                isBroken = true;
                break;
            case TIER_2_FROZEN:
                newStreak = currentFlowStreak; // Frozen! No increment, no reset.
                break;
            case TIER_1_GRACE:
            default:
                newStreak = currentFlowStreak + 1; // Standard progression
                break;
        }

        return FlowCompletionResult.builder()
                .newFlowStreak(newStreak)
                .multiplierApplied(calculateMultiplier(currentFlowStreak))
                .flowStreakBroken(isBroken)
                .build();
    }
}