package com.harsh.task.entity;

import com.harsh.task.engine.PauseTier;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false , unique = true , length = 50)
    private String username;

    @Column(nullable = false , unique = true , length = 100)
    private String email;

    @Column(nullable = false , length = 255)
    private String password;

    @Column(nullable = false , length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(nullable = false , updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer currentXp = 0;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer totalXp = 0;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 1")
    @Builder.Default
    private Integer level = 1;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer gemBalance = 0;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer streakFreezesOwned = 0;

    @Column
    private LocalDateTime lastActiveTimestamp;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer currentDailyStreak = 0;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer longestDailyStreak = 0;

    @Column(nullable = false , columnDefinition = "INT UNSIGNED DEFAULT 0")
    @Builder.Default
    private Integer pomodoroFlowStreak = 0;

    @Column
    private LocalDateTime lastPomodoroTime;

    @Column
    private LocalDateTime sessionDeadline;

    @Column
    private LocalDateTime pauseStartTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "worst_pause_tier")
    private PauseTier worstPauseTier;

    @PrePersist
    protected void onCreate(){
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }

}
