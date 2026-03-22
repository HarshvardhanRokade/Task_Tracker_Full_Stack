package com.harsh.task.repository;

import com.harsh.task.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag , UUID> {

    Optional<Tag> findByNameIgnoreCase(String name);

    // ✨ NEW: Only returns tags attached to at least one OPEN task
    @Query("SELECT DISTINCT tag FROM Task t " +
            "JOIN t.tags tag " +
            "WHERE t.status = 'OPEN' " +
            "AND t.user.id = :userId " +
            "ORDER BY tag.name ASC")
    List<Tag> findTagsForOpenTasks(@Param("userId") Long userId);

    // Check if this tag is currently attached to any tasks
    @Query("SELECT COUNT(t) > 0 FROM Task t JOIN t.tags tag WHERE tag.id = :tagId")
    boolean isTagInUse(@Param("tagId") UUID tagId);
}
