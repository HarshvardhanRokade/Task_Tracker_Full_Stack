package com.harsh.task.repository;

import com.harsh.task.entity.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {

    // All sessions for a user within a time period
    List<PomodoroSession> findByUserIdAndCompletedAtAfterOrderByCompletedAtAsc(
            Long userId, LocalDateTime after
    );

    // Total session count for a user
    long countByUserId(Long userId);

    // Best flow streak ever achieved
    @Query("SELECT MAX(ps.flowStreakAtCompletion) FROM PomodoroSession ps WHERE ps.user.id = :userId")
    Integer findBestFlowStreak(@Param("userId") Long userId);

    // Average multiplier across all sessions
    @Query("SELECT AVG(ps.multiplierApplied) FROM PomodoroSession ps WHERE ps.user.id = :userId")
    Double findAverageMultiplier(@Param("userId") Long userId);

    // Sessions within a period grouped by date for the chart
    @Query("SELECT ps FROM PomodoroSession ps WHERE ps.user.id = :userId " +
            "AND ps.completedAt >= :after ORDER BY ps.completedAt ASC")
    List<PomodoroSession> findSessionsInPeriod(
            @Param("userId") Long userId,
            @Param("after") LocalDateTime after
    );
}