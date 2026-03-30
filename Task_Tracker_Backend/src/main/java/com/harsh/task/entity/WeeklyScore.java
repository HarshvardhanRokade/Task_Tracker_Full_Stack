package com.harsh.task.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weekly_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(name = "total_score", nullable = false)
    @Builder.Default
    private int totalScore = 0;

    @Column(name = "task_points", nullable = false)
    @Builder.Default
    private int taskPoints = 0;

    @Column(name = "pomodoro_points", nullable = false)
    @Builder.Default
    private int pomodoroPoints = 0;

    @Column(name = "consistency_points", nullable = false)
    @Builder.Default
    private int consistencyPoints = 0;

    @Column(name = "days_active", nullable = false)
    @Builder.Default
    private int daysActive = 0;

    @Column(name = "tasks_completed", nullable = false)
    @Builder.Default
    private int tasksCompleted = 0;

    @Column(name = "pomodoros_completed", nullable = false)
    @Builder.Default
    private int pomodorosCompleted = 0;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;
}