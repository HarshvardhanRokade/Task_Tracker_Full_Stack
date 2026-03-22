package com.harsh.task.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "level_ups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelUp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "level_reached", nullable = false)
    private int levelReached;

    @Column(name = "achieved_at", nullable = false)
    private LocalDateTime achievedAt;

    @Column(name = "xp_total_at_level_up", nullable = false)
    private int xpTotalAtLevelUp;

    @Column(name = "triggered_by", nullable = false, length = 20)
    private String triggeredBy; // "TASK" or "POMODORO"
}