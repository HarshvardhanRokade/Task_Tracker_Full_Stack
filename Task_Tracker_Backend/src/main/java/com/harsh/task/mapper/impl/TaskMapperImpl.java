package com.harsh.task.mapper.impl;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.CreateTaskRequestDto;
import com.harsh.task.domain.dto.TagDto;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.domain.dto.UpdateTaskRequestDto;
import com.harsh.task.entity.Task;
import com.harsh.task.mapper.TaskMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public CreateTaskRequest fromDto(CreateTaskRequestDto dto) {
        return new CreateTaskRequest(
                dto.title(),
                dto.description(),
                dto.dueDate(),
                dto.priority(),
                dto.tags()
        );
    }

    @Override
    public TaskDto toDto(Task task) {
        if(null == task){
            return null;
        }

        List<TagDto> tagDtos = task.getTags().stream()
                .map(tag -> new TagDto(tag.getId(), tag.getName(), tag.getColor()))
                .toList();

        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getStatus(),
                task.getPriority(),
                task.getPomodoroCount(),
                tagDtos
        );
    }

    @Override
    public UpdateTaskRequest fromDto(UpdateTaskRequestDto dto) {
        return new UpdateTaskRequest(
                dto.title(),
                dto.description(),
                dto.dueDate(),
                dto.status(),
                dto.priority(),
                dto.tags()
        );
    }
}
