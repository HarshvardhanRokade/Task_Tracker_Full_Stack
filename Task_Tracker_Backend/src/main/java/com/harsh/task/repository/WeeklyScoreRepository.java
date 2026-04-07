package com.harsh.task.repository;

import com.harsh.task.entity.WeeklyScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyScoreRepository
        extends JpaRepository<WeeklyScore, UUID> {

    // Find cached score for a user for a specific week
    Optional<WeeklyScore> findByUserIdAndWeekStartDate(
            Long userId, LocalDate weekStartDate
    );

    // Top N scores for a given week — the leaderboard query
    @Query("SELECT ws FROM WeeklyScore ws " +
            "WHERE ws.weekStartDate = :weekStart " +
            "AND ws.totalScore > 0 " +
            "ORDER BY ws.totalScore DESC")
    List<WeeklyScore> findTopByWeek(
            @Param("weekStart") LocalDate weekStart,
            org.springframework.data.domain.Pageable pageable
    );

    // All scores for a user across weeks — for history chart
    @Query("SELECT ws FROM WeeklyScore ws " +
            "WHERE ws.user.id = :userId " +
            "ORDER BY ws.weekStartDate DESC")
    List<WeeklyScore> findByUserIdOrderByWeekDesc(
            @Param("userId") Long userId,
            org.springframework.data.domain.Pageable pageable
    );

    // Season score — sum of weekly scores within a date range
    @Query("SELECT SUM(ws.totalScore) FROM WeeklyScore ws " +
            "WHERE ws.user.id = :userId " +
            "AND ws.weekStartDate >= :seasonStart " +
            "AND ws.weekStartDate <= :seasonEnd")
    Integer sumSeasonScore(
            @Param("userId") Long userId,
            @Param("seasonStart") LocalDate seasonStart,
            @Param("seasonEnd") LocalDate seasonEnd
    );

    // All users' season scores — for season leaderboard
    @Query("SELECT ws.user.id, SUM(ws.totalScore) " +
            "FROM WeeklyScore ws " +
            "WHERE ws.weekStartDate >= :seasonStart " +
            "AND ws.weekStartDate <= :seasonEnd " +
            "GROUP BY ws.user.id " +
            "ORDER BY SUM(ws.totalScore) DESC")
    List<Object[]> findSeasonScores(
            @Param("seasonStart") LocalDate seasonStart,
            @Param("seasonEnd") LocalDate seasonEnd,
            org.springframework.data.domain.Pageable pageable
    );
}