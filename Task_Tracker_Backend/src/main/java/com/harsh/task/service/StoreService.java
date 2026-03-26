package com.harsh.task.service;

import com.harsh.task.domain.dto.PurchaseRequestDto;
import com.harsh.task.domain.dto.PurchaseResultDto;
import com.harsh.task.domain.dto.UserInventoryDto;
import com.harsh.task.entity.User;
import com.harsh.task.exception.InsufficientGemsException;
import com.harsh.task.exception.PriceChangedException;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.badge.BadgeService;
import com.harsh.task.badge.BadgeContext;
import com.harsh.task.badge.BadgeEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final UserRepository userRepository;
    private final BadgeService badgeService; // ✨ Injected

    // ✨ FIXED: readOnly transaction keeps Hibernate session open for EAGER collection mapping
    @Transactional(readOnly = true)
    public UserInventoryDto getInventory(Long userId) {
        User user = getUser(userId);
        return UserInventoryDto.fromUser(user);
    }

    @Transactional
    public PurchaseResultDto purchaseItem(Long userId, PurchaseRequestDto request) {
        User user = getUser(userId);

        // 1. Route the purchase to the correct item logic and capture the result
        PurchaseResultDto result = switch (request.itemId()) {
            case "STREAK_FREEZE" -> purchaseStreakFreeze(user, request.expectedCost());
            case "XP_BOOST" -> purchaseXpBoost(user, request.expectedCost());
            case "THEME" -> purchaseTheme(user, request.themeName(), request.expectedCost());
            default -> throw new IllegalArgumentException("Unknown artifact: " + request.itemId());
        };

        // ✨ 2. Fire the Badge Event (we don't need to return the DTOs to the frontend)
        BadgeContext purchaseContext = BadgeContext.builder()
                .user(user)
                .event(BadgeEvent.STORE_PURCHASE)
                .build();
        badgeService.checkAndAward(purchaseContext);

        // 3. Return the standard store response
        return result;
    }

    @Transactional
    public PurchaseResultDto equipTheme(Long userId, String themeName) {
        User user = getUser(userId);

        if (!user.getOwnedThemes().contains(themeName)) {
            throw new IllegalStateException("You must purchase the '" + themeName + "' theme before equipping it.");
        }

        user.setProfileTheme(themeName);
        userRepository.save(user);

        return PurchaseResultDto.builder()
                .success(true)
                .itemId("EQUIP_THEME")
                .gemCost(0)
                .newGemBalance(user.getGemBalance())
                .message("Theme equipped successfully!")
                .themeUnlocked(themeName)
                .build();
    }

    // --- INTERNAL PURCHASE MECHANICS ---

    private PurchaseResultDto purchaseStreakFreeze(User user, int expectedCost) {
        if (user.getStreakFreezesOwned() >= 5) {
            throw new IllegalStateException("Inventory full! You already own the maximum of 5 Streak Shields.");
        }

        int streak = user.getCurrentDailyStreak();
        int actualCost = streak >= 30 ? 200 : streak >= 7 ? 100 : 50;

        validatePrice(expectedCost, actualCost);
        deductGems(user, actualCost);

        user.setStreakFreezesOwned(user.getStreakFreezesOwned() + 1);
        userRepository.save(user);

        return PurchaseResultDto.builder()
                .success(true)
                .itemId("STREAK_FREEZE")
                .gemCost(actualCost)
                .newGemBalance(user.getGemBalance())
                .message("Streak protected! Auto-activates if you miss a day. No expiry.")
                .newStreakFreezesOwned(user.getStreakFreezesOwned())
                .build();
    }

    private PurchaseResultDto purchaseXpBoost(User user, int expectedCost) {
        if (user.isXpBoostActive()) {
            throw new IllegalStateException("You already have an active XP Boost. Use it to clear space in your inventory!");
        }

        int actualCost = 75;
        validatePrice(expectedCost, actualCost);
        deductGems(user, actualCost);

        user.setXpBoostActive(true);
        userRepository.save(user);

        return PurchaseResultDto.builder()
                .success(true)
                .itemId("XP_BOOST")
                .gemCost(actualCost)
                .newGemBalance(user.getGemBalance())
                .message("XP Boost activated! Your next Pomodoro or High/Medium Quest will grant 1.5x XP.")
                .boostActivated(true)
                .build();
    }

    private PurchaseResultDto purchaseTheme(User user, String themeName, int expectedCost) {
        if (themeName == null || themeName.isBlank()) {
            throw new IllegalArgumentException("Theme name is required.");
        }
        if (user.getOwnedThemes().contains(themeName)) {
            throw new IllegalStateException("You already own the " + themeName + " theme.");
        }

        int actualCost = 200;
        validatePrice(expectedCost, actualCost);
        deductGems(user, actualCost);

        user.getOwnedThemes().add(themeName);
        user.setProfileTheme(themeName); // Auto-equip it so they see it immediately!
        userRepository.save(user);

        return PurchaseResultDto.builder()
                .success(true)
                .itemId("THEME")
                .gemCost(actualCost)
                .newGemBalance(user.getGemBalance())
                .message("Theme unlocked and equipped!")
                .themeUnlocked(themeName)
                .build();
    }

    // --- SAFETY HELPERS ---

    private void deductGems(User user, int cost) {
        if (user.getGemBalance() < cost) {
            int shortfall = cost - user.getGemBalance();
            throw new InsufficientGemsException("You need " + shortfall + " more gems to afford this.");
        }
        user.setGemBalance(user.getGemBalance() - cost);
    }

    private void validatePrice(int expectedCost, int actualCost) {
        if (expectedCost != actualCost) {
            throw new PriceChangedException("Pricing tier updated based on your current stats.", actualCost);
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User ID " + userId + " not found"));
    }
}