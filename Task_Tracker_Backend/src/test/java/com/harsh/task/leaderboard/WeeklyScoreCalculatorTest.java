package com.harsh.task.leaderboard;

import com.harsh.task.entity.*;
import com.harsh.task.repository.PomodoroSessionRepository;
import com.harsh.task.repository.TaskRepository;
import com.harsh.task.repository.WeeklyScoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeeklyScoreCalculatorTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private PomodoroSessionRepository pomodoroSessionRepository;

    @Mock
    private WeeklyScoreRepository weeklyScoreRepository;

    @InjectMocks
    private WeeklyScoreCalculator calculator;

    private User testUser;
    private LocalDate weekStart;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("test_user").build();
        // A known Monday for testing
        weekStart = LocalDate.of(2026, 3, 30);
    }

    @Test
    void calculate_NoActivity_ReturnsZeroScore() {
        // Arrange
        when(weeklyScoreRepository.findByUserIdAndWeekStartDate(eq(1L), eq(weekStart)))
                .thenReturn(Optional.empty());
        when(taskRepository.findCompletedTasksInPeriod(eq(1L), any(Instant.class), any(Instant.class)))
                .thenReturn(List.of());
        when(pomodoroSessionRepository.findSessionsInPeriod(eq(1L), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(weeklyScoreRepository.save(any(WeeklyScore.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WeeklyScore result = calculator.getOrCalculate(testUser, weekStart);

        // Assert
        assertEquals(0, result.getTotalScore());
        assertEquals(0, result.getTaskPoints());
        assertEquals(0, result.getPomodoroPoints());
        assertEquals(0, result.getConsistencyPoints());
        assertEquals(0, result.getDaysActive());
    }

    @Test
    void calculate_MixedActivity_CalculatesCorrectly() {
        // Arrange
        when(weeklyScoreRepository.findByUserIdAndWeekStartDate(eq(1L), eq(weekStart)))
                .thenReturn(Optional.empty());

        // Create tasks (Day 1: 1 HIGH, 1 MEDIUM. Day 2: 1 LOW)
        Instant day1Inst = weekStart.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant day2Inst = weekStart.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        Task t1 = Task.builder().priority(TaskPriority.HIGH).updated(day1Inst).build(); // 3 pts
        Task t2 = Task.builder().priority(TaskPriority.MEDIUM).updated(day1Inst).build(); // 2 pts
        Task t3 = Task.builder().priority(TaskPriority.LOW).updated(day2Inst).build(); // 1 pt
        // Total Task Points expected = 6

        when(taskRepository.findCompletedTasksInPeriod(eq(1L), any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(t1, t2, t3));

        // Create Pomodoros (Day 1: 3 consecutive sessions. Day 3: 1 session)
        LocalDateTime day1Dt = weekStart.atStartOfDay();
        LocalDateTime day3Dt = weekStart.plusDays(2).atStartOfDay();

        PomodoroSession p1 = PomodoroSession.builder().completedAt(day1Dt.plusHours(1)).wasDegraded(false).build();
        PomodoroSession p2 = PomodoroSession.builder().completedAt(day1Dt.plusHours(2)).wasDegraded(false).build();
        PomodoroSession p3 = PomodoroSession.builder().completedAt(day1Dt.plusHours(3)).wasDegraded(false).build();
        // Day 1 Pomodoros = 2 + 3 + 4 = 9 pts

        PomodoroSession p4 = PomodoroSession.builder().completedAt(day3Dt).wasDegraded(false).build();
        // Day 3 Pomodoros = 2 pts
        // Total Pomodoro Points expected = 11

        when(pomodoroSessionRepository.findSessionsInPeriod(eq(1L), any(LocalDateTime.class)))
                .thenReturn(List.of(p1, p2, p3, p4));

        when(weeklyScoreRepository.save(any(WeeklyScore.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WeeklyScore result = calculator.getOrCalculate(testUser, weekStart);

        // Assert
        // Consistency: Active on Day 1 (Task+Pomo), Day 2 (Task), Day 3 (Pomo) = 3 days * 5 pts = 15 pts
        assertEquals(3, result.getDaysActive(), "Should have 3 active days");
        assertEquals(15, result.getConsistencyPoints(), "Consistency points should be 15");

        assertEquals(6, result.getTaskPoints(), "Task points should be 6 (3+2+1)");
        assertEquals(11, result.getPomodoroPoints(), "Pomodoro points should be 11 (9+2)");

        assertEquals(32, result.getTotalScore(), "Total score should be 32 (15+6+11)");

        verify(weeklyScoreRepository, times(1)).save(any(WeeklyScore.class));
    }

    @Test
    void calculate_CachedFreshScore_ReturnsWithoutRecalculating() {
        // Arrange
        WeeklyScore freshScore = WeeklyScore.builder()
                .totalScore(100)
                .calculatedAt(LocalDateTime.now().minusMinutes(10)) // Only 10 mins old
                .build();

        when(weeklyScoreRepository.findByUserIdAndWeekStartDate(eq(1L), eq(weekStart)))
                .thenReturn(Optional.of(freshScore));

        // Act
        WeeklyScore result = calculator.getOrCalculate(testUser, weekStart);

        // Assert
        assertEquals(100, result.getTotalScore());
        // Verify it never touched the task/pomodoro DBs because cache was fresh
        verify(taskRepository, never()).findCompletedTasksInPeriod(any(), any(), any());
    }
}