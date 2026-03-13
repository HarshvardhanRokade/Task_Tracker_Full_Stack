package com.harsh.task.service;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.GamificationResultDto;
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

    Page<Task> listTasks(Long userId ,Pageable pageable);

    Task updateTask(UUID taskId , UpdateTaskRequest request , Long userId);

    void deleteTask(UUID taskId , Long userId);

    Page<Task> filterTasks(Long userId , String search , TaskStatus status , TaskPriority priority , String tag ,Pageable pageable);

    Task completePomodoro(UUID taskId , Long userId);

    Task getTask (UUID taskId , Long userId);

    Task updateTaskStatus (UUID taskId , TaskStatus status , Long userId);

    GamificationResultDto completeTask(UUID taskId, Long userId);
}
