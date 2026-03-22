package com.harsh.task.repository;

import com.harsh.task.entity.LevelUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LevelUpRepository extends JpaRepository<LevelUp, UUID> {

    // All level-ups for a user within a period
    List<LevelUp> findByUserIdAndAchievedAtAfterOrderByAchievedAtAsc(
            Long userId, LocalDateTime after
    );

    // All level-ups ever for progression timeline
    List<LevelUp> findByUserIdOrderByAchievedAtAsc(Long userId);
}