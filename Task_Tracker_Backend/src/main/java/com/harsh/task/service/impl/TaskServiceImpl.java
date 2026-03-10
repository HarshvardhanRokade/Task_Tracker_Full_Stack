package com.harsh.task.service.impl;

import com.harsh.task.domain.CreateTaskRequest;
import com.harsh.task.domain.UpdateTaskRequest;
import com.harsh.task.domain.dto.TaskDto;
import com.harsh.task.entity.Tag;
import com.harsh.task.entity.Task;
import com.harsh.task.entity.TaskPriority;
import com.harsh.task.entity.TaskStatus;
import com.harsh.task.exception.TaskNotFoundException;
import com.harsh.task.repository.TagRepository;
import com.harsh.task.repository.TaskRepository;
import com.harsh.task.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TagRepository tagRepository;

    public TaskServiceImpl (TaskRepository taskRepository , TagRepository tagRepository){
        this.taskRepository = taskRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public Task createTask(CreateTaskRequest request) {
        Instant now = Instant.now();
        Set<Tag> taskTags = getOrCreateTags(request.tags());

        Task newTask = new Task(
                null,
                request.title(),
                request.description(),
                request.dueDate(),
                request.reminderDateTime(),
                false,
                TaskStatus.OPEN,
                request.priority(),
                now,
                now,
                0,
                taskTags
        );

        return taskRepository.save(newTask);
    }

    @Override
    public Page<Task> listTasks(Pageable pageable) {
        return taskRepository.findAll(pageable);
    }

    @Override
    public Task updateTask(UUID taskId, UpdateTaskRequest request) {
        Task existingTask = taskRepository.findById(taskId).orElseThrow(() -> new TaskNotFoundException(taskId));

        existingTask.setTitle(request.title());
        existingTask.setDescription(request.description());
        existingTask.setDueDate(request.dueDate());

        existingTask.setReminderDateTime(request.reminderDateTime());
        existingTask.setReminderSent(false);

        existingTask.setStatus(request.status());
        existingTask.setPriority(request.priority());
        existingTask.setUpdated(Instant.now());

        Set<Tag> taskTags = getOrCreateTags(request.tags());
        existingTask.setTags(taskTags);

        return taskRepository.save(existingTask);
    }

    @Override
    public void deleteTask(UUID taskId) {
        taskRepository.deleteById(taskId);
    }

    @Override
    public Page<Task> filterTasks(String search, TaskStatus status, TaskPriority priority , String tag ,Pageable pageable) {
        return taskRepository.filterTasks(search , status , priority , tag ,pageable);
    }

    @Override
    public Task completePomodoro(UUID taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        int currentCount = task.getPomodoroCount() == null ? 0 : task.getPomodoroCount();
        task.setPomodoroCount(currentCount + 1);

        return taskRepository.save(task);
    }


    private Set<Tag> getOrCreateTags(List<String> tagNames){
        if(tagNames == null  ||  tagNames.isEmpty()){
            return new HashSet<>();
        }

        Set<Tag> tags = new HashSet<>();
        for(String name : tagNames){
            String trimmedName = name.trim();
            if(trimmedName.isEmpty()) continue;

            Tag tag = tagRepository.findByNameIgnoreCase(trimmedName).
                    orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(trimmedName);
                        newTag.setColor("#3b82f6");
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        return tags;
    }

    @Override
    public Task getTask(UUID taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    @Override
    public Task updateTaskStatus(UUID taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setStatus(status);
        task.setUpdated(Instant.now());

        return taskRepository.save(task);
    }


}
