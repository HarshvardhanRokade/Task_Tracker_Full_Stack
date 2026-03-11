package com.harsh.task.engine;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class XpResult {
    private final int finalXpEarned;
    private final int newCurrentXp;
    private final int newTotalXp;
    private final int newLevel;
    private final boolean didLevelUp;
    private final int levelUpGemBonus;
    private final int xpToNextLevel;
}
