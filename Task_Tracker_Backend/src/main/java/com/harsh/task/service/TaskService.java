package com.harsh.task.service;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    Task createTask(CreateTaskRequest request);

    Page<Task> listTasks(Pageable pageable);

    Task updateTask(UUID taskId , UpdateTaskRequest request);

    void deleteTask(UUID taskId);

    Page<Task> filterTasks(String search , TaskStatus status , TaskPriority priority , String tag ,Pageable pageable);

    Task completePomodoro(UUID taskId);

    Task getTask (UUID taskId);

    Task updateTaskStatus (UUID taskId , TaskStatus status);
}
