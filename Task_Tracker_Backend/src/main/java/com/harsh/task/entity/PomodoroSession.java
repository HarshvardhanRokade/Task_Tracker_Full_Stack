package com.harsh.task.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pomodoro_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PomodoroSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "xp_earned", nullable = false)
    private int xpEarned;

    @Column(name = "gems_earned", nullable = false)
    private int gemsEarned;

    @Column(name = "multiplier_applied", nullable = false)
    private double multiplierApplied;

    @Column(name = "flow_streak_at_completion", nullable = false)
    private int flowStreakAtCompletion;

    @Column(name = "was_degraded", nullable = false)
    private boolean wasDegraded;

    @Column(name = "boost_consumed", nullable = false)
    private boolean boostConsumed;
}