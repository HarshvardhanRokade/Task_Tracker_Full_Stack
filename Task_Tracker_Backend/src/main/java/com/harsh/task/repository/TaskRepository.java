package com.harsh.task.repository;

import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph; // ✨ NEW IMPORT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    // ✨ THE FIX: Eagerly fetch the tags collection in the same query
    @EntityGraph(attributePaths = {"tags"})
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.tags tag WHERE " +
            "t.user.id = :userId AND " +
            "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR t.status = :status) AND " +
            "(:priority IS NULL OR t.priority = :priority) AND " +
            "(:tag IS NULL OR tag.name = :tag)")
    Page<Task> filterTasks(
            @Param("userId") Long userId,
            @Param("search") String search,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("tag") String tag,
            Pageable pageable
    );

    // ✨ THE FIX: Eagerly fetch the tags collection here too
    @EntityGraph(attributePaths = {"tags"})
    Page<Task> findByUserId(Long userId, Pageable pageable);

    // Ownership-safe single fetch (prevents IDOR vulnerabilities)
    Optional<Task> findByIdAndUserId(UUID id, Long userId);

    @Query("SELECT t FROM Task t JOIN FETCH t.user " +
            "WHERE t.reminderDateTime <= :now " +
            "AND t.reminderSent = false " +
            "AND t.status = :status")
    List<Task> findPendingReminders(
            @Param("now") LocalDateTime now,
            @Param("status") TaskStatus status,
            Pageable pageable
    );

    // Daily completions count for analytics
    @Query("SELECT CAST(t.updated AS date), COUNT(t) FROM Task t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 'COMPLETED' " +
            "AND t.updated >= :after " +
            "GROUP BY CAST(t.updated AS date) " +
            "ORDER BY CAST(t.updated AS date) ASC")
    List<Object[]> countDailyCompletions(
            @Param("userId") Long userId,
            @Param("after") Instant after
    );

    // Count by priority
    @Query("SELECT t.priority, COUNT(t) FROM Task t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 'COMPLETED' " +
            "AND t.updated >= :after " +
            "GROUP BY t.priority")
    List<Object[]> countByPriority(
            @Param("userId") Long userId,
            @Param("after") Instant after
    );

    // Top tags on completed tasks
    @Query("SELECT tag.name, COUNT(t) FROM Task t " +
            "JOIN t.tags tag " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 'COMPLETED' " +
            "AND t.updated >= :after " +
            "GROUP BY tag.name " +
            "ORDER BY COUNT(t) DESC")
    List<Object[]> countTopTags(
            @Param("userId") Long userId,
            @Param("after") Instant after,
            Pageable pageable
    );

    // Total XP by Day
    @Query("SELECT DATE(t.updated), SUM(CASE " +
            "WHEN t.priority = 'HIGH' THEN 100 " +
            "WHEN t.priority = 'MEDIUM' THEN 75 " +
            "ELSE 50 END) " +
            "FROM Task t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 'COMPLETED' " +
            "AND t.updated >= :after " +
            "GROUP BY DATE(t.updated)")
    List<Object[]> sumXpByDay(
            @Param("userId") Long userId,
            @Param("after") Instant after
    );

    // Fetch completed tasks within a time period for score calculation
    @Query("SELECT t FROM Task t " +
            "WHERE t.user.id = :userId " +
            "AND t.status = 'COMPLETED' " +
            "AND t.updated >= :weekStart " +
            "AND t.updated < :weekEnd")
    List<Task> findCompletedTasksInPeriod(
            @Param("userId") Long userId,
            @Param("weekStart") Instant weekStart,
            @Param("weekEnd") Instant weekEnd
    );

    // Total completed tasks
    long countByUserIdAndStatus(Long userId, TaskStatus status);
}