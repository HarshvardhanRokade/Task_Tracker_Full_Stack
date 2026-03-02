package com.harsh.task.repository;

import com.harsh.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByTitleContainingIgnoreCase(String keyword);
}
