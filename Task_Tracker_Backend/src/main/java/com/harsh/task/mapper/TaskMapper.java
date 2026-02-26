package com.harsh.task.mapper;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.CreateTaskRequestDto;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.domain.dto.UpdateTaskRequestDto;
import com.harsh.task.entity.Task;

public interface TaskMapper {

    CreateTaskRequest fromDto (CreateTaskRequestDto dto);

    TaskDto toDto (Task task);

    UpdateTaskRequest fromDto (UpdateTaskRequestDto dto);
}
