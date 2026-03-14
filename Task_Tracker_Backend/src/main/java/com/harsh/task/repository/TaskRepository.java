package com.harsh.task.repository;

import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.w3c.dom.stylesheets.LinkStyle;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.tags tag WHERE " +
            "t.user.id = :userId AND " + // <--- THIS WAS MISSING!
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

    @Query("SELECT t FROM Task t JOIN FETCH t.user WHERE t.reminderDateTime <= :now AND t.reminderSent = false AND t.status = :status")
    List<Task> findByReminderDateTimeLessThanEqualAndReminderSentFalseAndStatus(@Param("now") LocalDateTime now, @Param("status") TaskStatus status);

    // Ownership-safe list fetch
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
}
