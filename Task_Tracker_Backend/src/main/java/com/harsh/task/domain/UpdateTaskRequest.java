package com.harsh.task.domain;

import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;

import java.time.LocalDate;

public record UpdateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority
) {
}
