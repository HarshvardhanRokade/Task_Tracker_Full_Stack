package com.harsh.task.badge;

import com.harsh.task.domain.dto.BadgeAwardDto;
import com.harsh.task.entity.Badge;
import com.harsh.task.entity.UserBadge;
import com.harsh.task.repository.BadgeRepository;
import com.harsh.task.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Transactional
    public List<BadgeAwardDto> checkAndAward(BadgeContext context) {
        List<BadgeAwardDto> newlyAwarded = new ArrayList<>();

        // Route to relevant checkers based on event type
        switch (context.getEvent()) {
            case TASK_COMPLETED     -> checkTaskBadges(context, newlyAwarded);
            case POMODORO_COMPLETED -> checkPomodoroBadges(context, newlyAwarded);
            case LEVEL_UP           -> checkLevelBadges(context, newlyAwarded);
            case STREAK_UPDATED     -> checkStreakBadges(context, newlyAwarded);
            case STORE_PURCHASE     -> checkEconomyBadges(context, newlyAwarded);
            case SEASON_END         -> checkSeasonBadges(context, newlyAwarded);
        }

        return newlyAwarded;
    }

    // --- Task Badges ---
    private void checkTaskBadges(BadgeContext ctx,
                                 List<BadgeAwardDto> awarded) {
        long total = ctx.getTotalTasksCompleted();
        tryAward(ctx, "TASKS_1",   total >= 1,   awarded);
        tryAward(ctx, "TASKS_10",  total >= 10,  awarded);
        tryAward(ctx, "TASKS_50",  total >= 50,  awarded);
        tryAward(ctx, "TASKS_100", total >= 100, awarded);
    }

    // --- Pomodoro Badges ---
    private void checkPomodoroBadges(BadgeContext ctx,
                                     List<BadgeAwardDto> awarded) {
        long total = ctx.getTotalPomodoros();
        tryAward(ctx, "POMODORO_1",  total >= 1,  awarded);
        tryAward(ctx, "POMODORO_10", total >= 10, awarded);
        tryAward(ctx, "POMODORO_50", total >= 50, awarded);
    }

    // --- Level Badges ---
    private void checkLevelBadges(BadgeContext ctx,
                                  List<BadgeAwardDto> awarded) {
        int level = ctx.getNewLevel();
        tryAward(ctx, "LEVEL_2",  level >= 2,  awarded);
        tryAward(ctx, "LEVEL_5",  level >= 5,  awarded);
        tryAward(ctx, "LEVEL_10", level >= 10, awarded);
        tryAward(ctx, "LEVEL_20", level >= 20, awarded);
    }

    // --- Streak Badges ---
    private void checkStreakBadges(BadgeContext ctx,
                                   List<BadgeAwardDto> awarded) {
        int streak = ctx.getCurrentStreak();
        tryAward(ctx, "STREAK_7",   streak >= 7,   awarded);
        tryAward(ctx, "STREAK_30",  streak >= 30,  awarded);
        tryAward(ctx, "STREAK_100", streak >= 100, awarded);
    }

    // --- Economy Badges ---
    private void checkEconomyBadges(BadgeContext ctx,
                                    List<BadgeAwardDto> awarded) {
        tryAward(ctx, "FIRST_PURCHASE", true, awarded);
    }

    // --- Season Badges ---
    private void checkSeasonBadges(BadgeContext ctx,
                                   List<BadgeAwardDto> awarded) {
        int rank         = ctx.getSeasonRank();
        int seasonNumber = ctx.getSeasonNumber();
        String badgeKey = "SEASON_" + seasonNumber + "_" +
                (rank == 1 ? "GOLD" :
                        rank == 2 ? "SILVER" : "BRONZE");

        // Only check for top 3
        if (rank <= 3) {
            tryAward(ctx, badgeKey, true, awarded);
        }
    }

    // --- Core Award Logic ---
    private void tryAward(BadgeContext ctx, String badgeKey,
                          boolean conditionMet,
                          List<BadgeAwardDto> awarded) {
        if (!conditionMet) return;

        Long userId = ctx.getUser().getId();

        // Already earned — skip
        if (userBadgeRepository.existsByUserIdAndBadgeBadgeKey(
                userId, badgeKey)) return;

        // Find badge definition
        Badge badge = badgeRepository.findByBadgeKey(badgeKey)
                .orElseGet(() -> {
                    log.warn("Badge key not found: {}", badgeKey);
                    return null;
                });

        if (badge == null) return;

        // Award the badge
        UserBadge userBadge = UserBadge.builder()
                .user(ctx.getUser())
                .badge(badge)
                .build();

        userBadgeRepository.save(userBadge);

        log.info("Badge awarded: {} to user {}",
                badgeKey, userId);

        awarded.add(BadgeAwardDto.builder()
                .badgeKey(badge.getBadgeKey())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .category(badge.getCategory())
                .build());
    }

    // --- Query Methods ---
    @Transactional(readOnly = true)
    public List<UserBadge> getUserBadges(Long userId) {
        return userBadgeRepository
                .findByUserIdOrderByEarnedAtDesc(userId);
    }
}