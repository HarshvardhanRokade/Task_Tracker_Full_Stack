package com.harsh.task.repository;

import com.harsh.task.entity.SeasonResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SeasonResultRepository
        extends JpaRepository<SeasonResult, UUID> {

    List<SeasonResult> findBySeasonIdOrderByFinalRankAsc(UUID seasonId);

    List<SeasonResult> findByUserId(Long userId);
}