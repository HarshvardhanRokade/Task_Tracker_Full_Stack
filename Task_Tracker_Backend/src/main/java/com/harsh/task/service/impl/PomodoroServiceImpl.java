package com.harsh.task.service.impl;

import com.harsh.task.domain.dto.PomodoroRewardDto;
import com.harsh.task.entity.User;
import com.harsh.task.engine.*;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.UserRepository;
import com.harsh.task.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PomodoroServiceImpl implements PomodoroService {

    private final UserRepository userRepository;
    private final XpEngine xpEngine;
    private final StreakEngine streakEngine;
    private final FlowEngine flowEngine;

    // --- Magic Numbers Banished ---
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

        // Guard: Prevent double /start from overwriting an active session
        if (user.getSessionDeadline() != null && now.isBefore(user.getSessionDeadline())) {
            log.info("User {} attempted to start a session, but one is already active.", userId);
            return;
        }

        // 1. Check if they respected the 40-minute window from their LAST session
        if (!flowEngine.isFlowMaintainedAtStart(user.getLastPomodoroTime(), now)) {
            user.setPomodoroFlowStreak(0); // Window missed, reset flow
        }

        // 2. Set Session State (Strict 40-minute wall-clock deadline)
        user.setSessionDeadline(now.plusMinutes(SESSION_DEADLINE_MINUTES));
        user.setPauseStartTime(null);
        user.setWorstPauseTier(null);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public void pauseSession(Long userId) {
        User user = getUser(userId);

        if (user.getSessionDeadline() == null || user.getPauseStartTime() != null) {
            return;
        }

        user.setPauseStartTime(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resumeSession(Long userId) {
        User user = getUser(userId);

        if (user.getPauseStartTime() == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        long pauseDurationMinutes = Duration.between(user.getPauseStartTime(), now).toMinutes();

        // 1. Extend the absolute deadline (Capped at 15 minutes to prevent abuse)
        long cappedExtension = Math.min(pauseDurationMinutes, MAX_PAUSE_EXTENSION_MINUTES);
        user.setSessionDeadline(user.getSessionDeadline().plusMinutes(cappedExtension));

        // 2. Evaluate the pause tier (Based on RAW duration, not the capped extension)
        PauseTier currentPauseTier = flowEngine.evaluatePauseDuration(pauseDurationMinutes);

        // 3. Escalate the Worst Pause Tier if necessary
        if (user.getWorstPauseTier() == null || currentPauseTier.ordinal() > user.getWorstPauseTier().ordinal()) {
            user.setWorstPauseTier(currentPauseTier);
        }

        // 4. Clear the pause state
        user.setPauseStartTime(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public PomodoroRewardDto completeSession(Long userId) {
        User user = getUser(userId);
        LocalDateTime now = LocalDateTime.now();

        // --- 1. Degraded Success Check (Out of Sequence API Call) ---
        if (user.getSessionDeadline() == null) {
            log.warn("User {} called /complete without an active session.", userId);
            return handleDegradedSuccess(user, now);
        }

        // --- 2. Evaluate Flow State ---
        PauseTier effectiveTier = user.getWorstPauseTier() != null ? user.getWorstPauseTier() : PauseTier.TIER_1_GRACE;

        // Strict boundary: If deadline has passed at all, flow is broken
        if (now.isAfter(user.getSessionDeadline())) {
            effectiveTier = PauseTier.TIER_3_BROKEN;
        }

        FlowCompletionResult flowResult = flowEngine.evaluateCompletion(user.getPomodoroFlowStreak(), effectiveTier);

        // --- 3. Calculate Daily Streak ---
        StreakResult streakResult = streakEngine.calculate(
                user.getCurrentDailyStreak(), user.getLongestDailyStreak(),
                user.getStreakFreezesOwned(), user.getLastActiveTimestamp(), now
        );

        // --- 4. Calculate XP and Leveling ---
        XpResult xpResult = xpEngine.calculate(
                user.getLevel(), user.getCurrentXp(), user.getTotalXp(),
                POMODORO_BASE_XP, flowResult.getMultiplierApplied(), DEFAULT_EVENT_MULTIPLIER
        );

        // --- 5. Calculate Gems (Separated for DTO clarity) ---
        int calculatedGems = (int) Math.round(POMODORO_BASE_GEMS * flowResult.getMultiplierApplied());
        int finalGemsEarned = calculatedGems + xpResult.getLevelUpGemBonus();

        // --- 6. Apply all calculated states to the User ---
        applyResultsToUser(user, flowResult, streakResult, xpResult, finalGemsEarned, now);

        // --- 7. Package and return the DTO ---
        return PomodoroRewardDto.builder()
                .xpEarned(xpResult.getFinalXpEarned())
                .gemsEarned(calculatedGems) // Base gems only
                .multiplierApplied(flowResult.getMultiplierApplied())
                .didLevelUp(xpResult.isDidLevelUp())
                .newLevel(xpResult.getNewLevel())
                .levelUpGemBonus(xpResult.getLevelUpGemBonus()) // Separated bonus
                .currentXp(xpResult.getNewCurrentXp())
                .totalXp(xpResult.getNewTotalXp())
                .xpToNextLevel(xpResult.getXpToNextLevel())
                .dailyStreak(streakResult.getNewCurrentDailyStreak())
                .longestDailyStreak(streakResult.getNewLongestDailyStreak())
                .flowStreak(flowResult.getNewFlowStreak())
                .flowStreakBroken(flowResult.isFlowStreakBroken())
                .sessionStateInvalid(false)
                .freezeUsed(streakResult.isFreezeUsed())
                .build();
    }

    private PomodoroRewardDto handleDegradedSuccess(User user, LocalDateTime now) {
        XpResult xpResult = xpEngine.calculate(user.getLevel(), user.getCurrentXp(), user.getTotalXp(), POMODORO_BASE_XP, 1.0, DEFAULT_EVENT_MULTIPLIER);
        StreakResult streakResult = streakEngine.calculate(user.getCurrentDailyStreak(), user.getLongestDailyStreak(), user.getStreakFreezesOwned(), user.getLastActiveTimestamp(), now);

        int calculatedGems = POMODORO_BASE_GEMS; // 1.0x multiplier
        int finalGems = calculatedGems + xpResult.getLevelUpGemBonus();

        FlowCompletionResult degradedFlow = FlowCompletionResult.builder()
                .newFlowStreak(0).multiplierApplied(1.0).flowStreakBroken(true).build();

        applyResultsToUser(user, degradedFlow, streakResult, xpResult, finalGems, now);

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
                .build();
    }

    private void applyResultsToUser(User user, FlowCompletionResult flow, StreakResult streak, XpResult xp, int totalGems, LocalDateTime now) {
        user.setCurrentXp(xp.getNewCurrentXp());
        user.setTotalXp(xp.getNewTotalXp());
        user.setLevel(xp.getNewLevel());
        user.setGemBalance(user.getGemBalance() + totalGems); // Combined total applied to DB

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

    @Transactional
    public void forfeitSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Clear the active session flags
        user.setSessionDeadline(null);
        user.setPauseStartTime(null);
        user.setWorstPauseTier(null);

        // Note: The flow streak itself will reset on the next /start
        // if the 40-minute window was missed anyway.
        userRepository.save(user);
    }
}