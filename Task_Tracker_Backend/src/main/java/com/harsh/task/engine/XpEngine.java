package com.harsh.task.engine;

import org.springframework.stereotype.Component;

@Component
public class XpEngine {

    /**
     * Calculates the XP reward, applies multipliers safely, and processes level-ups.
     */
    public XpResult calculate(int currentLevel, int currentXp, int totalXp,
                              int baseReward, double flowMultiplier, double eventMultiplier) {

        // --- Defensive Guards ---
        if (currentLevel < 1) throw new IllegalArgumentException("Level must be >= 1");
        if (baseReward < 0) throw new IllegalArgumentException("Base reward cannot be negative");
        if (flowMultiplier < 0) throw new IllegalArgumentException("Flow multiplier cannot be negative");

        // 1. Calculate Multipliers with the Mathematical Floor
        double combinedMultiplier = 1.0 + (flowMultiplier - 1.0) + (eventMultiplier - 1.0);
        int calculatedReward = (int) Math.round(baseReward * combinedMultiplier);

        int finalXpEarned = Math.max(baseReward, calculatedReward); // The Floor

        // 2. Add to current stats
        int newTotalXp = totalXp + finalXpEarned;
        int newCurrentXp = currentXp + finalXpEarned;

        int simulatedLevel = currentLevel;
        int gemBonusAccumulator = 0;
        boolean leveledUp = false;

        // 3. Process Level-Ups (The Cumulative While Loop)
        while (newCurrentXp >= (simulatedLevel * 500)) {
            newCurrentXp -= (simulatedLevel * 500); // Carry over the remainder
            simulatedLevel++;
            gemBonusAccumulator += (simulatedLevel * 5);
            leveledUp = true;
        }

        // 4. Calculate XP needed for the NEXT level (Protected by floor)
        int xpToNextLevel = Math.max(0, (simulatedLevel * 500) - newCurrentXp);

        // 5. Package and return the results
        return XpResult.builder()
                .finalXpEarned(finalXpEarned)
                .newCurrentXp(newCurrentXp)
                .newTotalXp(newTotalXp)
                .newLevel(simulatedLevel)
                .didLevelUp(leveledUp)
                .levelUpGemBonus(gemBonusAccumulator)
                .xpToNextLevel(xpToNextLevel)
                .build();
    }
}