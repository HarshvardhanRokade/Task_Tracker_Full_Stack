package com.harsh.task.domain;

import com.harsh.task.entity.TaskPriority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CreateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        LocalDateTime reminderDateTime,
        TaskPriority priority,
        List<String> tags
) {
}
