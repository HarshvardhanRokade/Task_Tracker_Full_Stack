package com.harsh.task.domain;

import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public record UpdateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority,
        List<String> tags
) {
}
