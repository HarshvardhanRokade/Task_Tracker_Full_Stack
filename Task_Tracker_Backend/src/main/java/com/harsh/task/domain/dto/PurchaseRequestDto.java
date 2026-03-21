package com.harsh.task.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PurchaseRequestDto(
        @NotBlank(message = "Item ID is required")
        String itemId,

        @NotNull(message = "Expected cost is required to prevent price race conditions")
        @PositiveOrZero
        Integer expectedCost,

        // Optional: If they are buying a theme, they need to tell us which one
        String themeName
) {}