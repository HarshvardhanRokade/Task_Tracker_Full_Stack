package com.harsh.task.repository;

import com.harsh.task.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BadgeRepository extends JpaRepository<Badge, UUID> {

    Optional<Badge> findByBadgeKey(String badgeKey);

    List<Badge> findByCategory(String category);
}