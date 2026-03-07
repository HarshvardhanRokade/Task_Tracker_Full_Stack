package com.harsh.task.domain.dto;

import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TaskDto(
        UUID id,
        String title,
        String description,
        LocalDate dueDate,
        LocalDateTime reminderDateTime,
        TaskStatus status,
        TaskPriority priority,
        Integer pomodoroCount,
        List<TagDto> tags
) {
}
