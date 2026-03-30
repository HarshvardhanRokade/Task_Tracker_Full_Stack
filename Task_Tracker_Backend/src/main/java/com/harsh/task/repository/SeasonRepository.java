package com.harsh.task.repository;

import com.harsh.task.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SeasonRepository extends JpaRepository<Season, UUID> {

    Optional<Season> findByIsActiveTrue();

    Optional<Season> findBySeasonNumber(int seasonNumber);
}