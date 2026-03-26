package com.harsh.task.service.impl;

import com.harsh.task.domain.dto.BadgeAwardDto;
import com.harsh.task.domain.dto.PomodoroRewardDto;
import com.harsh.task.entity.LevelUp;
import com.harsh.task.entity.PomodoroSession;
import com.harsh.task.entity.User;
import com.harsh.task.engine.*;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.LevelUpRepository;
import com.harsh.task.repository.PomodoroSessionRepository;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.service.PomodoroService;
import com.harsh.task.badge.BadgeService;
import com.harsh.task.badge.BadgeContext;
import com.harsh.task.badge.BadgeEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PomodoroServiceImpl implements PomodoroService {

    private final UserRepository userRepository;
    private final XpEngine xpEngine;
    private final StreakEngine streakEngine;
    private final FlowEngine flowEngine;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final LevelUpRepository levelUpRepository;
    private final BadgeService badgeService;

    private static final int POMODORO_BASE_XP = 100;
    private static final int POMODORO_BASE_GEMS = 5;
    private static final int SESSION_DEADLINE_MINUTES = 40;
    private static final int MAX_PAUSE_EXTENSION_MINUTES = 15;
    private static final double DEFAULT_EVENT_MULTIPLIER = 1.0;

    @Override
    @Transactional
    public void startSession(Long userId) {
        User user = getUser(userId);
        LocalDateTime now = LocalDateTime.now();

        if (user.getSessionDeadline() != null && now.isBefore(user.getSessionDeadline())) {
            log.info("User {} attempted to start a session, but one is already active.", userId);
            return;
        }

        if (!flowEngine.isFlowMaintainedAtStart(user.getLastPomodoroTime(), now)) {
            user.setPomodoroFlowStreak(0);
        }

        user.setSessionDeadline(now.plusMinutes(SESSION_DEADLINE_MINUTES));
        user.setPauseStartTime(null);
        user.setWorstPauseTier(null);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void pauseSession(Long userId) {
        User user = getUser(userId);
        if (user.getSessionDeadline() == null || user.getPauseStartTime() != null) return;

        user.setPauseStartTime(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resumeSession(Long userId) {
        User user = getUser(userId);
        if (user.getPauseStartTime() == null) return;

        LocalDateTime now = LocalDateTime.now();
        long pauseDurationMinutes = Duration.between(user.getPauseStartTime(), now).toMinutes();

        long cappedExtension = Math.min(pauseDurationMinutes, MAX_PAUSE_EXTENSION_MINUTES);
        user.setSessionDeadline(user.getSessionDeadline().plusMinutes(cappedExtension));

        PauseTier currentPauseTier = flowEngine.evaluatePauseDuration(pauseDurationMinutes);

        if (user.getWorstPauseTier() == null || currentPauseTier.ordinal() > user.getWorstPauseTier().ordinal()) {
            user.setWorstPauseTier(currentPauseTier);
        }

        user.setPauseStartTime(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public PomodoroRewardDto completeSession(Long userId) {
        User user = getUser(userId);
        LocalDateTime now = LocalDateTime.now();

        if (user.getSessionDeadline() == null) {
            log.warn("User {} called /complete without an active session.", userId);
            return handleDegradedSuccess(user, now);
        }

        PauseTier effectiveTier = user.getWorstPauseTier() != null ? user.getWorstPauseTier() : PauseTier.TIER_1_GRACE;
        if (now.isAfter(user.getSessionDeadline())) effectiveTier = PauseTier.TIER_3_BROKEN;

        FlowCompletionResult flowResult = flowEngine.evaluateCompletion(user.getPomodoroFlowStreak(), effectiveTier);

        StreakResult streakResult = streakEngine.calculate(
                user.getCurrentDailyStreak(), user.getLongestDailyStreak(),
                user.getStreakFreezesOwned(), user.getLastActiveTimestamp(), now
        );

        double eventMultiplier = 1.0;
        boolean boostConsumed = false;

        if (user.isXpBoostActive()) {
            eventMultiplier = 1.5;
            boostConsumed = true;
            user.setXpBoostActive(false);
        }

        int levelBeforeXp = user.getLevel();

        XpResult xpResult = xpEngine.calculate(
                user.getLevel(), user.getCurrentXp(), user.getTotalXp(),
                POMODORO_BASE_XP, flowResult.getMultiplierApplied(), eventMultiplier
        );

        int calculatedGems = (int) Math.round(POMODORO_BASE_GEMS * flowResult.getMultiplierApplied());
        int finalGemsEarned = calculatedGems + xpResult.getLevelUpGemBonus();

        // Save User Data
        applyResultsToUser(user, flowResult, streakResult, xpResult, finalGemsEarned, now);

        // Save History
        recordSession(user, xpResult, calculatedGems,
                flowResult.getMultiplierApplied(),
                flowResult.getNewFlowStreak(),
                false, boostConsumed, now);

        recordLevelUpsIfOccurred(user, xpResult, levelBeforeXp, "POMODORO", now);

        // ✨ NEW: Badge Evaluation Logic
        long totalPomodoros = pomodoroSessionRepository.countByUserId(userId);

        BadgeContext badgeContext = BadgeContext.builder()
                .user(user)
                .event(BadgeEvent.POMODORO_COMPLETED)
                .totalPomodoros(totalPomodoros)
                .newLevel(xpResult.getNewLevel())
                .currentStreak(streakResult.getNewCurrentDailyStreak())
                .build();

        List<BadgeAwardDto> newBadges = badgeService.checkAndAward(badgeContext);

        // Check level badges if leveled up
        if (xpResult.isDidLevelUp()) {
            BadgeContext levelContext = BadgeContext.builder()
                    .user(user)
                    .event(BadgeEvent.LEVEL_UP)
                    .newLevel(xpResult.getNewLevel())
                    .build();
            newBadges.addAll(badgeService.checkAndAward(levelContext));
        }

        // Check streak badges
        if (streakResult.getNewCurrentDailyStreak() > 0) {
            BadgeContext streakContext = BadgeContext.builder()
                    .user(user)
                    .event(BadgeEvent.STREAK_UPDATED)
                    .currentStreak(streakResult.getNewCurrentDailyStreak())
                    .build();
            newBadges.addAll(badgeService.checkAndAward(streakContext));
        }

        return PomodoroRewardDto.builder()
                .xpEarned(xpResult.getFinalXpEarned())
                .gemsEarned(calculatedGems)
                .multiplierApplied(flowResult.getMultiplierApplied())
                .didLevelUp(xpResult.isDidLevelUp())
                .newLevel(xpResult.getNewLevel())
                .levelUpGemBonus(xpResult.getLevelUpGemBonus())
                .currentXp(xpResult.getNewCurrentXp())
                .totalXp(xpResult.getNewTotalXp())
                .xpToNextLevel(xpResult.getXpToNextLevel())
                .dailyStreak(streakResult.getNewCurrentDailyStreak())
                .longestDailyStreak(streakResult.getNewLongestDailyStreak())
                .flowStreak(flowResult.getNewFlowStreak())
                .flowStreakBroken(flowResult.isFlowStreakBroken())
                .sessionStateInvalid(false)
                .freezeUsed(streakResult.isFreezeUsed())
                .boostConsumed(boostConsumed)
                .newBadges(newBadges) // ✨ Added to DTO
                .build();
    }

    private PomodoroRewardDto handleDegradedSuccess(User user, LocalDateTime now) {
        int levelBeforeXp = user.getLevel();

        XpResult xpResult = xpEngine.calculate(user.getLevel(), user.getCurrentXp(), user.getTotalXp(), POMODORO_BASE_XP, 1.0, DEFAULT_EVENT_MULTIPLIER);
        StreakResult streakResult = streakEngine.calculate(user.getCurrentDailyStreak(), user.getLongestDailyStreak(), user.getStreakFreezesOwned(), user.getLastActiveTimestamp(), now);

        int calculatedGems = POMODORO_BASE_GEMS;
        int finalGems = calculatedGems + xpResult.getLevelUpGemBonus();

        FlowCompletionResult degradedFlow = FlowCompletionResult.builder()
                .newFlowStreak(0).multiplierApplied(1.0).flowStreakBroken(true).build();

        applyResultsToUser(user, degradedFlow, streakResult, xpResult, finalGems, now);

        recordSession(user, xpResult, calculatedGems, 1.0, 0, true, false, now);

        recordLevelUpsIfOccurred(user, xpResult, levelBeforeXp, "POMODORO", now);

        // ✨ Evaluate badges even on a degraded success (they still finished the timer!)
        long totalPomodoros = pomodoroSessionRepository.countByUserId(user.getId());
        List<BadgeAwardDto> newBadges = new ArrayList<>();

        BadgeContext badgeContext = BadgeContext.builder()
                .user(user)
                .event(BadgeEvent.POMODORO_COMPLETED)
                .totalPomodoros(totalPomodoros)
                .newLevel(xpResult.getNewLevel())
                .currentStreak(streakResult.getNewCurrentDailyStreak())
                .build();

        newBadges.addAll(badgeService.checkAndAward(badgeContext));

        if (xpResult.isDidLevelUp()) {
            BadgeContext levelContext = BadgeContext.builder()
                    .user(user)
                    .event(BadgeEvent.LEVEL_UP)
                    .newLevel(xpResult.getNewLevel())
                    .build();
            newBadges.addAll(badgeService.checkAndAward(levelContext));
        }

        if (streakResult.getNewCurrentDailyStreak() > 0) {
            BadgeContext streakContext = BadgeContext.builder()
                    .user(user)
                    .event(BadgeEvent.STREAK_UPDATED)
                    .currentStreak(streakResult.getNewCurrentDailyStreak())
                    .build();
            newBadges.addAll(badgeService.checkAndAward(streakContext));
        }

        return PomodoroRewardDto.builder()
                .xpEarned(xpResult.getFinalXpEarned())
                .gemsEarned(calculatedGems)
                .multiplierApplied(1.0)
                .didLevelUp(xpResult.isDidLevelUp())
                .newLevel(xpResult.getNewLevel())
                .levelUpGemBonus(xpResult.getLevelUpGemBonus())
                .currentXp(xpResult.getNewCurrentXp())
                .totalXp(xpResult.getNewTotalXp())
                .xpToNextLevel(xpResult.getXpToNextLevel())
                .dailyStreak(streakResult.getNewCurrentDailyStreak())
                .longestDailyStreak(streakResult.getNewLongestDailyStreak())
                .flowStreak(0)
                .flowStreakBroken(false)
                .sessionStateInvalid(true)
                .freezeUsed(streakResult.isFreezeUsed())
                .newBadges(newBadges) // ✨ Added to DTO
                .build();
    }

    @Transactional
    public void forfeitSession(Long userId) {
        User user = getUser(userId);
        user.setSessionDeadline(null);
        user.setPauseStartTime(null);
        user.setWorstPauseTier(null);
        userRepository.save(user);
    }

    private void applyResultsToUser(User user, FlowCompletionResult flow, StreakResult streak, XpResult xp, int totalGems, LocalDateTime now) {
        user.setCurrentXp(xp.getNewCurrentXp());
        user.setTotalXp(xp.getNewTotalXp());
        user.setLevel(xp.getNewLevel());
        user.setGemBalance(user.getGemBalance() + totalGems);

        user.setCurrentDailyStreak(streak.getNewCurrentDailyStreak());
        user.setLongestDailyStreak(streak.getNewLongestDailyStreak());
        user.setStreakFreezesOwned(streak.getNewStreakFreezesOwned());
        user.setLastActiveTimestamp(streak.getNewLastActiveTimestamp());

        user.setPomodoroFlowStreak(flow.getNewFlowStreak());
        user.setLastPomodoroTime(now);

        user.setSessionDeadline(null);
        user.setPauseStartTime(null);
        user.setWorstPauseTier(null);

        userRepository.save(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private void recordSession(User user, XpResult xpResult,
                               int gemsEarned, double multiplier,
                               int flowStreakAtCompletion, boolean wasDegraded,
                               boolean boostConsumed, LocalDateTime completedAt) {
        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .completedAt(completedAt)
                .xpEarned(xpResult.getFinalXpEarned())
                .gemsEarned(gemsEarned)
                .multiplierApplied(multiplier)
                .flowStreakAtCompletion(flowStreakAtCompletion)
                .wasDegraded(wasDegraded)
                .boostConsumed(boostConsumed)
                .build();

        pomodoroSessionRepository.save(session);
    }

    private void recordLevelUpsIfOccurred(User user, XpResult xpResult, int levelBeforeXp, String triggeredBy, LocalDateTime now) {
        if (!xpResult.isDidLevelUp()) return;

        for (int level = levelBeforeXp + 1; level <= xpResult.getNewLevel(); level++) {
            LevelUp levelUp = LevelUp.builder()
                    .user(user)
                    .levelReached(level)
                    .achievedAt(now)
                    .xpTotalAtLevelUp(xpResult.getNewTotalXp())
                    .triggeredBy(triggeredBy)
                    .build();
            levelUpRepository.save(levelUp);
        }
    }
}