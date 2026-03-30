package com.harsh.task.leaderboard;

import com.harsh.task.entity.PomodoroSession;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.entity.User;
import com.harsh.task.entity.WeeklyScore;
import com.harsh.task.repository.PomodoroSessionRepository;
import com.harsh.task.repository.TaskRepository;
import com.harsh.task.repository.WeeklyScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyScoreCalculator {

    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final WeeklyScoreRepository weeklyScoreRepository;

    // Cache validity — 1 hour
    private static final int CACHE_VALID_MINUTES = 60;

    // Points constants
    private static final int POINTS_HIGH_TASK   = 3;
    private static final int POINTS_MEDIUM_TASK  = 2;
    private static final int POINTS_LOW_TASK     = 1;
    private static final int POINTS_BASE_POMODORO = 2;
    private static final int POINTS_CONSISTENCY_DAY = 5;

    // --- Public entry point ---
    @Transactional
    public WeeklyScore getOrCalculate(User user, LocalDate weekStart) {
        // Check cache first
        var cached = weeklyScoreRepository
                .findByUserIdAndWeekStartDate(user.getId(), weekStart);

        if (cached.isPresent()) {
            WeeklyScore score = cached.get();
            // Return cached if still fresh
            if (score.getCalculatedAt()
                    .isAfter(LocalDateTime.now()
                            .minusMinutes(CACHE_VALID_MINUTES))) {
                return score;
            }
            // Cache stale — recalculate and update
            return recalculate(user, weekStart, score);
        }

        // No cache — calculate fresh
        return recalculate(user, weekStart, null);
    }

    // --- Core calculation ---
    private WeeklyScore recalculate(User user, LocalDate weekStart,
                                    WeeklyScore existing) {
        LocalDate weekEnd = weekStart.plusDays(7);
        Instant weekStartInstant = weekStart.atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        Instant weekEndInstant   = weekEnd.atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        LocalDateTime weekStartDt = weekStart.atStartOfDay();
        LocalDateTime weekEndDt   = weekEnd.atStartOfDay();

        // --- 1. Task Points ---
        List<Task> weekTasks = taskRepository
                .findCompletedTasksInPeriod(
                        user.getId(), weekStartInstant, weekEndInstant
                );

        int taskPoints = weekTasks.stream()
                .mapToInt(task -> {
                    if (task.getPriority() == TaskPriority.HIGH)   return POINTS_HIGH_TASK;
                    if (task.getPriority() == TaskPriority.MEDIUM) return POINTS_MEDIUM_TASK;
                    return POINTS_LOW_TASK;
                })
                .sum();

        // --- 2. Pomodoro Points ---
        List<PomodoroSession> weekSessions = pomodoroSessionRepository
                .findSessionsInPeriod(user.getId(), weekStartDt)
                .stream()
                .filter(s -> s.getCompletedAt().isBefore(weekEndDt))
                .filter(s -> !s.isWasDegraded())
                .collect(Collectors.toList());

        // Group sessions by date
        Map<LocalDate, List<PomodoroSession>> sessionsByDay =
                weekSessions.stream()
                        .collect(Collectors.groupingBy(
                                s -> s.getCompletedAt().toLocalDate()
                        ));

        int pomodoroPoints = 0;
        for (List<PomodoroSession> daySessions : sessionsByDay.values()) {
            // Sort by time to count consecutive correctly
            daySessions.sort(
                    Comparator.comparing(PomodoroSession::getCompletedAt)
            );
            // First session = 2 pts, second = 3 pts, third = 4 pts, etc.
            for (int i = 0; i < daySessions.size(); i++) {
                pomodoroPoints += POINTS_BASE_POMODORO + i;
            }
        }

        // --- 3. Consistency Points ---
        // A day is active if it has tasks OR Pomodoro sessions
        Map<LocalDate, Long> tasksByDay = weekTasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getUpdated()
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate(),
                        Collectors.counting()
                ));

        // Merge task dates and session dates
        java.util.Set<LocalDate> activeDays = new java.util.HashSet<>();
        activeDays.addAll(tasksByDay.keySet());
        activeDays.addAll(sessionsByDay.keySet());

        int daysActive        = activeDays.size();
        int consistencyPoints = daysActive * POINTS_CONSISTENCY_DAY;

        // --- 4. Totals ---
        int totalScore = taskPoints + pomodoroPoints + consistencyPoints;

        // --- 5. Save or update cache ---
        WeeklyScore score = existing != null ? existing : WeeklyScore.builder()
                .user(user)
                .weekStartDate(weekStart)
                .build();

        score.setTotalScore(totalScore);
        score.setTaskPoints(taskPoints);
        score.setPomodoroPoints(pomodoroPoints);
        score.setConsistencyPoints(consistencyPoints);
        score.setDaysActive(daysActive);
        score.setTasksCompleted(weekTasks.size());
        score.setPomodorosCompleted(weekSessions.size());
        score.setCalculatedAt(LocalDateTime.now());

        return weeklyScoreRepository.save(score);
    }

    // --- Helper: get current week's Monday ---
    public static LocalDate getCurrentWeekStart() {
        return LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(
                        DayOfWeek.MONDAY));
    }

    // --- Helper: get previous week's Monday ---
    public static LocalDate getPreviousWeekStart() {
        return getCurrentWeekStart().minusWeeks(1);
    }
}