package com.harsh.task.engine;

public enum PauseTier {
    TIER_1_GRACE,   // < 15 mins (Normal)
    TIER_2_FROZEN,  // 15 - 30 mins (No increment)
    TIER_3_BROKEN   // > 30 mins (Reset to 0)
}