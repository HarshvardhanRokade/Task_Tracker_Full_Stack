package com.harsh.task.domain.dto;

import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskDto(
        UUID id,
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority,
        Integer pomodoroCount,
        List<TagDto> tags
) {
}
