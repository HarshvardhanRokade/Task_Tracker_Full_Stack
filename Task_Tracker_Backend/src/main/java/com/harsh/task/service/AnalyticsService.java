package com.harsh.task.service;

import com.harsh.task.domain.dto.*;
import com.harsh.task.entity.LevelUp;
import com.harsh.task.entity.PomodoroSession;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.entity.User;
import com.harsh.task.exception.ResourceNotFoundException;
import com.harsh.task.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final LevelUpRepository levelUpRepository;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("MMM dd");

    // --- Level name helper (mirrors frontend) ---
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

    @Transactional(readOnly = true)
    public AnalyticsSummaryDto getSummary(Long userId) {
        User user = getUser(userId);

        long totalTasks = taskRepository
                .countByUserIdAndStatus(userId, TaskStatus.COMPLETED);

        long totalSessions = pomodoroSessionRepository.countByUserId(userId);

        Double avgMultiplier = pomodoroSessionRepository
                .findAverageMultiplier(userId);

        Integer bestFlowStreak = pomodoroSessionRepository
                .findBestFlowStreak(userId);

        return AnalyticsSummaryDto.builder()
                .currentLevel(user.getLevel())
                .levelTitle(getLevelName(user.getLevel()))
                .totalXp(user.getTotalXp())
                .currentDailyStreak(user.getCurrentDailyStreak())
                .longestDailyStreak(user.getLongestDailyStreak())
                .gemBalance(user.getGemBalance())
                .totalTasksCompleted(totalTasks)
                .totalPomodoroSessions(totalSessions)
                .averageMultiplier(avgMultiplier != null ?
                        Math.round(avgMultiplier * 100.0) / 100.0 : 0.0)
                .bestFlowStreak(bestFlowStreak != null ? bestFlowStreak : 0)
                .build();
    }

    @Transactional(readOnly = true)
    public TaskAnalyticsDto getTaskAnalytics(Long userId, AnalyticsPeriod period) {
        Instant after = period.toStartDate().toInstant(
                java.time.ZoneOffset.systemDefault()
                        .getRules().getOffset(period.toStartDate())
        );

        // Daily completions
        List<Object[]> dailyRaw = taskRepository
                .countDailyCompletions(userId, after);
        List<TaskAnalyticsDto.DailyCountDto> daily = dailyRaw.stream()
                .map(row -> TaskAnalyticsDto.DailyCountDto.builder()
                        .date(row[0].toString())
                        .count((Long) row[1])
                        .build())
                .toList();

        // By priority
        List<Object[]> priorityRaw = taskRepository
                .countByPriority(userId, after);
        Map<String, Integer> byPriority = new LinkedHashMap<>();
        byPriority.put("HIGH", 0);
        byPriority.put("MEDIUM", 0);
        byPriority.put("LOW", 0);
        priorityRaw.forEach(row ->
                byPriority.put(row[0].toString(), ((Long) row[1]).intValue())
        );

        // Top tags
        List<Object[]> tagRaw = taskRepository
                .countTopTags(userId, after, PageRequest.of(0, 5));
        List<TaskAnalyticsDto.TagCountDto> topTags = tagRaw.stream()
                .map(row -> TaskAnalyticsDto.TagCountDto.builder()
                        .tagName((String) row[0])
                        .count((Long) row[1])
                        .build())
                .toList();

        return TaskAnalyticsDto.builder()
                .dailyCompletions(daily)
                .byPriority(byPriority)
                .topTags(topTags)
                .build();
    }

    @Transactional(readOnly = true)
    public PomodoroAnalyticsDto getPomodoroAnalytics(Long userId, AnalyticsPeriod period) {
        LocalDateTime after = period.toStartDate();

        List<PomodoroSession> sessions = pomodoroSessionRepository
                .findSessionsInPeriod(userId, after);

        // Group by date
        Map<String, List<PomodoroSession>> byDate = new LinkedHashMap<>();
        sessions.forEach(s -> {
            String date = s.getCompletedAt()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            byDate.computeIfAbsent(date, k -> new ArrayList<>()).add(s);
        });

        List<PomodoroAnalyticsDto.DailySessionDto> dailySessions = byDate
                .entrySet().stream()
                .map(entry -> {
                    double avgMult = entry.getValue().stream()
                            .mapToDouble(PomodoroSession::getMultiplierApplied)
                            .average().orElse(0.0);
                    return PomodoroAnalyticsDto.DailySessionDto.builder()
                            .date(entry.getKey())
                            .count(entry.getValue().size())
                            .averageMultiplier(Math.round(avgMult * 100.0) / 100.0)
                            .build();
                })
                .toList();

        Integer bestStreak = pomodoroSessionRepository
                .findBestFlowStreak(userId);

        Long totalXp = pomodoroSessionRepository.sumTotalXp(userId);

        Double avgMultiplier = pomodoroSessionRepository
                .findAverageMultiplier(userId);

        return PomodoroAnalyticsDto.builder()
                .dailySessions(dailySessions)
                .bestFlowStreak(bestStreak != null ? bestStreak : 0)
                .totalSessions(sessions.size())
                .totalXpFromPomodoros(totalXp != null ? totalXp : 0)
                .averageMultiplier(avgMultiplier != null ?
                        Math.round(avgMultiplier * 100.0) / 100.0 : 0.0)
                .build();
    }

    @Transactional(readOnly = true)
    public ProgressionAnalyticsDto getProgressionAnalytics(
            Long userId, AnalyticsPeriod period) {

        LocalDateTime after = period.toStartDate();

        // 1. Convert LocalDateTime to Instant for the Task query
        Instant afterInstant = after.toInstant(
                java.time.ZoneOffset.systemDefault()
                        .getRules().getOffset(after)
        );

        // 2. Fetch both Pomodoro XP and Task XP
        List<Object[]> xpRaw = pomodoroSessionRepository.sumXpByDay(userId, after);
        List<Object[]> taskXpRaw = taskRepository.sumXpByDay(userId, afterInstant);

        // 3. Merge task XP and Pomodoro XP into combined daily totals
        Map<String, Long> combinedXp = new LinkedHashMap<>();

        // Add Pomodoro XP
        xpRaw.forEach(row ->
                combinedXp.merge(row[0].toString(),
                        ((Number) row[1]).longValue(), Long::sum));

        // Add Task XP
        taskXpRaw.forEach(row ->
                combinedXp.merge(row[0].toString(),
                        ((Number) row[1]).longValue(), Long::sum));

        // 4. Map the merged data to your DTO
        List<ProgressionAnalyticsDto.PeriodXpDto> xpByPeriod = combinedXp
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> ProgressionAnalyticsDto.PeriodXpDto.builder()
                        .label(e.getKey())
                        .xp(e.getValue())
                        .build())
                .toList();

        // 5. Level-up history (Remains completely unchanged)
        List<LevelUp> levelUps = period == AnalyticsPeriod.ALL_TIME
                ? levelUpRepository.findByUserIdOrderByAchievedAtAsc(userId)
                : levelUpRepository
                .findByUserIdAndAchievedAtAfterOrderByAchievedAtAsc(
                        userId, after);

        List<ProgressionAnalyticsDto.LevelUpEventDto> levelUpEvents =
                levelUps.stream()
                        .map(lu -> ProgressionAnalyticsDto.LevelUpEventDto.builder()
                                .level(lu.getLevelReached())
                                .achievedAt(lu.getAchievedAt()
                                        .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                                .triggeredBy(lu.getTriggeredBy())
                                .build())
                        .toList();

        return ProgressionAnalyticsDto.builder()
                .xpByPeriod(xpByPeriod)
                .levelUps(levelUpEvents)
                .build();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userId));
    }
}