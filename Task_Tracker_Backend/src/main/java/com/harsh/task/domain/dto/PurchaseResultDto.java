package com.harsh.task.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResultDto {
    private boolean success;
    private String itemId;
    private int gemCost;
    private int newGemBalance;
    private String message;

    // UI Update Triggers
    private Integer newStreakFreezesOwned;
    private Boolean boostActivated;
    private String themeUnlocked;
}