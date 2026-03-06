package com.harsh.task.domain;

import com.harsh.task.entity.TaskPriority;

import java.time.LocalDate;
import java.util.List;

public record CreateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskPriority priority,
        List<String> tags
) {
}
