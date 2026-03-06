package com.harsh.task.repository;

import com.harsh.task.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag , UUID> {

    Optional<Tag> findByNameIgnoreCase(String name);
}
