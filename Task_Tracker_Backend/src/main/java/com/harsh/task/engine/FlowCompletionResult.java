package com.harsh.task.engine;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FlowCompletionResult {
    private final int newFlowStreak;
    private final double multiplierApplied; // The multiplier used for THIS session
    private final boolean flowStreakBroken;
}