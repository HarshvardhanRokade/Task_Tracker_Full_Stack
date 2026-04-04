package com.harsh.task.leaderboard;

import com.harsh.task.entity.PomodoroSession;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
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
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyScoreCalculator {

    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final WeeklyScoreRepository weeklyScoreRepository;

    // --- Cache ---
    private static final int CACHE_VALID_MINUTES = 60;

    // --- Scoring Constants ---
    private static final int POINTS_HIGH_TASK      = 3;
    private static final int POINTS_MEDIUM_TASK    = 2;
    private static final int POINTS_LOW_TASK       = 1;
    private static final int POINTS_BASE_POMODORO  = 2;
    private static final int POINTS_CONSISTENCY    = 5;

    // --- Defense 1: Daily completion caps per priority ---
    private static final int MAX_HIGH_PER_DAY   = 3;
    private static final int MAX_MEDIUM_PER_DAY = 5;
    private static final int MAX_LOW_PER_DAY    = 10;

    // --- Defense 2: Minimum task age before scoring ---
    private static final int MIN_TASK_AGE_MINUTES = 60;

    // ---------------------------------------------------
    // Public Entry Point
    // ---------------------------------------------------

    @Transactional
    public WeeklyScore getOrCalculate(User user, LocalDate weekStart) {
        var cached = weeklyScoreRepository
                .findByUserIdAndWeekStartDate(user.getId(), weekStart);

        if (cached.isPresent()) {
            WeeklyScore score = cached.get();
            if (score.getCalculatedAt()
                    .isAfter(LocalDateTime.now()
                            .minusMinutes(CACHE_VALID_MINUTES))) {
                return score; // Still fresh
            }
            return recalculate(user, weekStart, score);
        }

        return recalculate(user, weekStart, null);
    }

    // ---------------------------------------------------
    // Core Calculation
    // ---------------------------------------------------

    private WeeklyScore recalculate(User user, LocalDate weekStart,
                                    WeeklyScore existing) {
        LocalDate weekEnd = weekStart.plusDays(7);

        Instant weekStartInstant = weekStart.atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        Instant weekEndInstant   = weekEnd.atStartOfDay()
                .toInstant(ZoneOffset.UTC);

        LocalDateTime weekStartDt = weekStart.atStartOfDay();
        LocalDateTime weekEndDt   = weekEnd.atStartOfDay();

        // ── 1. Fetch raw tasks completed this week ──────────────────
        List<Task> rawTasks = taskRepository.findCompletedTasksInPeriod(
                user.getId(), weekStartInstant, weekEndInstant
        );

        // ── 2. Defense 2 — filter out tasks completed too quickly ───
        List<Task> validTasks = rawTasks.stream()
                .filter(this::isTaskAgeValid)
                .collect(Collectors.toList());

        int skippedByAge = rawTasks.size() - validTasks.size();
        if (skippedByAge > 0) {
            log.info("User {} — {} task(s) excluded from scoring " +
                            "(completed within {} minutes of creation)",
                    user.getId(), skippedByAge, MIN_TASK_AGE_MINUTES);
        }

        // ── 3. Defense 1 — apply daily caps and calculate points ────
        int taskPoints = calculateCappedTaskPoints(validTasks);

        // ── 4. Fetch Pomodoro sessions this week ────────────────────
        List<PomodoroSession> weekSessions =
                pomodoroSessionRepository
                        .findSessionsInPeriod(user.getId(), weekStartDt)
                        .stream()
                        .filter(s -> s.getCompletedAt().isBefore(weekEndDt))
                        .filter(s -> !s.isWasDegraded())
                        .collect(Collectors.toList());

        // ── 5. Calculate Pomodoro points with consecutive bonus ─────
        int pomodoroPoints = calculatePomodoroPoints(weekSessions);

        // ── 6. Consistency — days with any activity ─────────────────
        Set<LocalDate> activeDays = buildActiveDaysSet(
                validTasks, weekSessions
        );
        int daysActive        = activeDays.size();
        int consistencyPoints = daysActive * POINTS_CONSISTENCY;

        // ── 7. Total ────────────────────────────────────────────────
        int totalScore = taskPoints + pomodoroPoints + consistencyPoints;

        log.debug("User {} week {}: tasks={} pts={}, " +
                        "pomodoro={} pts={}, days={} consistency={}, " +
                        "total={}",
                user.getId(), weekStart,
                validTasks.size(), taskPoints,
                weekSessions.size(), pomodoroPoints,
                daysActive, consistencyPoints,
                totalScore);

        // ── 8. Save / update cache ──────────────────────────────────
        WeeklyScore score = existing != null
                ? existing
                : WeeklyScore.builder()
                .user(user)
                .weekStartDate(weekStart)
                .build();

        score.setTotalScore(totalScore);
        score.setTaskPoints(taskPoints);
        score.setPomodoroPoints(pomodoroPoints);
        score.setConsistencyPoints(consistencyPoints);
        score.setDaysActive(daysActive);
        score.setTasksCompleted(validTasks.size());
        score.setPomodorosCompleted(weekSessions.size());
        score.setCalculatedAt(LocalDateTime.now());

        return weeklyScoreRepository.save(score);
    }

    // ---------------------------------------------------
    // Defense 1 — Capped Task Points
    // ---------------------------------------------------

    private int calculateCappedTaskPoints(List<Task> tasks) {

        // Group by completion date then by priority
        Map<LocalDate, Map<TaskPriority, List<Task>>>
                tasksByDayAndPriority = tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getUpdated()
                                .atZone(ZoneOffset.UTC)
                                .toLocalDate(),
                        Collectors.groupingBy(Task::getPriority)
                ));

        int totalPoints = 0;

        for (var dayEntry : tasksByDayAndPriority.entrySet()) {
            LocalDate day              = dayEntry.getKey();
            Map<TaskPriority, List<Task>> byPriority = dayEntry.getValue();

            int highRaw   = byPriority
                    .getOrDefault(TaskPriority.HIGH,   List.of()).size();
            int mediumRaw = byPriority
                    .getOrDefault(TaskPriority.MEDIUM, List.of()).size();
            int lowRaw    = byPriority
                    .getOrDefault(TaskPriority.LOW,    List.of()).size();

            // Apply caps
            int highCapped   = Math.min(highRaw,   MAX_HIGH_PER_DAY);
            int mediumCapped = Math.min(mediumRaw, MAX_MEDIUM_PER_DAY);
            int lowCapped    = Math.min(lowRaw,    MAX_LOW_PER_DAY);

            int dayPoints = (highCapped   * POINTS_HIGH_TASK)
                    + (mediumCapped * POINTS_MEDIUM_TASK)
                    + (lowCapped    * POINTS_LOW_TASK);

            // Log if cap was applied
            if (highRaw > MAX_HIGH_PER_DAY
                    || mediumRaw > MAX_MEDIUM_PER_DAY
                    || lowRaw > MAX_LOW_PER_DAY) {
                log.info("User score cap applied on {}: " +
                                "HIGH {}->{}, MEDIUM {}->{}, LOW {}->{}",
                        day,
                        highRaw,   highCapped,
                        mediumRaw, mediumCapped,
                        lowRaw,    lowCapped);
            }

            totalPoints += dayPoints;
        }

        return totalPoints;
    }

    // ---------------------------------------------------
    // Defense 2 — Minimum Task Age Filter
    // ---------------------------------------------------

    private boolean isTaskAgeValid(Task task) {
        // Tasks with no creation timestamp pass through
        if (task.getCreated() == null) return true;

        long minutesOld = Duration.between(
                task.getCreated(),
                task.getUpdated()
        ).toMinutes();

        return minutesOld >= MIN_TASK_AGE_MINUTES;
    }

    // ---------------------------------------------------
    // Pomodoro Points — Consecutive Daily Bonus
    // ---------------------------------------------------

    private int calculatePomodoroPoints(
            List<PomodoroSession> sessions) {

        // Group by day
        Map<LocalDate, List<PomodoroSession>> sessionsByDay =
                sessions.stream()
                        .collect(Collectors.groupingBy(
                                s -> s.getCompletedAt().toLocalDate()
                        ));

        int totalPoints = 0;

        for (List<PomodoroSession> daySessions
                : sessionsByDay.values()) {
            // Sort by time so consecutive bonus is order-dependent
            daySessions.sort(Comparator.comparing(
                    PomodoroSession::getCompletedAt)
            );
            // Session 1 = 2 pts, session 2 = 3 pts, session 3 = 4 pts
            for (int i = 0; i < daySessions.size(); i++) {
                totalPoints += POINTS_BASE_POMODORO + i;
            }
        }

        return totalPoints;
    }

    // ---------------------------------------------------
    // Active Days — Union of Task and Pomodoro Days
    // ---------------------------------------------------

    private Set<LocalDate> buildActiveDaysSet(
            List<Task> tasks,
            List<PomodoroSession> sessions) {

        Set<LocalDate> activeDays = tasks.stream()
                .map(t -> t.getUpdated()
                        .atZone(ZoneOffset.UTC)
                        .toLocalDate())
                .collect(Collectors.toCollection(
                        java.util.HashSet::new));

        sessions.stream()
                .map(s -> s.getCompletedAt().toLocalDate())
                .forEach(activeDays::add);

        return activeDays;
    }

    // ---------------------------------------------------
    // Week Helpers
    // ---------------------------------------------------

    public static LocalDate getCurrentWeekStart() {
        return LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(
                        DayOfWeek.MONDAY));
    }

    public static LocalDate getPreviousWeekStart() {
        return getCurrentWeekStart().minusWeeks(1);
    }
}