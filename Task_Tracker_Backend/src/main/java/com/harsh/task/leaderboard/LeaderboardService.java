package com.harsh.task.leaderboard;

import com.harsh.task.domain.dto.*;
import com.harsh.task.entity.*;
import com.harsh.task.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final WeeklyScoreCalculator calculator;
    private final WeeklyScoreRepository weeklyScoreRepository;
    private final UserRepository userRepository;
    private final SeasonRepository seasonRepository;

    private static final int TOP_N = 10;
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter FULL_DATE_FMT =
            DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Transactional
    public LeaderboardResponseDto getLeaderboard(Long currentUserId) {
        LocalDate weekStart = WeeklyScoreCalculator.getCurrentWeekStart();
        LocalDate prevWeekStart = WeeklyScoreCalculator.getPreviousWeekStart();

        // Ensure current user has a score record
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow();
        calculator.getOrCalculate(currentUser, weekStart);

        // Fetch top 10 for current week
        List<WeeklyScore> currentWeekScores = weeklyScoreRepository
                .findTopByWeek(weekStart, PageRequest.of(0, TOP_N));

        // Fetch top 10 for last week (read-only, no recalculation)
        List<WeeklyScore> lastWeekScores = weeklyScoreRepository
                .findTopByWeek(prevWeekStart, PageRequest.of(0, TOP_N));

        // Build current week entries
        List<LeaderboardEntryDto> currentWeek =
                buildEntries(currentWeekScores, currentUserId);

        // Build last week entries
        List<LeaderboardEntryDto> lastWeek =
                buildEntries(lastWeekScores, currentUserId);

        // Build personal breakdown
        PersonalBreakdownDto breakdown =
                buildPersonalBreakdown(currentUserId, currentWeek, weekStart);

        // Build week info
        WeekInfoDto weekInfo = buildWeekInfo(weekStart);

        return LeaderboardResponseDto.builder()
                .currentWeek(currentWeek)
                .lastWeek(lastWeek)
                .personalBreakdown(breakdown)
                .weekInfo(weekInfo)
                .build();
    }

    private List<LeaderboardEntryDto> buildEntries(
            List<WeeklyScore> scores, Long currentUserId) {

        AtomicInteger rank = new AtomicInteger(1);

        return scores.stream()
                .map(ws -> LeaderboardEntryDto.builder()
                        .rank(rank.getAndIncrement())
                        .userId(ws.getUser().getId())
                        .username(ws.getUser().getUsername())
                        .level(ws.getUser().getLevel())
                        .levelTitle(getLevelName(ws.getUser().getLevel()))
                        .totalScore(ws.getTotalScore())
                        .taskPoints(ws.getTaskPoints())
                        .pomodoroPoints(ws.getPomodoroPoints())
                        .consistencyPoints(ws.getConsistencyPoints())
                        .daysActive(ws.getDaysActive())
                        .tasksCompleted(ws.getTasksCompleted())
                        .pomodorosCompleted(ws.getPomodorosCompleted())
                        .currentDailyStreak(
                                ws.getUser().getCurrentDailyStreak())
                        .isCurrentUser(
                                ws.getUser().getId().equals(currentUserId))
                        .build())
                .toList();
    }

    private PersonalBreakdownDto buildPersonalBreakdown(
            Long userId,
            List<LeaderboardEntryDto> currentWeek,
            LocalDate weekStart) {

        // Find user's rank in current leaderboard
        int rank = currentWeek.stream()
                .filter(LeaderboardEntryDto::isCurrentUser)
                .map(LeaderboardEntryDto::getRank)
                .findFirst()
                .orElse(currentWeek.size() + 1);

        // Get their score
        WeeklyScore score = weeklyScoreRepository
                .findByUserIdAndWeekStartDate(userId, weekStart)
                .orElse(WeeklyScore.builder()
                        .totalScore(0).taskPoints(0)
                        .pomodoroPoints(0).consistencyPoints(0)
                        .daysActive(0).tasksCompleted(0)
                        .pomodorosCompleted(0).build());

        return PersonalBreakdownDto.builder()
                .rank(rank)
                .totalScore(score.getTotalScore())
                .taskPoints(score.getTaskPoints())
                .pomodoroPoints(score.getPomodoroPoints())
                .consistencyPoints(score.getConsistencyPoints())
                .daysActive(score.getDaysActive())
                .tasksCompleted(score.getTasksCompleted())
                .pomodorosCompleted(score.getPomodorosCompleted())
                .maxConsistencyPoints(35)
                .build();
    }

    private WeekInfoDto buildWeekInfo(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(7);

        // Seconds until next Monday midnight
        LocalDateTime nextReset = weekEnd.atStartOfDay();
        long secondsUntilReset = ChronoUnit.SECONDS.between(
                LocalDateTime.now(), nextReset
        );

        // Current season info
        Season season = seasonRepository.findByIsActiveTrue()
                .orElse(null);

        return WeekInfoDto.builder()
                .weekStartDate(weekStart.format(FULL_DATE_FMT))
                .weekEndDate(weekEnd.minusDays(1).format(FULL_DATE_FMT))
                .secondsUntilReset(Math.max(0, secondsUntilReset))
                .currentSeasonNumber(season != null
                        ? season.getSeasonNumber() : 0)
                .currentSeasonName(season != null
                        ? season.getName() : "No active season")
                .seasonEndDate(season != null
                        ? season.getEndDate().format(FULL_DATE_FMT) : "")
                .build();
    }

    private String getLevelName(int level) {
        if (level >= 50) return "Transcendent Planner";
        if (level >= 30) return "Legendary Focuser";
        if (level >= 20) return "Deep Work Champion";
        if (level >= 15) return "Productivity Sage";
        if (level >= 10) return "Flow Master";
        if (level >= 8)  return "Flow Initiate";
        if (level >= 5)  return "Dedicated Grinder";
        if (level >= 3)  return "Focus Seeker";
        if (level >= 2)  return "Task Apprentice";
        return "Novice Planner";
    }
}