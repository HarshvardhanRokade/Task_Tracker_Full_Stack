package com.harsh.task.service;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;

import java.util.List;
import java.util.UUID;

public interface TaskService {

    Task createTask(CreateTaskRequest request);

    List<Task> listTasks();

    Task updateTask(UUID taskId , UpdateTaskRequest request);

    void deleteTask(UUID taskId);

    List<Task> filterTasks(String search , TaskStatus status , TaskPriority priority);
}
